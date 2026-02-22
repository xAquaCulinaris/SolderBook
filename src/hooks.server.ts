import type { Handle } from '@sveltejs/kit';

// The DB singleton is initialized on first import from db.ts.
// This hook ensures the module is loaded early.
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
