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
	<div class="space-y-1">
		<a href="/parts" class="text-sm text-surface-400 hover:underline">← Parts</a>
		<h1 class="h2">Add Spare Part</h1>
	</div>

	{#if form?.error}
		<div class="alert variant-filled-error"><p>{form.error}</p></div>
	{/if}

	<form method="POST" use:enhance class="bg-surface-800/50 border border-surface-700/40 rounded-xl p-6 space-y-5">
		<!-- Part Name -->
		<div class="space-y-1.5">
			<label for="name" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Part Name <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<input
				id="name"
				name="name"
				type="text"
				class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
				placeholder="e.g. HDMI Port, Cooling Fan"
				required
			/>
		</div>

		<!-- Unit Cost -->
		<div class="space-y-1.5">
			<label for="unit_cost" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Unit Cost <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<div class="relative">
				<span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium select-none">€</span>
				<input
					id="unit_cost"
					name="unit_cost"
					type="number"
					class="w-full bg-surface-900 border border-surface-600/60 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
					placeholder="0.00"
					step="0.01"
					min="0"
					required
				/>
			</div>
		</div>

		<!-- Initial Quantity -->
		<div class="space-y-1.5">
			<label for="quantity" class="block text-xs font-semibold uppercase tracking-wider text-surface-400">
				Initial Quantity <span class="text-error-400 normal-case tracking-normal font-normal">*</span>
			</label>
			<input
				id="quantity"
				name="quantity"
				type="number"
				class="w-full bg-surface-900 border border-surface-600/60 rounded-lg px-4 py-2.5 text-white placeholder:text-surface-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
				placeholder="0"
				min="0"
				required
			/>
		</div>

		<!-- Compatible Console Types -->
		<div class="space-y-2.5">
			<p class="text-xs font-semibold uppercase tracking-wider text-surface-400">Compatible Console Types</p>
			{#if data.types.length === 0}
				<p class="text-sm text-surface-500">No console types yet. Add a console first.</p>
			{:else}
				<div class="bg-surface-900 border border-surface-600/60 rounded-lg p-3 grid grid-cols-2 gap-1">
					{#each data.types as t}
						<label class="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-700/50 transition-colors group">
							<input
								type="checkbox"
								name="console_type_ids"
								value={t.id}
								class="checkbox"
							/>
							<span class="text-sm text-surface-300 group-hover:text-white transition-colors">{t.name}</span>
						</label>
					{/each}
				</div>
			{/if}
		</div>

		<div class="pt-1">
			<button type="submit" class="btn variant-filled-primary w-full">Add Part</button>
		</div>
	</form>
</div>
