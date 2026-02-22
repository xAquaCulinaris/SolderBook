import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { consoleTypes } from '$lib/server/schema';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	const types = await db
		.select({ id: consoleTypes.id, name: consoleTypes.name })
		.from(consoleTypes)
		.orderBy(consoleTypes.name);

	return json({ types });
};
