"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormInput } from "@/components/auth/form-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Define validation schema with Zod
const formSchema = z
  .object({
    fullName: z.string().min(1, { message: "El nombre es requerido" }),
    email: z
      .string()
      .email({ message: "Por favor ingrese un correo electrónico válido" }),
    password: z.string().min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
    confirmPassword: z
      .string()
      .min(1, { message: "La confirmación de contraseña es requerida" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Registro exitoso, redirigir al login
      router.push("/login?registered=true");
    } catch (error) {
      setErrorMessage("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard title="Registrarse">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            control={form.control}
            name="fullName"
            placeholder="Nombre completo"
          />
          <FormInput
            control={form.control}
            name="email"
            placeholder="Correo electrónico"
          />
          <FormInput
            control={form.control}
            name="password"
            placeholder="Contraseña"
            type="password"
          />
          <FormInput
            control={form.control}
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            type="password"
          />

          {errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}

          <div className="flex items-center pt-2">
            <div className="text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-blue-500 hover:underline">
                Inicia sesión
              </Link>
            </div>
          </div>
          <AuthSubmitButton label="Registrarse" />
        </form>
      </Form>
    </AuthCard>
  );
}
