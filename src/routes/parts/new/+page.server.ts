import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { consoleTypes, spareParts, sparePartConsoleTypes } from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const types = await db.select().from(consoleTypes).orderBy(consoleTypes.name);
	return { types };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const unitCostRaw = data.get('unit_cost') as string;
		const quantityRaw = data.get('quantity') as string;
		const typeIds = data.getAll('console_type_ids').map((v) => parseInt(v as string));

		if (!name) return fail(400, { error: 'Name is required' });

		const unitCost = parseFloat(unitCostRaw);
		if (isNaN(unitCost) || unitCost < 0) {
			return fail(400, { error: 'Valid unit cost is required' });
		}

		const quantity = parseInt(quantityRaw);
		if (isNaN(quantity) || quantity < 0) {
			return fail(400, { error: 'Valid quantity is required' });
		}

		const [newPart] = await db
			.insert(spareParts)
			.values({ name, unitCost, quantity })
			.returning({ id: spareParts.id });

		if (typeIds.length > 0) {
			await db.insert(sparePartConsoleTypes).values(
				typeIds
					.filter((id) => !isNaN(id))
					.map((consoleTypeId) => ({
						sparePartId: newPart.id,
						consoleTypeId
					}))
			);
		}

		redirect(303, '/parts');
	}
};
