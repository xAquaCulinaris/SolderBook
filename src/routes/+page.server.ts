import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { consoles, costEntries, partAssignments } from '$lib/server/schema';
import { sql, eq, and, ne } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const view = url.searchParams.get('view') ?? 'closed';
	const closedOnly = view === 'closed';

	// Build the WHERE condition
	const whereClause = closedOnly ? ne(consoles.status, 'in_progress') : undefined;

	// Aggregate metrics using raw SQL for efficiency
	const metricsQuery = db
		.select({
			totalPurchase: sql<number>`COALESCE(SUM(${consoles.purchasePrice}), 0)`,
			totalRevenue: sql<number>`COALESCE(SUM(${consoles.salePrice}), 0)`,
			count: sql<number>`COUNT(*)`
		})
		.from(consoles);

	const partsCostQuery = db
		.select({
			total: sql<number>`COALESCE(SUM(${partAssignments.costAtAssignment}), 0)`
		})
		.from(partAssignments)
		.innerJoin(consoles, eq(partAssignments.consoleId, consoles.id));

	const costEntriesQuery = db
		.select({
			total: sql<number>`COALESCE(SUM(${costEntries.amount}), 0)`
		})
		.from(costEntries)
		.innerJoin(consoles, eq(costEntries.consoleId, consoles.id));

	// Status counts (always all consoles)
	const statusCountsQuery = db
		.select({
			status: consoles.status,
			count: sql<number>`COUNT(*)`
		})
		.from(consoles)
		.groupBy(consoles.status);

	// Recent consoles (last 10)
	const recentQuery = db.query.consoles.findMany({
		with: { consoleType: true },
		orderBy: (c, { desc }) => [desc(c.createdAt)],
		limit: 10
	});

	const [statusCounts, recent] = await Promise.all([statusCountsQuery, recentQuery]);

	// Apply filter for metrics
	let metrics, partsCost, entriesCost;
	if (closedOnly) {
		[metrics, partsCost, entriesCost] = await Promise.all([
			metricsQuery.where(ne(consoles.status, 'in_progress')),
			partsCostQuery.where(ne(consoles.status, 'in_progress')),
			costEntriesQuery.where(ne(consoles.status, 'in_progress'))
		]);
	} else {
		[metrics, partsCost, entriesCost] = await Promise.all([
			metricsQuery,
			partsCostQuery,
			costEntriesQuery
		]);
	}

	const totalPurchase = metrics[0]?.totalPurchase ?? 0;
	const totalRevenue = metrics[0]?.totalRevenue ?? 0;
	const totalPartsCost = partsCost[0]?.total ?? 0;
	const totalEntriesCost = entriesCost[0]?.total ?? 0;
	const totalInvested = totalPurchase + totalPartsCost + totalEntriesCost;
	const netPnl = totalRevenue - totalInvested;

	const statusMap: Record<string, number> = {};
	for (const row of statusCounts) {
		statusMap[row.status] = row.count;
	}

	return {
		view,
		metrics: {
			totalInvested,
			totalRevenue,
			netPnl,
			consoleCount: metrics[0]?.count ?? 0
		},
		statusCounts: {
			in_progress: statusMap['in_progress'] ?? 0,
			sold_repaired: statusMap['sold_repaired'] ?? 0,
			sold_unrepaired: statusMap['sold_unrepaired'] ?? 0,
			parted_out: statusMap['parted_out'] ?? 0
		},
		recent
	};
};
