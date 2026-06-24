import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const SUGGESTIONS_FILE = path.join(process.cwd(), "data", "suggestions.json");

// Ma'lumotlar papkasini va faylini yaratish
async function ensureFile() {
  const dir = path.dirname(SUGGESTIONS_FILE);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  try {
    await fs.access(SUGGESTIONS_FILE);
  } catch {
    await fs.writeFile(SUGGESTIONS_FILE, "[]", "utf-8");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, note, lat, lon, timestamp } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Nom kiritilishi shart" }, { status: 400 });
    }

    await ensureFile();

    // Mavjud takliflarni o'qish
    const raw = await fs.readFile(SUGGESTIONS_FILE, "utf-8");
    const suggestions = JSON.parse(raw);

    // Yangi taklif
    const newSuggestion = {
      id: Date.now(),
      name: name.trim(),
      note: note?.trim() || "",
      lat: lat || null,
      lon: lon || null,
      timestamp: timestamp || new Date().toISOString(),
      status: "pending",
    };

    suggestions.push(newSuggestion);

    await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2), "utf-8");

    return NextResponse.json({ success: true, suggestion: newSuggestion });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await ensureFile();
    const raw = await fs.readFile(SUGGESTIONS_FILE, "utf-8");
    const suggestions = JSON.parse(raw);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
