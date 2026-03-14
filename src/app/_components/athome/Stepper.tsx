"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/app/_components/shadcn/ui/button";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  label: string;
  points: number;
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max,
  label,
  points,
}: StepperProps) {
  const contribution = value * points;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200 leading-tight">{label}</p>
        <p
          className={cn(
            "text-xs font-mono mt-0.5",
            points >= 0 ? "text-emerald-400" : "text-red-400",
          )}
        >
          {points >= 0 ? "+" : ""}
          {points} pts each
          {contribution !== 0 && (
            <span className="ml-2 font-semibold">
              = {contribution >= 0 ? "+" : ""}
              {contribution}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
        >
          −
        </Button>
        <span className="w-8 text-center text-sm font-bold text-white">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
}
