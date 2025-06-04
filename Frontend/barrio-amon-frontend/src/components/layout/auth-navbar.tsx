"use client";

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AuthNavbar() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const NavDivider = () => <span className="text-white/80">|</span>;

  return (
    <div className="bg-[#E6C9A2] p-1">
      <nav className="bg-[#607D8B] text-white py-2 px-4 mx-auto rounded-lg max-w-6xl">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Image
              src="/handshake.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <Link href="/inicio" className="hover:text-gray-300 px-3">
              Inicio
            </Link>
            <NavDivider />
            <Link href="/analisis-foda" className="hover:text-gray-300 px-3">
              Análisis FODA
            </Link>
            <NavDivider />
            <Link href="/objetivos" className="hover:text-gray-300 px-3">
              Objetivos
            </Link>
            <NavDivider />
            <Link href="/plan-operativo" className="hover:text-gray-300 px-3">
              Plan Operativo
            </Link>
            <NavDivider />
            <Link href="/proyectos/lista" className={
              (typeof window !== 'undefined' && window.location.pathname.startsWith('/proyectos'))
                ? "hover:text-gray-300 px-3 text-[#FFB300] font-bold"
                : "hover:text-gray-300 px-3"
            }>
              Proyectos
            </Link>
            <NavDivider />
            <Link href="/monitoreo" className={
              (typeof window !== 'undefined' && window.location.pathname.startsWith('/monitoreo'))
                ? "hover:text-gray-300 px-3 text-[#FFB300] font-bold"
                : "hover:text-gray-300 px-3"
            }>
              Monitoreo
            </Link>
            <NavDivider />
            <Link href="/usuarios" className="hover:text-gray-300 px-3">
              Usuarios
            </Link>
            <NavDivider />
            <Link href="/sandbox" className={
              (typeof window !== 'undefined' && window.location.pathname === '/sandbox')
                ? "hover:text-gray-300 px-3 text-[#FFB300] font-bold"
                : "hover:text-gray-300 px-3"
            }>
              Sandbox
            </Link>
            <NavDivider />
            <button onClick={handleLogout} className="hover:text-gray-300 px-3">
              Salir
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
