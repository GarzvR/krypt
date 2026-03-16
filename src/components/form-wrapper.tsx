"use client";

import { useRef, useEffect } from "react";

export function FormReset({ children }: { children: React.ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleReset = () => {
      formRef.current?.reset();
    };

    // We use a small hack to detect success if using server actions: 
    // Usually, you'd use useFormStatus or a specialized hook, 
    // but for simple auto-reset on submit, we can listen to the submit event 
    // and wait for the action to trigger.
  }, []);

  return (
    <form ref={formRef} action={async (formData) => {
      // This is a wrapper to allow internal reset call
    }}>
      {children}
    </form>
  );
}
