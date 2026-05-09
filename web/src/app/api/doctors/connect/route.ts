import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { PatientDoctor } from "@/models/PatientDoctor";
import { verifyToken } from "@/lib/auth";
import { Notification } from "@/models/Notification";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    let decoded;
    try {
      decoded = verifyToken(token) as { id: string, role: string };
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const patientId = decoded.id;
    const { doctorId } = await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    await connectDB();

    // Check existing
    const existing = await PatientDoctor.findOne({ patientId, doctorId });
    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await PatientDoctor.create({
      patientId,
      doctorId,
      status: "pending",
      consentGiven: true,
      consentDate: new Date()
    });

    // Notify doctor
    await Notification.create({
      userId: doctorId,
      type: "new_patient",
      title: "New Patient Connection Request",
      body: "A new patient has requested to connect with you.",
      priority: "normal",
      metadata: { patientId }
    });

    return NextResponse.json({ success: true, connection });
  } catch (error) {
    console.error("Failed to connect to doctor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
