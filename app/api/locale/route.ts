import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { locale } = await request.json();
  const validLocale = ["id", "en"].includes(locale) ? locale : "id";
  
  const response = NextResponse.json({ success: true, locale: validLocale });
  response.cookies.set("locale", validLocale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  
  return response;
}
