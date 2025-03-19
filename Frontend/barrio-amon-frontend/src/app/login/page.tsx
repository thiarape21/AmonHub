"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormInput } from "@/components/auth/form-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Por favor ingrese un correo válido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" }),
});

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar si el usuario viene de un registro exitoso
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Registro exitoso. Por favor inicie sesión.");
    }
  }, [searchParams]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.message);
        return;
      }

      // Guardar datos del usuario y redirigir
      localStorage.setItem("user", JSON.stringify(result.user));
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard title="Iniciar sesión">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            control={form.control}
            name="email"
            placeholder="Ingrese su correo"
          />
          <FormInput
            control={form.control}
            name="password"
            placeholder="Ingrese su contraseña"
            type="password"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
          <div className="text-sm text-blue-500 hover:underline">
            <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
          </div>
          <AuthSubmitButton label="Iniciar sesión" />
        </form>
      </Form>
    </AuthCard>
  );
}
