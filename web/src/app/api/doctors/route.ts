import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { PatientDoctor } from "@/models/PatientDoctor";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
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

    await connectDB();

    // Find all doctors
    const doctors = await User.find({ role: "doctor" }, "name email").lean();

    // Find current patient's connections
    const connections = await PatientDoctor.find({ patientId }).lean();
    
    const doctorList = doctors.map(doc => {
      const conn = connections.find(c => c.doctorId.toString() === doc._id.toString());
      return {
        id: doc._id,
        name: doc.name,
        email: doc.email,
        connectionStatus: conn ? conn.status : null
      };
    });

    return NextResponse.json(doctorList);
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
