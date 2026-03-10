<script lang="ts">
	import type { PageData } from './$types';
	import { formatCurrency, formatDate } from '$lib/utils';
	import { goto } from '$app/navigation';

	export let data: PageData;

	$: spareParts = data.parts.filter((p) => p.partType !== 'mod');
	$: modParts = data.parts.filter((p) => p.partType === 'mod');
</script>

<svelte:head>
	<title>Parts Inventory — SolderBook</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="h2">Parts Inventory</h1>
		<a href="/parts/new" class="btn variant-filled-primary">+ Add Part</a>
	</div>

	<!-- Spare Parts -->
	<h2 class="h3">Spare Parts</h2>
	{#if spareParts.length === 0}
		<div class="card p-8 text-center text-surface-400">
			<p>No spare parts yet. <a href="/parts/new" class="anchor">Add one</a>.</p>
		</div>
	{:else}
		<div class="table-container">
			<table class="table table-hover table-fixed w-full">
				<colgroup>
					<col style="width: 25%;" />
					<col style="width: 10%;" />
					<col style="width: 12%;" />
					<col style="width: 10%;" />
					<col style="width: 28%;" />
					<col style="width: 15%;" />
				</colgroup>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Unit Cost</th>
						<th>Stock</th>
						<th>Compatible With</th>
						<th>Added</th>
					</tr>
				</thead>
				<tbody>
					{#each spareParts as p}
						<tr>
							<td class="font-medium">{p.name}</td>
							<td>
								<span class="badge min-w-[4rem] text-center variant-ghost-surface">Spare</span>
							</td>
							<td>{formatCurrency(p.unitCost)}</td>
							<td>
								<span
									class="badge min-w-[2.5rem] text-center {p.quantity === 0
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

	<!-- Mod Parts -->
	<h2 class="h3">Mod Parts</h2>
	{#if modParts.length === 0}
		<div class="card p-8 text-center text-surface-400">
			<p>No mod parts yet. <a href="/parts/new" class="anchor">Add one</a>.</p>
		</div>
	{:else}
		<div class="table-container">
			<table class="table table-hover table-fixed w-full">
				<colgroup>
					<col style="width: 25%;" />
					<col style="width: 10%;" />
					<col style="width: 12%;" />
					<col style="width: 10%;" />
					<col style="width: 28%;" />
					<col style="width: 15%;" />
				</colgroup>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Unit Cost</th>
						<th>Stock</th>
						<th>Compatible With</th>
						<th>Added</th>
					</tr>
				</thead>
				<tbody>
					{#each modParts as p}
						<tr>
							<td class="font-medium">{p.name}</td>
							<td>
								<span class="badge min-w-[4rem] text-center variant-filled-tertiary">Mod</span>
							</td>
							<td>{formatCurrency(p.unitCost)}</td>
							<td>
								<span
									class="badge min-w-[2.5rem] text-center {p.quantity === 0
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
