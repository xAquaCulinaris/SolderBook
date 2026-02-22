<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils';
	import { goto } from '$app/navigation';

	export let data: PageData;
</script>

<svelte:head>
	<title>Parts Inventory — SolderBook</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="h2">Parts Inventory</h1>
		<a href="/parts/new" class="btn variant-filled-primary">+ Add Part</a>
	</div>

	{#if data.parts.length === 0}
		<div class="card p-8 text-center text-surface-400">
			<p>No spare parts yet. <a href="/parts/new" class="anchor">Add one</a>.</p>
		</div>
	{:else}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th>Name</th>
						<th>Unit Cost</th>
						<th>Stock</th>
						<th>Compatible With</th>
						<th>Added</th>
					</tr>
				</thead>
				<tbody>
					{#each data.parts as p}
						<tr>
							<td class="font-medium">{p.name}</td>
							<td>{formatCurrency(p.unitCost)}</td>
							<td>
								<span
									class="badge {p.quantity === 0
										? 'variant-filled-error'
										: p.quantity <= 2
										? 'variant-filled-warning'
										: 'variant-ghost-surface'}"
								>
									{p.quantity}
								</span>
							</td>
							<td class="text-sm text-surface-400">
								{#if p.compatibleTypes}
									{#each p.compatibleTypes.split(', ') as type}
										<span class="badge variant-ghost-surface mr-1">{type}</span>
									{/each}
								{:else}
									<span class="text-surface-400">—</span>
								{/if}
							</td>
							<td>{formatDate(p.createdAt)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
