"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function PasswordInput({ label = "Password", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const getStrengthColor = (score: number) => {
    if (score <= 25) return "bg-rose-500";
    if (score <= 50) return "bg-orange-500";
    if (score <= 75) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-app-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          onChange={(e) => {
            setStrength(calculateStrength(e.target.value));
            props.onChange?.(e);
          }}
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
      {props.value !== undefined || props.defaultValue === undefined ? (
        <div className="mt-2 h-1 w-full bg-white/10">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(
              strength
            )}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      ) : null}
    </label>
  );
}
