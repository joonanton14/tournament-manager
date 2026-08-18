import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "fifa_admin_session";
const ISSUER = "fifa-tournament-manager";
const AUDIENCE = "fifa-admin";

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not configured.",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession() {
  const token = await new SignJWT({
    role: "admin",
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("8h")
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(
  token?: string,
): Promise<boolean> {
  try {
    const sessionToken =
      token ??
      (await cookies()).get(
        COOKIE_NAME,
      )?.value;

    if (!sessionToken) {
      return false;
    }

    const { payload } =
      await jwtVerify(
        sessionToken,
        getSecret(),
        {
          issuer: ISSUER,
          audience: AUDIENCE,
          algorithms: ["HS256"],
        },
      );

    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const authenticated =
    await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error(
      "Unauthorized.",
    );
  }
}

export { COOKIE_NAME };