import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Regular client for public operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Admin client for auth operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export { supabase, supabaseAdmin };
