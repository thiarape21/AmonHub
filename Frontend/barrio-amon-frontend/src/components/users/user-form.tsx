"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomButton } from "@/components/ui/custom-button";

const userFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  role: z.enum(["Administrador", "Miembro", "Consultor"], {
    required_error: "Por favor seleccione un rol",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (data: UserFormValues) => void;
  defaultValues?: Partial<UserFormValues>;
}

export function UserForm({ onSubmit, defaultValues }: UserFormProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      role: "Miembro",
    },
  });

  const handleSubmit = (data: UserFormValues) => {
    onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton variant="outline">Agregar Usuario</CustomButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agregar Usuario</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Administrador">
                        Administrador
                      </SelectItem>
                      <SelectItem value="Miembro">Miembro</SelectItem>
                      <SelectItem value="Consultor">Consultor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </CustomButton>
              <CustomButton type="submit">Guardar</CustomButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
