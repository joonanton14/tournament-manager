"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/auth";

export async function loginAction(
  formData: FormData,
) {
  const passwordValue =
    formData.get("password");

  const password =
    typeof passwordValue === "string"
      ? passwordValue
      : "";

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is not configured.",
    );
  }

  if (password !== adminPassword) {
    return {
      success: false,
      error: "Incorrect password.",
    };
  }

  await createAdminSession();

  redirect("/admin");
}