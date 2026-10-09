import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.session) return auth.response!;

  return NextResponse.json({
    success: true,
    admin: {
      id: auth.session.sub,
      name: auth.session.name,
      email: auth.session.email,
      role: auth.session.role,
    },
  });
}
