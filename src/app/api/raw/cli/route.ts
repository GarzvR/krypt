import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "cli", "krypt.js");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "CLI script not found" }, { status: 404 });
    }

    const script = fs.readFileSync(filePath, "utf-8");

    return new NextResponse(script, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error serving CLI script:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
