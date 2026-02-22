<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;
</script>

<svelte:head>
	<title>Add Part — SolderBook</title>
</svelte:head>

<div class="max-w-lg space-y-6">
	<div class="flex items-center gap-3">
		<a href="/parts" class="btn btn-sm variant-ghost">← Back</a>
		<h1 class="h2">Add Spare Part</h1>
	</div>

	{#if form?.error}
		<div class="alert variant-filled-error"><p>{form.error}</p></div>
	{/if}

	<form method="POST" use:enhance class="card p-6 space-y-5">
		<label class="label" for="name">
			<span>Part Name <span class="text-error-500">*</span></span>
			<input
				id="name"
				name="name"
				type="text"
				class="input"
				placeholder="e.g. HDMI Port, Cooling Fan"
				required
			/>
		</label>

		<label class="label" for="unit_cost">
			<span>Unit Cost (€) <span class="text-error-500">*</span></span>
			<input
				id="unit_cost"
				name="unit_cost"
				type="number"
				class="input"
				placeholder="0.00"
				step="0.01"
				min="0"
				required
			/>
		</label>

		<label class="label" for="quantity">
			<span>Initial Quantity <span class="text-error-500">*</span></span>
			<input
				id="quantity"
				name="quantity"
				type="number"
				class="input"
				placeholder="0"
				min="0"
				required
			/>
		</label>

		<!-- Compatible Console Types -->
		<fieldset class="space-y-2">
			<legend class="font-semibold text-sm">Compatible Console Types</legend>
			{#if data.types.length === 0}
				<p class="text-sm text-surface-400">No console types yet. Add a console first.</p>
			{:else}
				<div class="grid grid-cols-2 gap-2">
					{#each data.types as t}
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								name="console_type_ids"
								value={t.id}
								class="checkbox"
							/>
							<span class="text-sm">{t.name}</span>
						</label>
					{/each}
				</div>
			{/if}
		</fieldset>

		<button type="submit" class="btn variant-filled-primary w-full">Add Part</button>
	</form>
</div>
