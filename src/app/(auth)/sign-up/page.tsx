import Link from "next/link";
import { signUpAction } from "@/actions/auth";

type SignUpPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const error = searchParams?.error;

  return (
    <div>
      <p className="text-sm text-app-muted">Create account</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground sm:text-4xl">
        Start free
      </h2>
      <p className="mt-3 text-sm leading-7 text-app-muted">
        Create your workspace and start managing projects, environments, and
        encrypted secrets.
      </p>

      {error ? (
        <p className="mt-5 border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </p>
      ) : null}

      <form action={signUpAction} className="mt-8 space-y-5">
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

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-app-foreground">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 w-full border border-app bg-transparent px-4 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
            placeholder="At least 8 characters"
          />
        </label>

        <button
          type="submit"
          className="w-full border border-app bg-app-primary px-4 py-3 text-sm font-semibold text-app-primary-foreground transition hover:opacity-90"
        >
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-app-muted">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-app-foreground hover:text-app-accent"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
