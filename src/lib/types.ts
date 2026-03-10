export type ConsoleStatus = 'in_progress' | 'sold_repaired' | 'sold_unrepaired' | 'parted_out';
export type PartType = 'spare' | 'mod';

export interface ConsoleType {
	id: number;
	name: string;
	createdAt: string;
}

export interface Console {
	id: number;
	consoleTypeId: number;
	serialNumber: string | null;
	purchasePrice: number;
	purchasedAt: string | null;
	salePrice: number | null;
	status: ConsoleStatus;
	repairSuccessful: number | null;
	repairNotes: string | null;
	isModded: number;
	createdAt: string;
	closedAt: string | null;
}

export interface SparePart {
	id: number;
	name: string;
	partType: PartType;
	unitCost: number;
	quantity: number;
	createdAt: string;
}

export interface PartAssignment {
	id: number;
	consoleId: number;
	sparePartId: number;
	costAtAssignment: number;
	assignedAt: string;
}

export interface CostEntry {
	id: number;
	consoleId: number;
	label: string;
	amount: number;
	createdAt: string;
}

export const STATUS_LABELS: Record<ConsoleStatus, string> = {
	in_progress: 'In Progress',
	sold_repaired: 'Sold (Repaired)',
	sold_unrepaired: 'Sold (Unrepaired)',
	parted_out: 'Parted Out'
};

export const STATUS_COLORS: Record<ConsoleStatus, string> = {
	in_progress: 'variant-filled-primary',
	sold_repaired: 'variant-filled-success',
	sold_unrepaired: 'variant-filled-warning',
	parted_out: 'variant-soft-error'
};

export const PART_TYPE_LABELS: Record<PartType, string> = {
	spare: 'Spare',
	mod: 'Mod'
};
