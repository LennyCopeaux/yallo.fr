"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
  withVignette?: boolean;
}

export function DotPattern({
  className,
  dotColor = "rgba(255, 255, 255, 0.15)",
  dotSize = 1,
  spacing = 20,
  withVignette = true,
}: DotPatternProps) {
  // useId() generates stable IDs across server/client renders
  const patternId = useId();

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={spacing / 2} cy={spacing / 2} r={dotSize} fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      
      {/* Vignette effect - radial gradient that fades dots at edges */}
      {withVignette && (
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, transparent 50%, hsl(var(--background)) 90%, hsl(var(--background)) 100%)`
          }}
        />
      )}
    </div>
  );
}

// Preset variations - More visible dots
export function DotPatternHero({ className }: { className?: string }) {
  return (
    <DotPattern
      className={className}
      dotColor="rgba(255, 255, 255, 0.12)"
      dotSize={1}
      spacing={22}
      withVignette={true}
    />
  );
}

export function DotPatternSubtle({ className }: { className?: string }) {
  return (
    <DotPattern
      className={className}
      dotColor="rgba(255, 255, 255, 0.08)"
      dotSize={1}
      spacing={20}
      withVignette={true}
    />
  );
}
