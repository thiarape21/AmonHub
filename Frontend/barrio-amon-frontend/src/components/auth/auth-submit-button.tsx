"use client";

import { Button } from "@/components/ui/button";

interface AuthSubmitButtonProps {
  label: string;
}

export function AuthSubmitButton({ label }: AuthSubmitButtonProps) {
  return (
    <div className="flex justify-end pt-2">
      <Button
        type="submit"
        className="rounded-full px-8 py-2"
        style={{ backgroundColor: "#546b75", color: "white" }}
      >
        {label}
      </Button>
    </div>
  );
}
