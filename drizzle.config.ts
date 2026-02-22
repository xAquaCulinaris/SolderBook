import { defineConfig } from 'drizzle-kit';

const dbPath = process.env.DATABASE_PATH ?? './data/solderbook.db';

export default defineConfig({
	schema: './src/lib/server/schema.ts',
	out: './drizzle/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: dbPath
	}
});
