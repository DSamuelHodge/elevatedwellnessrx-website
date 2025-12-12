import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY."
  );
}

// Use the service key (admin) instead of anon key for migrations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log("Starting database migration...");

    // Read the migration file
    const migrationPath = path.join(__dirname, "migrations", "001_init_schema.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");

    // Execute the SQL
    const { error } = await supabase.rpc("execute_sql", { sql });

    if (error) {
      throw error;
    }

    console.log("✅ Migration completed successfully!");
    console.log("Your database schema has been created.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
