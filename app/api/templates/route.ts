import { NextResponse } from "next/server";
import { templates } from "@/data/templates";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(320);
  return NextResponse.json(templates);
}
