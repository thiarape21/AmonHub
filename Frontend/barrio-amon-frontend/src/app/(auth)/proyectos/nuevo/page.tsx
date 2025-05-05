"use client";
import ProyectoForm from "@/components/proyectos/ProyectoForm";
import { useRouter } from "next/navigation";

export default function NuevoProyectoPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-6 text-[#546b75]">Crear Proyecto</h1>
      <ProyectoForm modo="crear" onCancel={() => router.push("/proyectos/lista")} />
    </div>
  );
} 