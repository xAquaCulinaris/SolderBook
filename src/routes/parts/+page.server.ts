import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { spareParts, sparePartConsoleTypes, consoleTypes } from '$lib/server/schema';
import { eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const parts = await db
		.select({
			id: spareParts.id,
			name: spareParts.name,
			unitCost: spareParts.unitCost,
			quantity: spareParts.quantity,
			createdAt: spareParts.createdAt,
			compatibleTypes: sql<string>`GROUP_CONCAT(${consoleTypes.name}, ', ')`
		})
		.from(spareParts)
		.leftJoin(sparePartConsoleTypes, eq(spareParts.id, sparePartConsoleTypes.sparePartId))
		.leftJoin(consoleTypes, eq(sparePartConsoleTypes.consoleTypeId, consoleTypes.id))
		.groupBy(spareParts.id)
		.orderBy(spareParts.name);

	return { parts };
};
