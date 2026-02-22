<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let typeInput = '';
	let showSuggestions = false;

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
	<div class="flex items-center gap-3">
		<a href="/consoles" class="btn btn-sm variant-ghost">← Back</a>
		<h1 class="h2">Add Console</h1>
	</div>

	{#if form?.error}
		<div class="alert variant-filled-error">
			<p>{form.error}</p>
		</div>
	{/if}

	<form method="POST" use:enhance class="card p-6 space-y-5">
		<!-- Console Type with Autocomplete -->
		<div class="relative">
			<label class="label" for="console_type">
				<span>Console Type <span class="text-error-500">*</span></span>
				<input
					id="console_type"
					name="console_type"
					type="text"
					class="input"
					placeholder="e.g. PS4 Fat, Switch Lite"
					bind:value={typeInput}
					on:focus={() => (showSuggestions = true)}
					on:blur={() => setTimeout(() => (showSuggestions = false), 150)}
					autocomplete="off"
					required
				/>
			</label>
			{#if showSuggestions && suggestions.length > 0}
				<div class="card shadow-xl absolute z-10 w-full mt-1 p-1 space-y-1">
					{#each suggestions as t}
						<button
							type="button"
							class="w-full text-left px-3 py-2 rounded hover:variant-ghost-primary"
							on:click={() => selectType(t.name)}
						>
							{t.name}
						</button>
					{/each}
				</div>
			{/if}
			<p class="text-xs text-surface-400 mt-1">
				Select existing or type a new console type name.
			</p>
		</div>

		<!-- Purchase Price -->
		<label class="label" for="purchase_price">
			<span>Purchase Price (€) <span class="text-error-500">*</span></span>
			<input
				id="purchase_price"
				name="purchase_price"
				type="number"
				class="input"
				placeholder="0.00"
				step="0.01"
				min="0"
				required
			/>
		</label>

		<!-- Serial Number (optional) -->
		<label class="label" for="serial_number">
			<span>Serial Number <span class="text-surface-400 text-xs">(optional)</span></span>
			<input
				id="serial_number"
				name="serial_number"
				type="text"
				class="input"
				placeholder="e.g. CUH-1216A"
			/>
		</label>

		<button type="submit" class="btn variant-filled-primary w-full">Add Console</button>
	</form>
</div>
