"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface FormInputProps {
  control: Control<any>;
  name: string;
  placeholder: string;
  type?: string;
}

export function FormInput({
  control,
  name,
  placeholder,
  type = "text",
}: FormInputProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              className="border-b border-gray-300 rounded-none focus-visible:ring-0 focus:border-b-2 focus:border-blue-500 shadow-none bg-transparent px-0"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
