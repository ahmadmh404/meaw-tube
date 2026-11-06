import dotenv from "dotenv";
<<<<<<< HEAD
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });
export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
=======
import { defineConfig } from 'drizzle-kit';

dotenv.config({ path: ".env.local" });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
>>>>>>> 7a447fe120c4e223cf4d15306c73f8e10a03464f
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
