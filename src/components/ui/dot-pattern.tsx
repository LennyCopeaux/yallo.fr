"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface DotPatternProps {
  className?: string;
  dotSize?: number;
  spacing?: number;
  withVignette?: boolean;
  patternId?: string;
}

export function DotPattern({
  className,
  dotSize = 1,
  spacing = 20,
  withVignette = true,
  patternId,
}: Readonly<DotPatternProps>) {
  // Keep a deterministic fallback, but allow explicit IDs for hydration-sensitive views.
  const generatedPatternId = useId();
  const resolvedPatternId = patternId ?? generatedPatternId;

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={resolvedPatternId}
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <circle 
              cx={spacing / 2} 
              cy={spacing / 2} 
              r={dotSize} 
              style={{ fill: 'var(--pattern)', fillOpacity: 'var(--dot-opacity)' }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${resolvedPatternId})`} />
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

// Preset variations - More visible dots (adaptive via CSS classes)
export function DotPatternHero({
  className,
  patternId,
}: Readonly<{ className?: string; patternId?: string }>) {
  return (
    <DotPattern
      className={className}
      dotSize={1}
      spacing={22}
      withVignette={true}
      patternId={patternId}
    />
  );
}

export function DotPatternSubtle({
  className,
  patternId,
}: Readonly<{ className?: string; patternId?: string }>) {
  return (
    <DotPattern
      className={className}
      dotSize={1}
      spacing={20}
      withVignette={true}
      patternId={patternId}
    />
  );
}
