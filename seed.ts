import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import {
	consoleTypes,
	consoles,
	spareParts,
	sparePartConsoleTypes,
	partAssignments,
	costEntries
} from './src/lib/server/schema';
import { mkdirSync } from 'fs';

const dbPath = process.env.DATABASE_PATH ?? './data/solderbook.db';
mkdirSync('./data', { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

const db = drizzle(sqlite, {
	schema: { consoleTypes, consoles, spareParts, sparePartConsoleTypes, partAssignments, costEntries }
});

console.log('🌱 Seeding database...');

// Console types
const [ps4Fat, ps4Slim, switchLite, xbox360] = await db
	.insert(consoleTypes)
	.values([
		{ name: 'PS4 Fat' },
		{ name: 'PS4 Slim' },
		{ name: 'Switch Lite' },
		{ name: 'Xbox 360' }
	])
	.returning();

console.log('  ✓ Console types');

// Spare parts
const [hdmi, fan, battery, analogStick, thermalPaste] = await db
	.insert(spareParts)
	.values([
		{ name: 'HDMI Port', unitCost: 3.5, quantity: 8 },
		{ name: 'Cooling Fan (PS4)', unitCost: 12.0, quantity: 5 },
		{ name: 'Switch Lite Battery', unitCost: 18.0, quantity: 4 },
		{ name: 'Analog Stick', unitCost: 4.5, quantity: 20 },
		{ name: 'Thermal Paste (syringe)', unitCost: 2.0, quantity: 10 }
	])
	.returning();

console.log('  ✓ Spare parts');

// Compatibility
await db.insert(sparePartConsoleTypes).values([
	{ sparePartId: hdmi.id, consoleTypeId: ps4Fat.id },
	{ sparePartId: hdmi.id, consoleTypeId: ps4Slim.id },
	{ sparePartId: fan.id, consoleTypeId: ps4Fat.id },
	{ sparePartId: fan.id, consoleTypeId: ps4Slim.id },
	{ sparePartId: battery.id, consoleTypeId: switchLite.id },
	{ sparePartId: analogStick.id, consoleTypeId: switchLite.id },
	{ sparePartId: thermalPaste.id, consoleTypeId: ps4Fat.id },
	{ sparePartId: thermalPaste.id, consoleTypeId: ps4Slim.id },
	{ sparePartId: thermalPaste.id, consoleTypeId: xbox360.id }
]);

console.log('  ✓ Part compatibility');

// Consoles — various states
const [c1, c2, c3, c4, c5] = await db
	.insert(consoles)
	.values([
		{
			consoleTypeId: ps4Fat.id,
			purchasePrice: 45.0,
			serialNumber: 'CUH-1116A',
			status: 'sold_repaired',
			salePrice: 120.0,
			repairSuccessful: 1,
			repairNotes: 'Replaced HDMI port. Reapplied thermal paste. Cleaned fan.',
			closedAt: '2026-01-15 14:30:00'
		},
		{
			consoleTypeId: ps4Slim.id,
			purchasePrice: 55.0,
			status: 'sold_repaired',
			salePrice: 140.0,
			repairSuccessful: 1,
			repairNotes: 'Fan replacement. Works perfectly.',
			closedAt: '2026-01-28 11:00:00'
		},
		{
			consoleTypeId: switchLite.id,
			purchasePrice: 60.0,
			serialNumber: 'XKW10012345',
			status: 'in_progress',
			repairNotes: 'Dead battery. Waiting for replacement part.'
		},
		{
			consoleTypeId: ps4Fat.id,
			purchasePrice: 30.0,
			status: 'parted_out',
			repairSuccessful: 0,
			repairNotes: 'Motherboard dead. Stripped for parts.',
			closedAt: '2026-02-01 09:00:00'
		},
		{
			consoleTypeId: switchLite.id,
			purchasePrice: 45.0,
			status: 'in_progress',
			repairNotes: 'Drifting analog sticks on both sides.'
		}
	])
	.returning();

console.log('  ✓ Consoles');

// Part assignments
await db.insert(partAssignments).values([
	{ consoleId: c1.id, sparePartId: hdmi.id, costAtAssignment: 3.5 },
	{ consoleId: c1.id, sparePartId: thermalPaste.id, costAtAssignment: 2.0 },
	{ consoleId: c2.id, sparePartId: fan.id, costAtAssignment: 12.0 },
	{ consoleId: c2.id, sparePartId: thermalPaste.id, costAtAssignment: 2.0 }
]);

// Cost entries
await db.insert(costEntries).values([
	{ consoleId: c1.id, label: 'Shipping (purchase)', amount: 8.0 },
	{ consoleId: c1.id, label: 'Flux wire', amount: 1.5 },
	{ consoleId: c2.id, label: 'Shipping (purchase)', amount: 6.0 },
	{ consoleId: c3.id, label: 'Shipping (purchase)', amount: 5.0 }
]);

console.log('  ✓ Assignments and costs');
console.log('');
console.log('✅ Seed complete! Start the app with: pnpm dev');

sqlite.close();
