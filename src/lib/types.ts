export type ConsoleStatus = 'in_progress' | 'sold_repaired' | 'sold_unrepaired' | 'parted_out';

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
	salePrice: number | null;
	status: ConsoleStatus;
	repairSuccessful: number | null;
	repairNotes: string | null;
	createdAt: string;
	closedAt: string | null;
}

export interface SparePart {
	id: number;
	name: string;
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
	sold_repaired: 'variant-ghost-primary',
	sold_unrepaired: 'variant-filled-warning',
	parted_out: 'variant-ghost-surface'
};
