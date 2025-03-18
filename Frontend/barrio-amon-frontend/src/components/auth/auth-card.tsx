"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  children: ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: "#e6d9bd" }}
    >
      <Card className="w-full max-w-md bg-gray-50 shadow-md border-0 rounded-lg">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center justify-start gap-2 py-2 px-8">
            <div className="flex items-center justify-center w-10 h-10">
              <Image
                src="/handshake.png"
                alt="AmonHub Logo"
                width={32}
                height={32}
              />
            </div>
            <span className="text-gray-500 text-lg">AmonHub</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">{children}</CardContent>
      </Card>
    </div>
  );
}
