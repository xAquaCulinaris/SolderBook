<script lang="ts">
	import '../app.postcss';
	import { AppShell } from '@skeletonlabs/skeleton';
	import { page } from '$app/stores';

	const navLinks = [
		{
			href: '/',
			label: 'Dashboard',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
			</svg>`
		},
		{
			href: '/consoles',
			label: 'Consoles',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
			</svg>`
		},
		{
			href: '/parts',
			label: 'Parts',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>`
		}
	];

	function isActive(href: string): boolean {
		if (href === '/') return $page.url.pathname === '/';
		return $page.url.pathname.startsWith(href);
	}
</script>

<AppShell slotSidebarLeft="w-60 flex flex-col bg-surface-900 border-r border-surface-700/40">
	<svelte:fragment slot="sidebarLeft">
		<!-- Logo -->
		<div class="px-5 py-5 border-b border-surface-700/40">
			<a href="/" class="flex items-center gap-3 no-underline">
				<div class="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50 shrink-0">
					<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
					</svg>
				</div>
				<div>
					<p class="font-bold text-white text-[15px] leading-tight tracking-tight">SolderBook</p>
					<p class="text-[11px] text-surface-400 leading-none mt-0.5">Repair Tracker</p>
				</div>
			</a>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 p-3 space-y-0.5">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-100
						{isActive(link.href)
							? 'bg-primary-500/15 text-primary-400'
							: 'text-surface-300 hover:bg-surface-700/50 hover:text-white'}"
				>
					{@html link.icon}
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="px-5 py-4 border-t border-surface-700/40">
			<p class="text-[11px] text-surface-500">Console Repair Business</p>
		</div>
	</svelte:fragment>

	<div class="p-6 lg:p-8 max-w-7xl">
		<slot />
	</div>
</AppShell>
