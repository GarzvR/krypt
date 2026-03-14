import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { PasswordInput } from "@/components/auth/password-input";

type SignInPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignInPage({ searchParams }: SignInPageProps) {
  const error = searchParams?.error;

  return (
    <div>
      <p className="text-sm text-app-muted">Welcome back</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground sm:text-4xl">
        Sign in
      </h2>


      {error ? (
        <p className="mt-5 border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <form action={signInAction} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-app-foreground">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="h-12 w-full border border-app bg-transparent px-4 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
            placeholder="you@company.com"
          />
        </label>

        <PasswordInput
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          placeholder="Your password"
        />

        <button
          type="submit"
          className="w-full border border-app bg-app-primary px-4 py-3 text-sm font-semibold text-app-primary-foreground transition hover:opacity-90"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-sm text-app-muted">
        Need an account?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-app-foreground hover:text-app-accent"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
