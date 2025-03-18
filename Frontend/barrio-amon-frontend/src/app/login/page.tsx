"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { FormInput } from "@/components/auth/form-input";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";

// Define validation schema with Zod
const formSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor ingrese un correo electrónico válido" }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres",
  }),
});

export default function LoginPage() {
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // TODO: Add authentication logic here
  }

  return (
    <AuthCard title="Iniciar sesión">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormInput
            control={form.control}
            name="email"
            placeholder="Ingrese su correo electrónico"
          />
          <FormInput
            control={form.control}
            name="password"
            placeholder="Ingrese su contraseña"
            type="password"
          />
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
          <div className="text-sm text-blue-500 hover:underline">
            <Link href="/forgot-password">¿Olvidó su contraseña?</Link>
          </div>
          <AuthSubmitButton label="Iniciar sesión" />
        </form>
      </Form>
    </AuthCard>
  );
}
