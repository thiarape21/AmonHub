"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProyectosMonitoreoPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#e6d9bd] flex flex-col items-center py-10">
      <h1 className="text-5xl font-bold text-[#546b75] mb-2 text-center">PROYECTOS Y MONITOREO</h1>
      <p className="text-center mb-8 text-lg text-gray-700">seguimiento de proyectos</p>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Proyectos */}
        <div
          className="relative w-[340px] h-[220px] cursor-pointer group rounded-lg overflow-hidden shadow-lg"
          onClick={() => router.push("/proyectos/lista")}
        >
          <Image
            src="/proyectos.jpg"
            alt="Proyectos"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ filter: "brightness(0.7)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-4xl font-extrabold drop-shadow-lg">PROYECTOS</span>
          </div>
        </div>
        {/* Monitoreo */}
        <div
          className="relative w-[340px] h-[220px] cursor-pointer group rounded-lg overflow-hidden shadow-lg"
          onClick={() => router.push("/proyectos/monitoreo")}
        >
          <Image
            src="/monitoreo.jpg"
            alt="Monitoreo"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ filter: "brightness(0.7)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-4xl font-extrabold drop-shadow-lg">MONITOREO</span>
          </div>
        </div>
      </div>
    </div>
  );
} 