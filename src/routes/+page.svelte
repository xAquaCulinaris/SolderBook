<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/types';

	export let data: PageData;

	$: pnlColor = data.metrics.netPnl >= 0 ? 'text-success-500' : 'text-error-500';
</script>

<svelte:head>
	<title>Dashboard — SolderBook</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="h2">Dashboard</h1>
		<div class="flex items-center gap-3">
			<span class="text-sm text-surface-400">View:</span>
			<div class="btn-group variant-ghost">
				<a
					href="/?view=closed"
					class="btn btn-sm {data.view === 'closed' ? 'variant-filled-primary' : ''}"
				>
					Closed Only
				</a>
				<a
					href="/?view=all"
					class="btn btn-sm {data.view === 'all' ? 'variant-filled-primary' : ''}"
				>
					All
				</a>
			</div>
		</div>
	</div>

	<!-- Metric Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<div class="card p-6 space-y-1">
			<p class="text-sm text-surface-400 uppercase tracking-wide">Total Invested</p>
			<p class="text-3xl font-bold">{formatCurrency(data.metrics.totalInvested)}</p>
			<p class="text-xs text-surface-400">{data.metrics.consoleCount} console(s)</p>
		</div>

		<div class="card p-6 space-y-1">
			<p class="text-sm text-surface-400 uppercase tracking-wide">Total Revenue</p>
			<p class="text-3xl font-bold">{formatCurrency(data.metrics.totalRevenue)}</p>
		</div>

		<div class="card p-6 space-y-1">
			<p class="text-sm text-surface-400 uppercase tracking-wide">Net Profit / Loss</p>
			<p class="text-3xl font-bold {pnlColor}">{formatCurrency(data.metrics.netPnl)}</p>
			<p class="text-xs text-surface-400">
				{data.metrics.netPnl >= 0 ? 'Profitable' : 'Loss'}
			</p>
		</div>
	</div>

	<!-- Status counts -->
	<div class="card p-6 space-y-3">
		<h2 class="h4">Console Status Overview</h2>
		<div class="flex flex-wrap gap-3">
			<span class="badge variant-filled-primary">
				In Progress: {data.statusCounts.in_progress}
			</span>
			<span class="badge variant-filled-success">
				Sold (Repaired): {data.statusCounts.sold_repaired}
			</span>
			<span class="badge variant-filled-warning">
				Sold (Unrepaired): {data.statusCounts.sold_unrepaired}
			</span>
			<span class="badge variant-soft-error">
				Parted Out: {data.statusCounts.parted_out}
			</span>
		</div>
	</div>

	<!-- Recent Consoles -->
	<div class="card p-6 space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="h4">Recent Consoles</h2>
			<a href="/consoles" class="btn btn-sm variant-ghost-primary">View All</a>
		</div>

		{#if data.recent.length === 0}
			<p class="text-surface-400">No consoles yet. <a href="/consoles/new" class="anchor">Add one</a>.</p>
		{:else}
			<div class="table-container">
				<table class="table table-hover">
					<thead>
						<tr>
							<th>Type</th>
							<th>Status</th>
							<th>Modded</th>
							<th>Purchase</th>
							<th>Sale</th>
							<th>Purchased</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recent as c}
							<tr
								class="cursor-pointer"
								on:click={() => (window.location.href = `/consoles/${c.id}`)}
							>
								<td>{c.consoleType?.name ?? '—'}</td>
								<td>
									<span class="badge min-w-[8.5rem] text-center {STATUS_COLORS[c.status]}">
										{STATUS_LABELS[c.status]}
									</span>
								</td>
								<td>
									{#if c.isModded}
										<span class="badge min-w-[4.5rem] text-center variant-filled-tertiary">Modded</span>
									{:else}
										<span class="text-surface-500">—</span>
									{/if}
								</td>
								<td>{formatCurrency(c.purchasePrice)}</td>
								<td>{formatCurrency(c.salePrice)}</td>
								<td>{formatDate(c.purchasedAt)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
