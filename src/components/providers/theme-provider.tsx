"use client";

import * as React from "react";

export function ThemeProvider({ children }: Readonly<React.PropsWithChildren>) {
  return <>{children}</>;
}
