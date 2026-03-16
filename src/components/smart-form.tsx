"use client";

import { useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";

export function SmartForm({ 
  action, 
  children, 
  className,
  placeholder 
}: { 
  action: (formData: FormData) => void; 
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  
  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }} 
      className={className}
    >
      {children}
    </form>
  );
}

export function SubmitButton({ 
  children, 
  className,
  activeClassName 
}: { 
  children: React.ReactNode; 
  className?: string;
  activeClassName?: string;
}) {
  const { pending } = useFormStatus();
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className={`${className} ${pending ? activeClassName : ""}`}
    >
      {pending ? "..." : children}
    </button>
  );
}
