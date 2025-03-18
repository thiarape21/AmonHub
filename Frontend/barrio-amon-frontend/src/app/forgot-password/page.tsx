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
});

export default function ForgotPasswordPage() {
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // TODO: Add password reset logic here
  }

  return (
    <AuthCard title="Recuperar contraseña">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <p className="text-sm text-gray-600 mb-4">
            Ingrese su correo electrónico y le enviaremos instrucciones para
            restablecer su contraseña.
          </p>
          <FormInput
            control={form.control}
            name="email"
            placeholder="Correo electrónico"
          />
          <div className="flex items-center pt-2">
            <div className="text-sm">
              <Link href="/login" className="text-blue-500 hover:underline">
                Volver a inicio de sesión
              </Link>
            </div>
          </div>
          <AuthSubmitButton label="Enviar instrucciones" />
        </form>
      </Form>
    </AuthCard>
  );
}
