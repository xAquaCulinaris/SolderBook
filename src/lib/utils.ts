export function formatCurrency(amount: number | null | undefined): string {
	if (amount == null) return '—';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2
	}).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
	if (!dateStr) return '—';
	return new Date(dateStr + 'Z').toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export function formatDatetime(dateStr: string | null | undefined): string {
	if (!dateStr) return '—';
	return new Date(dateStr + 'Z').toLocaleString('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
