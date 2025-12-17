import { NextResponse } from "next/server";
import { models } from "@/data/models";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  await delay(350);
  return NextResponse.json(models);
}
