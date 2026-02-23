<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { formatCurrency, formatDate, formatDatetime } from '$lib/utils';
	import { STATUS_LABELS, STATUS_COLORS } from '$lib/types';
	import type { ConsoleStatus } from '$lib/types';

	export let data: PageData;
	export let form: ActionData;

	let editingSerial = false;
	let editingNotes = false;
	let serialValue = data.console.serialNumber ?? '';
	let notesValue = data.console.repairNotes ?? '';
</script>

<svelte:head>
	<title>{data.console.consoleType?.name ?? 'Console'} — SolderBook</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="space-y-1">
		<a href="/consoles" class="text-sm text-surface-400 hover:underline">← Consoles</a>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<h1 class="h2">{data.console.consoleType?.name ?? 'Console'}</h1>
				<span class="badge {STATUS_COLORS[data.console.status as ConsoleStatus]}">
					{STATUS_LABELS[data.console.status as ConsoleStatus]}
				</span>
			</div>
			{#if data.console.status === 'in_progress'}
				<a href="/consoles/{data.console.id}/close" class="btn variant-filled-tertiary">
					Close Console
				</a>
			{:else if data.console.closedAt}
				<div class="flex items-center gap-3">
					<span class="text-sm text-surface-400">Closed {formatDate(data.console.closedAt)}</span>
					<form method="POST" action="?/reopen" use:enhance>
						<button type="submit" class="btn btn-sm variant-ghost">Reopen</button>
					</form>
				</div>
			{/if}
		</div>
	</div>

	<!-- Info grid -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<!-- Basic Info -->
		<div class="card p-5 space-y-4">
			<h2 class="h4">Info</h2>

			<div class="space-y-1">
				<p class="text-sm text-surface-400">Purchase Price</p>
				<p class="font-semibold text-lg">{formatCurrency(data.console.purchasePrice)}</p>
			</div>

			<div class="space-y-1">
				<p class="text-sm text-surface-400">Purchased</p>
				<p>{formatDate(data.console.purchasedAt)}</p>
			</div>

			{#if data.console.salePrice != null}
				<div class="space-y-1">
					<p class="text-sm text-surface-400">Sale Price</p>
					<p class="font-semibold text-lg text-success-500">
						{formatCurrency(data.console.salePrice)}
					</p>
				</div>
			{/if}

			<!-- Serial Number -->
			<div class="space-y-1">
				<p class="text-sm text-surface-400">Serial Number</p>
				{#if editingSerial}
					<form method="POST" action="?/updateSerial" use:enhance on:submit={() => (editingSerial = false)} class="flex gap-2">
						<input
							name="serial_number"
							type="text"
							class="input input-sm flex-1"
							bind:value={serialValue}
							placeholder="Serial number"
						/>
						<button type="submit" class="btn btn-sm variant-filled-primary">Save</button>
						<button type="button" class="btn btn-sm variant-ghost" on:click={() => (editingSerial = false)}>Cancel</button>
					</form>
				{:else}
					<div class="flex items-center gap-2">
						<p>{data.console.serialNumber ?? '—'}</p>
						{#if data.console.status === 'in_progress'}
							<button class="btn btn-sm variant-ghost" on:click={() => (editingSerial = true)}>Edit</button>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Cost Summary -->
		<div class="card p-5 space-y-4">
			<h2 class="h4">Cost Summary</h2>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span>Purchase price</span>
					<span>{formatCurrency(data.console.purchasePrice)}</span>
				</div>
				<div class="flex justify-between">
					<span>Parts ({data.assignments.length})</span>
					<span>
						{formatCurrency(data.assignments.reduce((s, a) => s + a.costAtAssignment, 0))}
					</span>
				</div>
				<div class="flex justify-between">
					<span>Other costs ({data.costs.length})</span>
					<span>{formatCurrency(data.costs.reduce((s, c) => s + c.amount, 0))}</span>
				</div>
				<hr class="border-surface-300" />
				<div class="flex justify-between font-bold text-base">
					<span>Total cost</span>
					<span>{formatCurrency(data.totalCost)}</span>
				</div>
				{#if data.console.salePrice != null}
					{@const pl = data.console.salePrice - data.totalCost}
					<div class="flex justify-between font-bold text-base {pl >= 0 ? 'text-success-500' : 'text-error-500'}">
						<span>Profit / Loss</span>
						<span>{formatCurrency(pl)}</span>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Repair Notes -->
	<div class="card p-5 space-y-3">
		<div class="flex items-center justify-between">
			<h2 class="h4">Repair Notes</h2>
			{#if !editingNotes && data.console.status === 'in_progress'}
				<button class="btn btn-sm variant-ghost" on:click={() => (editingNotes = true)}>Edit</button>
			{/if}
		</div>
		{#if editingNotes}
			<form method="POST" action="?/updateNotes" use:enhance on:submit={() => (editingNotes = false)} class="space-y-3">
				<textarea
					name="repair_notes"
					class="textarea w-full"
					rows="6"
					placeholder="Describe repair work, findings, parts replaced..."
					bind:value={notesValue}
				></textarea>
				<div class="flex gap-2">
					<button type="submit" class="btn btn-sm variant-filled-primary">Save Notes</button>
					<button type="button" class="btn btn-sm variant-ghost" on:click={() => (editingNotes = false)}>Cancel</button>
				</div>
			</form>
		{:else}
			<p class="whitespace-pre-wrap text-sm {data.console.repairNotes ? '' : 'text-surface-400'}">
				{data.console.repairNotes || 'No notes yet.'}
			</p>
		{/if}
	</div>

	<!-- Part Assignments -->
	<div class="card p-5 space-y-4">
		<h2 class="h4">Assigned Parts</h2>
		{#if data.assignments.length > 0}
			<div class="table-container">
				<table class="table table-compact table-fixed w-full">
					<colgroup>
						<col class="w-auto" />
						<col class="w-28" />
						<col class="w-40" />
						{#if data.console.status === 'in_progress'}
							<col class="w-12" />
						{/if}
					</colgroup>
					<thead>
						<tr>
							<th>Part</th>
							<th>Cost</th>
							<th>Date</th>
							{#if data.console.status === 'in_progress'}
								<th></th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each data.assignments as a}
							<tr>
								<td>{a.partName}</td>
								<td>{formatCurrency(a.costAtAssignment)}</td>
								<td>{formatDatetime(a.assignedAt)}</td>
								{#if data.console.status === 'in_progress'}
									<td>
										<form method="POST" action="?/deleteAssignment" use:enhance>
											<input type="hidden" name="assignment_id" value={a.id} />
											<button type="submit" class="btn btn-sm variant-ghost">✕</button>
										</form>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-sm text-surface-400">No parts assigned.</p>
		{/if}

		{#if data.console.status === 'in_progress'}
			<form method="POST" action="?/assignPart" use:enhance class="flex flex-wrap gap-3 items-end">
				<label class="label flex-1 min-w-[200px]">
					<span class="text-sm">Assign compatible part</span>
					<select name="spare_part_id" class="select" required>
						<option value="">— Select part —</option>
						{#each data.compatibleParts as p}
							<option value={p.id}>{p.name} ({formatCurrency(p.unitCost)}) — {p.quantity} in stock</option>
						{/each}
					</select>
				</label>
				<button type="submit" class="btn btn-sm variant-filled-primary" disabled={data.compatibleParts.length === 0}>
					Assign
				</button>
				{#if data.compatibleParts.length === 0}
					<p class="text-xs text-surface-400 w-full">No compatible parts in stock.</p>
				{/if}
			</form>
			{#if form?.assignError}
				<p class="text-sm text-error-500">{form.assignError}</p>
			{/if}
		{/if}
	</div>

	<!-- Cost Entries -->
	<div class="card p-5 space-y-4">
		<h2 class="h4">Other Costs</h2>
		{#if data.costs.length > 0}
			<div class="table-container">
				<table class="table table-compact table-fixed w-full">
					<colgroup>
						<col class="w-auto" />
						<col class="w-28" />
						<col class="w-40" />
						{#if data.console.status === 'in_progress'}
							<col class="w-12" />
						{/if}
					</colgroup>
					<thead>
						<tr>
							<th>Description</th>
							<th>Amount</th>
							<th>Date</th>
							{#if data.console.status === 'in_progress'}
								<th></th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each data.costs as c}
							<tr>
								<td>{c.label}</td>
								<td>{formatCurrency(c.amount)}</td>
								<td>{formatDate(c.createdAt)}</td>
								{#if data.console.status === 'in_progress'}
									<td>
										<form method="POST" action="?/deleteCost" use:enhance>
											<input type="hidden" name="cost_id" value={c.id} />
											<button type="submit" class="btn btn-sm variant-ghost">✕</button>
										</form>
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-sm text-surface-400">No additional costs.</p>
		{/if}

		{#if data.console.status === 'in_progress'}
			<form method="POST" action="?/addCost" use:enhance class="flex flex-wrap gap-3 items-end">
				<label class="label flex-1 min-w-[180px]">
					<span class="text-sm">Description</span>
					<input
						name="label"
						type="text"
						class="input"
						placeholder="e.g. Shipping, Solder wire"
						required
					/>
				</label>
				<label class="label w-36">
					<span class="text-sm">Amount (€)</span>
					<input
						name="amount"
						type="number"
						class="input"
						placeholder="0.00"
						step="0.01"
						min="0.01"
						required
					/>
				</label>
				<button type="submit" class="btn btn-sm variant-filled-primary">Add Cost</button>
			</form>
			{#if form?.addCostError}
				<p class="text-sm text-error-500">{form.addCostError}</p>
			{/if}
		{/if}
	</div>
</div>
