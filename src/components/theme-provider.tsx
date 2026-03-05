"use client";

import * as React from "react";

export function ThemeProvider({
  children,
}: React.PropsWithChildren<Record<string, unknown>>) {
  return <>{children}</>;
}
