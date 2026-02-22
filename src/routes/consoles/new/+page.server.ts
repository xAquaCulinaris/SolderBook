import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { consoleTypes, consoles } from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const types = await db.select().from(consoleTypes).orderBy(consoleTypes.name);
	return { types };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const consoleTypeName = (data.get('console_type') as string)?.trim();
		const purchasePriceRaw = data.get('purchase_price') as string;
		const serialNumber = (data.get('serial_number') as string)?.trim() || null;

		if (!consoleTypeName) {
			return fail(400, { error: 'Console type is required' });
		}

		const purchasePrice = parseFloat(purchasePriceRaw);
		if (isNaN(purchasePrice) || purchasePrice < 0) {
			return fail(400, { error: 'Valid purchase price is required' });
		}

		// Find or create console type
		let typeId: number;
		const existing = await db
			.select()
			.from(consoleTypes)
			.where(eq(consoleTypes.name, consoleTypeName))
			.limit(1);

		if (existing.length > 0) {
			typeId = existing[0].id;
		} else {
			const [newType] = await db
				.insert(consoleTypes)
				.values({ name: consoleTypeName })
				.returning({ id: consoleTypes.id });
			typeId = newType.id;
		}

		const [newConsole] = await db
			.insert(consoles)
			.values({
				consoleTypeId: typeId,
				purchasePrice,
				serialNumber
			})
			.returning({ id: consoles.id });

		redirect(303, `/consoles/${newConsole.id}`);
	}
};
