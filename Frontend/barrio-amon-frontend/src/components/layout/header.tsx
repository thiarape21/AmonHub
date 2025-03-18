"use client";

import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container flex items-center justify-between h-16 mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image
            src="/handshake.png"
            alt="AmonHub Logo"
            width={24}
            height={24}
          />
          <span>AmonHub</span>
        </Link>
        <nav>
          <ul className="flex items-center space-x-6">
            <li>
              <Link
                href="/login"
                className="text-sm font-medium hover:underline"
              >
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 rounded-full"
                style={{ backgroundColor: "#546b75", color: "white" }}
              >
                Registrarse
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
