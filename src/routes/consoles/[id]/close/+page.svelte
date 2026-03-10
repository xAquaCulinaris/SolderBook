<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatCurrency } from '$lib/utils';

	export let data: PageData;
	export let form: ActionData;

	let status = 'sold_repaired';
	let showSalePrice = true;

	$: showSalePrice = status === 'sold_repaired' || status === 'sold_unrepaired';
</script>

<svelte:head>
	<title>Close Console — SolderBook</title>
</svelte:head>

<div class="max-w-lg space-y-6">
	<div class="space-y-1">
		<a href="/consoles/{data.console.id}" class="text-sm text-surface-400 hover:underline">← {data.console.consoleType?.name ?? 'Console'}</a>
		<h1 class="h2">Close Console</h1>
	</div>

	<!-- Summary card -->
	<div class="card p-5 space-y-2 variant-ghost-surface">
		<h2 class="h4">{data.console.consoleType?.name}</h2>
		{#if data.console.serialNumber}
			<p class="text-sm text-surface-400">SN: {data.console.serialNumber}</p>
		{/if}
		<div class="flex gap-6 text-sm mt-2">
			<div>
				<p class="text-surface-400">Purchase</p>
				<p class="font-semibold">{formatCurrency(data.console.purchasePrice)}</p>
			</div>
			<div>
				<p class="text-surface-400">Total Cost</p>
				<p class="font-semibold">{formatCurrency(data.totalCost)}</p>
			</div>
		</div>
	</div>

	{#if form?.error}
		<div class="alert variant-filled-error"><p>{form.error}</p></div>
	{/if}

	<form method="POST" use:enhance class="bg-surface-800/50 border border-surface-700/40 rounded-xl p-6 space-y-5">
		<!-- Status -->
		<div class="space-y-1.5">
			<p class="text-xs font-semibold uppercase tracking-wider text-surface-400">
				Outcome <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</p>
			<div class="bg-surface-900 border border-surface-600/60 rounded-lg p-3 space-y-1">
				<label class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-700/50 transition-colors group">
					<input type="radio" name="status" value="sold_repaired" bind:group={status} class="appearance-none w-4 h-4 rounded-full border border-surface-600/60 bg-surface-900 checked:bg-primary-500 checked:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors" />
					<span class="text-sm text-surface-300 group-hover:text-white transition-colors">Sold — Repaired</span>
				</label>
				<label class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-700/50 transition-colors group">
					<input type="radio" name="status" value="sold_unrepaired" bind:group={status} class="appearance-none w-4 h-4 rounded-full border border-surface-600/60 bg-surface-900 checked:bg-primary-500 checked:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors" />
					<span class="text-sm text-surface-300 group-hover:text-white transition-colors">Sold — Unrepaired</span>
				</label>
				<label class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-700/50 transition-colors group">
					<input type="radio" name="status" value="parted_out" bind:group={status} class="appearance-none w-4 h-4 rounded-full border border-surface-600/60 bg-surface-900 checked:bg-primary-500 checked:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors" />
					<span class="text-sm text-surface-300 group-hover:text-white transition-colors">Parted Out</span>
				</label>
			</div>
		</div>

		<!-- Sale Price (conditional) -->
		{#if showSalePrice}
			<div class="space-y-1.5">
				<label for="sale_price" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
					Sale Price <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
				</label>
				<div class="relative">
					<span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium select-none">€</span>
					<input
						id="sale_price"
						name="sale_price"
						type="number"
						class="w-full bg-surface-900 border border-surface-600/60 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
						placeholder="0.00"
						step="0.01"
						min="0"
						required
					/>
				</div>
			</div>
		{/if}

		<div class="pt-1">
			<button type="submit" class="btn variant-filled-tertiary w-full font-bold">
				Close Console
			</button>
		</div>
	</form>
</div>
