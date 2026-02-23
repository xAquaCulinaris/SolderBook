import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import {
	consoles,
	consoleTypes,
	partAssignments,
	costEntries,
	spareParts,
	sparePartConsoleTypes
} from '$lib/server/schema';
import { fail, error } from '@sveltejs/kit';
import { eq, and, gt, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) error(404, 'Console not found');

	const console_ = await db.query.consoles.findFirst({
		where: eq(consoles.id, id),
		with: { consoleType: true }
	});

	if (!console_) error(404, 'Console not found');

	// Part assignments with part names
	const assignments = await db
		.select({
			id: partAssignments.id,
			sparePartId: partAssignments.sparePartId,
			partName: spareParts.name,
			costAtAssignment: partAssignments.costAtAssignment,
			assignedAt: partAssignments.assignedAt
		})
		.from(partAssignments)
		.innerJoin(spareParts, eq(partAssignments.sparePartId, spareParts.id))
		.where(eq(partAssignments.consoleId, id))
		.orderBy(partAssignments.assignedAt);

	// Cost entries
	const costs = await db
		.select()
		.from(costEntries)
		.where(eq(costEntries.consoleId, id))
		.orderBy(costEntries.createdAt);

	// Compatible spare parts in stock (filtered by console type)
	const compatibleParts = await db
		.select({
			id: spareParts.id,
			name: spareParts.name,
			unitCost: spareParts.unitCost,
			quantity: spareParts.quantity
		})
		.from(spareParts)
		.innerJoin(sparePartConsoleTypes, eq(spareParts.id, sparePartConsoleTypes.sparePartId))
		.where(
			and(
				eq(sparePartConsoleTypes.consoleTypeId, console_.consoleTypeId),
				gt(spareParts.quantity, 0)
			)
		)
		.orderBy(spareParts.name);

	const partsCost = assignments.reduce((sum, a) => sum + a.costAtAssignment, 0);
	const entriesCost = costs.reduce((sum, c) => sum + c.amount, 0);
	const totalCost = console_.purchasePrice + partsCost + entriesCost;

	return {
		console: console_,
		assignments,
		costs,
		compatibleParts,
		totalCost
	};
};

export const actions: Actions = {
	updateNotes: async ({ params, request }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const repairNotes = (data.get('repair_notes') as string) ?? '';

		await db.update(consoles).set({ repairNotes }).where(eq(consoles.id, id));
		return { success: true };
	},

	updateSerial: async ({ params, request }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const serialNumber = (data.get('serial_number') as string)?.trim() || null;

		await db.update(consoles).set({ serialNumber }).where(eq(consoles.id, id));
		return { success: true };
	},

	addCost: async ({ params, request }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const label = (data.get('label') as string)?.trim();
		const amountRaw = data.get('amount') as string;

		if (!label) return fail(400, { addCostError: 'Label is required' });

		const amount = parseFloat(amountRaw);
		if (isNaN(amount) || amount <= 0) {
			return fail(400, { addCostError: 'Valid amount is required' });
		}

		await db.insert(costEntries).values({ consoleId: id, label, amount });
		return { success: true };
	},

	assignPart: async ({ params, request }) => {
		const id = parseInt(params.id);
		const data = await request.formData();
		const sparePartId = parseInt(data.get('spare_part_id') as string);

		if (isNaN(sparePartId)) return fail(400, { assignError: 'Select a part' });

		// Get current part and check stock
		const [part] = await db.select().from(spareParts).where(eq(spareParts.id, sparePartId));
		if (!part) return fail(404, { assignError: 'Part not found' });
		if (part.quantity <= 0) return fail(400, { assignError: 'Part is out of stock' });

		// Insert assignment and decrement stock in a transaction
		db.transaction((tx) => {
			tx.insert(partAssignments).values({
				consoleId: id,
				sparePartId,
				costAtAssignment: part.unitCost
			}).run();
			tx.update(spareParts)
				.set({ quantity: sql`${spareParts.quantity} - 1` })
				.where(eq(spareParts.id, sparePartId))
				.run();
		});

		return { success: true };
	},

	deleteCost: async ({ params, request }) => {
		const data = await request.formData();
		const costId = parseInt(data.get('cost_id') as string);
		if (!isNaN(costId)) {
			await db.delete(costEntries).where(eq(costEntries.id, costId));
		}
		return { success: true };
	},

	deleteAssignment: async ({ params, request }) => {
		const data = await request.formData();
		const assignmentId = parseInt(data.get('assignment_id') as string);
		if (isNaN(assignmentId)) return fail(400, { assignError: 'Invalid assignment' });

		const [assignment] = await db
			.select()
			.from(partAssignments)
			.where(eq(partAssignments.id, assignmentId));
		if (!assignment) return fail(404, { assignError: 'Assignment not found' });

		db.transaction((tx) => {
			tx.delete(partAssignments).where(eq(partAssignments.id, assignmentId)).run();
			tx.update(spareParts)
				.set({ quantity: sql`${spareParts.quantity} + 1` })
				.where(eq(spareParts.id, assignment.sparePartId))
				.run();
		});

		return { success: true };
	},

	reopen: async ({ params }) => {
		const id = parseInt(params.id);
		await db
			.update(consoles)
			.set({ status: 'in_progress', closedAt: null, salePrice: null, repairSuccessful: null })
			.where(eq(consoles.id, id));
		return { success: true };
	}
};
