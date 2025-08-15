"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface FormStatusProps {
  isLoading: boolean;
  progress: number;
}

export function FormStatus({ isLoading, progress }: FormStatusProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 50);
    return () => clearTimeout(timer);
  }, [progress]);

  if (!isLoading) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Validating document, please wait...</span>
      </div>
      <Progress value={animatedProgress} className="w-full" />
    </div>
  );
}
