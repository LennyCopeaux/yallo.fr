"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {
  forcedTheme?: string;
}

export function ThemeProvider({
  children,
  forcedTheme,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      {...props}
      {...(forcedTheme ? { forcedTheme } : {})}
    >
      {children}
    </NextThemesProvider>
  );
}
