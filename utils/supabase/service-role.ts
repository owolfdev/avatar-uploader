import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleSecret = process.env.SERVICE_ROLE_SECRET as string;

export const createAdminServiceRoleClient = () => {
  return createClient(supabaseUrl, serviceRoleSecret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
