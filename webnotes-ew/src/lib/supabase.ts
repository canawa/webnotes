import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabaseUrl = 'https://xoelbdhvjytfvjexnrlh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZWxiZGh2anl0ZnZqZXhucmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxMDY4NzEsImV4cCI6MjA1NzY4Mjg3MX0.HCbk2vRuZhDRd8QHyYJDmUVAstCnND7y4qkOdLjCYTY'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
