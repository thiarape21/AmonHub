import { AuthCheck } from "@/components/auth/auth-check";
import { AuthNavbar } from "@/components/layout/auth-navbar";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await AuthCheck();

  return (
    <div className="min-h-screen flex flex-col bg-[#E6C9A2]">
      <AuthNavbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
