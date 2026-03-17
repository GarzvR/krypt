"use client";

import { useRef } from "react";

export function FormReset({ children }: { children: React.ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={async () => {
      // Internal reset wrapper
    }}>
      {children}
    </form>
  );
}
