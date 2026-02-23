import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const consoleTypes = sqliteTable('console_types', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export const consoles = sqliteTable('consoles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	consoleTypeId: integer('console_type_id')
		.notNull()
		.references(() => consoleTypes.id),
	serialNumber: text('serial_number'),
	purchasePrice: real('purchase_price').notNull(),
	purchasedAt: text('purchased_at'),
	salePrice: real('sale_price'),
	status: text('status', {
		enum: ['in_progress', 'sold_repaired', 'sold_unrepaired', 'parted_out']
	})
		.notNull()
		.default('in_progress'),
	repairSuccessful: integer('repair_successful'),
	repairNotes: text('repair_notes'),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`),
	closedAt: text('closed_at')
});

export const spareParts = sqliteTable('spare_parts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	unitCost: real('unit_cost').notNull(),
	quantity: integer('quantity').notNull().default(0),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export const sparePartConsoleTypes = sqliteTable(
	'spare_part_console_types',
	{
		sparePartId: integer('spare_part_id')
			.notNull()
			.references(() => spareParts.id, { onDelete: 'cascade' }),
		consoleTypeId: integer('console_type_id')
			.notNull()
			.references(() => consoleTypes.id, { onDelete: 'cascade' })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.sparePartId, table.consoleTypeId] })
	})
);

export const partAssignments = sqliteTable('part_assignments', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	consoleId: integer('console_id')
		.notNull()
		.references(() => consoles.id, { onDelete: 'cascade' }),
	sparePartId: integer('spare_part_id')
		.notNull()
		.references(() => spareParts.id),
	costAtAssignment: real('cost_at_assignment').notNull(),
	assignedAt: text('assigned_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

export const costEntries = sqliteTable('cost_entries', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	consoleId: integer('console_id')
		.notNull()
		.references(() => consoles.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	amount: real('amount').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(datetime('now'))`)
});

// Relations
export const consoleTypesRelations = relations(consoleTypes, ({ many }) => ({
	consoles: many(consoles),
	sparePartConsoleTypes: many(sparePartConsoleTypes)
}));

export const consolesRelations = relations(consoles, ({ one, many }) => ({
	consoleType: one(consoleTypes, {
		fields: [consoles.consoleTypeId],
		references: [consoleTypes.id]
	}),
	partAssignments: many(partAssignments),
	costEntries: many(costEntries)
}));

export const sparePartsRelations = relations(spareParts, ({ many }) => ({
	sparePartConsoleTypes: many(sparePartConsoleTypes),
	partAssignments: many(partAssignments)
}));

export const sparePartConsoleTypesRelations = relations(sparePartConsoleTypes, ({ one }) => ({
	sparePart: one(spareParts, {
		fields: [sparePartConsoleTypes.sparePartId],
		references: [spareParts.id]
	}),
	consoleType: one(consoleTypes, {
		fields: [sparePartConsoleTypes.consoleTypeId],
		references: [consoleTypes.id]
	})
}));

export const partAssignmentsRelations = relations(partAssignments, ({ one }) => ({
	console: one(consoles, {
		fields: [partAssignments.consoleId],
		references: [consoles.id]
	}),
	sparePart: one(spareParts, {
		fields: [partAssignments.sparePartId],
		references: [spareParts.id]
	})
}));

export const costEntriesRelations = relations(costEntries, ({ one }) => ({
	console: one(consoles, {
		fields: [costEntries.consoleId],
		references: [consoles.id]
	})
}));
