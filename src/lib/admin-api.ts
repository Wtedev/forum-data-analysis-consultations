import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";

export async function requireAdminApi() {
  const session = await getAdminSession();
  if (!session) {
    return { session: null, response: unauthorized() };
  }
  return { session, response: null };
}

export function unauthorized() {
  return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

export function notFound(message = "غير موجود") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}

export function serverError(message = "حدث خطأ في الخادم") {
  return NextResponse.json({ success: false, message }, { status: 500 });
}
