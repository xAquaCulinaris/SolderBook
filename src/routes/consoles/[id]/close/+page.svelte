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

	<form method="POST" use:enhance class="card p-6 space-y-5">
		<!-- Status -->
		<fieldset class="space-y-2">
			<legend class="font-semibold">Outcome <span class="text-error-500">*</span></legend>
			<label class="flex items-center gap-3 cursor-pointer">
				<input type="radio" name="status" value="sold_repaired" bind:group={status} class="radio" />
				<span>Sold — Repaired</span>
			</label>
			<label class="flex items-center gap-3 cursor-pointer">
				<input type="radio" name="status" value="sold_unrepaired" bind:group={status} class="radio" />
				<span>Sold — Unrepaired</span>
			</label>
			<label class="flex items-center gap-3 cursor-pointer">
				<input type="radio" name="status" value="parted_out" bind:group={status} class="radio" />
				<span>Parted Out</span>
			</label>
		</fieldset>

		<!-- Sale Price (conditional) -->
		{#if showSalePrice}
			<label class="label" for="sale_price">
				<span>Sale Price (€) <span class="text-error-500">*</span></span>
				<input
					id="sale_price"
					name="sale_price"
					type="number"
					class="input"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</label>
		{/if}

		<!-- Repair Successful -->
		<label class="flex items-center gap-3 cursor-pointer">
			<input
				type="checkbox"
				name="repair_successful"
				value="1"
				class="checkbox"
			/>
			<span>Repair was successful</span>
		</label>

		<button type="submit" class="btn variant-filled-tertiary w-full font-bold">
			Close Console
		</button>
	</form>
</div>
