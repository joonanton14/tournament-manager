import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME =
  "fifa_admin_session";

const ISSUER =
  "fifa-tournament-manager";

const AUDIENCE =
  "fifa-admin";

function getSecret() {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(
    secret,
  );
}

async function isAuthenticated(
  request: NextRequest,
) {
  const secret = getSecret();

  if (!secret) {
    return false;
  }

  const token =
    request.cookies.get(
      COOKIE_NAME,
    )?.value;

  if (!token) {
    return false;
  }

  try {
    const { payload } =
      await jwtVerify(
        token,
        secret,
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

export async function proxy(
  request: NextRequest,
) {
  const pathname =
    request.nextUrl.pathname;

  if (
    pathname === "/admin/login"
  ) {
    const authenticated =
      await isAuthenticated(request);

    if (authenticated) {
      return NextResponse.redirect(
        new URL(
          "/admin",
          request.url,
        ),
      );
    }

    return NextResponse.next();
  }

  const authenticated =
    await isAuthenticated(request);

  if (!authenticated) {
    const loginUrl =
      new URL(
        "/admin/login",
        request.url,
      );

    loginUrl.searchParams.set(
      "next",
      pathname,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/players/:path*",
    "/teams/:path*",
    "/tournaments/:path*",
  ],
};