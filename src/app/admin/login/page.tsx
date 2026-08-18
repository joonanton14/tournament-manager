"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/admin/login/actions";

export default function AdminLoginPage() {
  const [isPending, startTransition] =
    useTransition();

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const formData = new FormData();

    formData.set(
      "password",
      password,
    );

    startTransition(async () => {
      const result =
        await loginAction(formData);

      if (!result?.success) {
        setError(
          result?.error ??
            "Login failed.",
        );
      }
    });
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-lg font-black text-white shadow-lg shadow-violet-600/20">
            FT
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-violet-600">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            Admin login
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Sign in to manage tournaments, teams,
            players and results.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}