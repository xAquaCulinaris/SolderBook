<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let typeInput = '';
	let showSuggestions = false;

	const today = new Date().toISOString().split('T')[0];

	$: suggestions = typeInput.length >= 1
		? data.types.filter((t) => t.name.toLowerCase().includes(typeInput.toLowerCase()))
		: [];

	function selectType(name: string) {
		typeInput = name;
		showSuggestions = false;
	}
</script>

<svelte:head>
	<title>Add Console — SolderBook</title>
</svelte:head>

<div class="max-w-lg space-y-6">
	<div class="space-y-1">
		<a href="/consoles" class="text-sm text-surface-400 hover:underline">← Consoles</a>
		<h1 class="h2">Add Console</h1>
	</div>

	{#if form?.error}
		<div class="alert variant-filled-error">
			<p>{form.error}</p>
		</div>
	{/if}

	<form method="POST" use:enhance class="bg-surface-800/50 border border-surface-700/40 rounded-xl p-6 space-y-5">
		<!-- Console Type with Autocomplete -->
		<div class="space-y-1.5 relative">
			<label for="console_type" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Console Type <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<input
				id="console_type"
				name="console_type"
				type="text"
				class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
				placeholder="e.g. PS4 Fat, Switch Lite"
				bind:value={typeInput}
				on:focus={() => (showSuggestions = true)}
				on:blur={() => setTimeout(() => (showSuggestions = false), 150)}
				autocomplete="off"
				required
			/>
			{#if showSuggestions && suggestions.length > 0}
				<div class="absolute z-10 w-full mt-1 bg-surface-800 border border-surface-600/60 rounded-lg shadow-xl overflow-hidden">
					{#each suggestions as t}
						<button
							type="button"
							class="w-full text-left px-4 py-2.5 text-sm text-surface-200 hover:bg-primary-500/10 hover:text-white transition-colors"
							on:click={() => selectType(t.name)}
						>
							{t.name}
						</button>
					{/each}
				</div>
			{/if}
			<p class="text-xs text-surface-500">Select existing or type a new console type name.</p>
		</div>

		<!-- Purchase Date -->
		<div class="space-y-1.5">
			<label for="purchased_at" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Purchase Date <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<input
				id="purchased_at"
				name="purchased_at"
				type="date"
				class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
				value={today}
				max={today}
				required
			/>
		</div>

		<!-- Purchase Price -->
		<div class="space-y-1.5">
			<label for="purchase_price" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Purchase Price <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<div class="relative">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium select-none">€</span>
				<input
					id="purchase_price"
					name="purchase_price"
					type="number"
					class="w-full bg-surface-900 border border-surface-600/60 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
		</div>

		<!-- Serial Number (optional) -->
		<div class="space-y-1.5">
			<label for="serial_number" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Serial Number <span class="normal-case tracking-normal font-normal text-surface-500">(optional)</span>
			</label>
			<input
				id="serial_number"
				name="serial_number"
				type="text"
				class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
				placeholder="e.g. CUH-1216A"
			/>
		</div>

		<div class="pt-1">
			<button type="submit" class="btn variant-filled-primary w-full">Add Console</button>
		</div>
	</form>
</div>
