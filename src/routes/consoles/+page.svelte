<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/types';
	import type { ConsoleStatus } from '$lib/types';
	import { goto } from '$app/navigation';

	export let data: PageData;

	let statusFilter = data.statusFilter;
	let typeFilter = data.typeFilter;
	let moddedFilter = data.moddedFilter;

	function applyFilter() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		if (typeFilter) params.set('type', typeFilter);
		if (moddedFilter) params.set('modded', moddedFilter);
		goto(`/consoles?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Consoles — SolderBook</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="h2">Consoles</h1>
		<a href="/consoles/new" class="btn variant-filled-primary">+ Add Console</a>
	</div>

	<!-- Filters -->
	<div class="card p-4 flex flex-wrap gap-4 items-end">
		<label class="label flex-1 min-w-[160px]">
			<span class="text-sm">Status</span>
			<select class="select" bind:value={statusFilter} on:change={applyFilter}>
				<option value="">All statuses</option>
				<option value="in_progress">In Progress</option>
				<option value="sold_repaired">Sold (Repaired)</option>
				<option value="sold_unrepaired">Sold (Unrepaired)</option>
				<option value="parted_out">Parted Out</option>
			</select>
		</label>
		<label class="label flex-1 min-w-[160px]">
			<span class="text-sm">Console Type</span>
			<select class="select" bind:value={typeFilter} on:change={applyFilter}>
				<option value="">All types</option>
				{#each data.allTypes as t}
					<option value={String(t.id)}>{t.name}</option>
				{/each}
			</select>
		</label>
		<label class="label flex-1 min-w-[160px]">
			<span class="text-sm">Modded</span>
			<select class="select" bind:value={moddedFilter} on:change={applyFilter}>
				<option value="">All</option>
				<option value="1">Modded</option>
				<option value="0">Not Modded</option>
			</select>
		</label>
		{#if statusFilter || typeFilter || moddedFilter}
			<a href="/consoles" class="btn btn-sm variant-ghost">Clear filters</a>
		{/if}
	</div>

	{#if data.consoles.length === 0}
		<div class="card p-8 text-center text-surface-400">
			<p>No consoles found. <a href="/consoles/new" class="anchor">Add one</a>.</p>
		</div>
	{:else}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Type</th>
						<th>Status</th>
						<th>Modded</th>
						<th>Serial</th>
						<th>Purchase</th>
						<th>Total Cost</th>
						<th>Sale</th>
						<th>P/L</th>
						<th>Purchased</th>
					</tr>
				</thead>
				<tbody>
					{#each data.consoles as c}
						{@const pl = c.salePrice != null ? c.salePrice - c.totalCost : null}
						<tr
							class="cursor-pointer"
							on:click={() => goto(`/consoles/${c.id}`)}
						>
							<td class="font-medium">{c.typeName}</td>
							<td>
								<span class="badge min-w-[8.5rem] text-center {STATUS_COLORS[c.status as ConsoleStatus]}">
									{STATUS_LABELS[c.status as ConsoleStatus]}
								</span>
							</td>
							<td>
								{#if c.isModded}
									<span class="badge min-w-[4.5rem] text-center variant-filled-tertiary">Modded</span>
								{:else}
									<span class="text-surface-500">—</span>
								{/if}
							</td>
							<td class="text-surface-400">{c.serialNumber ?? '—'}</td>
							<td>{formatCurrency(c.purchasePrice)}</td>
							<td>{formatCurrency(c.totalCost)}</td>
							<td>{formatCurrency(c.salePrice)}</td>
							<td class="{pl != null ? (pl >= 0 ? 'text-success-500' : 'text-error-500') : ''}">
								{pl != null ? formatCurrency(pl) : '—'}
							</td>
							<td>{formatDate(c.purchasedAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
