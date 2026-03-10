import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { consoles, costEntries, partAssignments } from '$lib/server/schema';
import { fail, error, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) error(404, 'Console not found');

	const console_ = await db.query.consoles.findFirst({
		where: eq(consoles.id, id),
		with: { consoleType: true }
	});

	if (!console_) error(404, 'Console not found');
	if (console_.status !== 'in_progress') {
		redirect(303, `/consoles/${id}`);
	}

	// Calculate total cost
	const [partsCostRow] = await db
		.select({ total: sql<number>`COALESCE(SUM(${partAssignments.costAtAssignment}), 0)` })
		.from(partAssignments)
		.where(eq(partAssignments.consoleId, id));

	const [entriesCostRow] = await db
		.select({ total: sql<number>`COALESCE(SUM(${costEntries.amount}), 0)` })
		.from(costEntries)
		.where(eq(costEntries.consoleId, id));

	const totalCost =
		console_.purchasePrice + (partsCostRow?.total ?? 0) + (entriesCostRow?.total ?? 0);

	return { console: console_, totalCost };
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const status = data.get('status') as string;
		const salePriceRaw = data.get('sale_price') as string;
		const repairSuccessful = status === 'sold_repaired' ? 1 : 0;

		const validStatuses = ['sold_repaired', 'sold_unrepaired', 'parted_out'];
		if (!validStatuses.includes(status)) {
			return fail(400, { error: 'Invalid status' });
		}

		let salePrice: number | null = null;
		if (status === 'sold_repaired' || status === 'sold_unrepaired') {
			salePrice = parseFloat(salePriceRaw);
			if (isNaN(salePrice) || salePrice < 0) {
				return fail(400, { error: 'Sale price is required for sold consoles' });
			}
		}

		await db
			.update(consoles)
			.set({
				status: status as 'sold_repaired' | 'sold_unrepaired' | 'parted_out',
				salePrice,
				repairSuccessful,
				closedAt: new Date().toISOString().replace('T', ' ').split('.')[0]
			})
			.where(eq(consoles.id, id));

		redirect(303, `/consoles/${id}`);
	}
};
