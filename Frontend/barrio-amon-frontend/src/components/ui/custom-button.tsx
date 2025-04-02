import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function CustomButton({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <Button
      className={cn(
        // Base styles
        "rounded-md font-medium transition-colors",
        // Default variant (filled)
        variant === "default" && "bg-[#4A6670] hover:bg-[#3A515A] text-white",
        // Secondary/outline variant
        variant === "outline" &&
          "border-[#4A6670] text-[#4A6670] hover:bg-[#4A6670]/10",
        // Ghost variant
        variant === "ghost" && "hover:bg-[#4A6670]/10 text-[#4A6670]",
        // Allow custom classes to override
        className
      )}
      variant={variant}
      {...props}
    />
  );
}
