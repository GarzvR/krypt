"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({ label = "Password", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-app-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          className="h-12 w-full border border-app bg-transparent px-4 pr-12 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeSlash size={20} weight="light" />
          ) : (
            <Eye size={20} weight="light" />
          )}
        </button>
      </div>
    </label>
  );
}
