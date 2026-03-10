import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { consoles, costEntries, partAssignments, consoleTypes } from '$lib/server/schema';
import { sql, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const statusFilter = url.searchParams.get('status') ?? '';
	const typeFilter = url.searchParams.get('type') ?? '';
	const moddedFilter = url.searchParams.get('modded') ?? '';

	// Fetch all consoles with type name and cost aggregates
	const rows = await db
		.select({
			id: consoles.id,
			typeName: consoleTypes.name,
			consoleTypeId: consoles.consoleTypeId,
			serialNumber: consoles.serialNumber,
			purchasePrice: consoles.purchasePrice,
			purchasedAt: consoles.purchasedAt,
			salePrice: consoles.salePrice,
			status: consoles.status,
			createdAt: consoles.createdAt,
			closedAt: consoles.closedAt,
			isModded: consoles.isModded,
			partsCost: sql<number>`COALESCE((
				SELECT SUM(pa.cost_at_assignment)
				FROM part_assignments pa
				WHERE pa.console_id = ${consoles.id}
			), 0)`,
			entriesCost: sql<number>`COALESCE((
				SELECT SUM(ce.amount)
				FROM cost_entries ce
				WHERE ce.console_id = ${consoles.id}
			), 0)`
		})
		.from(consoles)
		.innerJoin(consoleTypes, eq(consoles.consoleTypeId, consoleTypes.id))
		.orderBy(sql`${consoles.purchasedAt} DESC`);

	let filtered = rows;
	if (statusFilter) {
		filtered = filtered.filter((r) => r.status === statusFilter);
	}
	if (typeFilter) {
		filtered = filtered.filter((r) => String(r.consoleTypeId) === typeFilter);
	}
	if (moddedFilter === '1') {
		filtered = filtered.filter((r) => r.isModded === 1);
	} else if (moddedFilter === '0') {
		filtered = filtered.filter((r) => r.isModded === 0);
	}

	const allTypes = await db.select().from(consoleTypes).orderBy(consoleTypes.name);

	return {
		consoles: filtered.map((r) => ({
			...r,
			totalCost: r.purchasePrice + r.partsCost + r.entriesCost
		})),
		allTypes,
		statusFilter,
		typeFilter,
		moddedFilter
	};
};
