import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function AuthCheck() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}
