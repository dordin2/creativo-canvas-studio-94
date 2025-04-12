
// This is a shim to use our custom Database type with the Supabase client
import { Database as CustomDatabase } from "@/types/database";

export type Database = CustomDatabase;
