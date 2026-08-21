import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddItemForm from "./AddItemForm";
import CheckHistory from "./CheckHistory";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <AddItemForm />

      <h2 className="text-lg font-medium mt-8 mb-4">History</h2>
      <CheckHistory />
    </main>
  );
}
