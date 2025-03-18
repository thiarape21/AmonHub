"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]"
      style={{ backgroundColor: "#e6d9bd" }}
    >
      <main className="container px-4 py-16 mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
            <Image
              src="/handshake.png"
              alt="AmonHub Logo"
              width={40}
              height={40}
            />
          </div>
        </div>

        <h1 className="mb-6 text-4xl font-bold sm:text-5xl">
          Bienvenido a AmonHub
        </h1>
        <p className="max-w-xl mx-auto mb-8 text-lg">
          La plataforma para conectar con la comunidad del Barrio Amón.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/login">
            <Button
              className="px-8 py-2 text-lg"
              style={{ backgroundColor: "#546b75", color: "white" }}
            >
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button className="px-8 py-2 text-lg" variant="outline">
              Registrarse
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
