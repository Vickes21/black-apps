import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./src/lib/drizzle/migrations",
  schema: "./src/lib/drizzle/schemas/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL, //precisa ser process por causa do wrangler
  },
});