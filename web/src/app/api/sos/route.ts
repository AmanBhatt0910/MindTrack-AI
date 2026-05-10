import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { SOSAlert } from "@/models/SOSAlert";
import { PatientDoctor } from "@/models/PatientDoctor";
import mongoose from "mongoose";

// GET active SOS alerts for a doctor
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    if (user.role === "doctor") {
      // Find active patients for this doctor
      const connections = await PatientDoctor.find({
        doctorId: user.id,
        status: "active",
      }).select("patientId");

      const patientIds = connections.map((c) => c.patientId);

      // Find active SOS alerts for these patients
      const alerts = await SOSAlert.find({
        patientId: { $in: patientIds },
        status: "active",
      }).sort({ createdAt: -1 });

      return NextResponse.json(alerts);
    }

    if (user.role === "patient") {
      // Patients shouldn't poll this, but just in case, return their own active alerts
      const alerts = await SOSAlert.find({
        patientId: user.id,
        status: "active",
      }).sort({ createdAt: -1 });
      
      return NextResponse.json(alerts);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    console.error("GET /api/sos error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH to resolve an SOS alert
export async function PATCH(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { alertId } = body;

    if (!alertId) {
      return NextResponse.json({ error: "Missing alertId" }, { status: 400 });
    }

    await connectDB();

    const alert = await SOSAlert.findById(alertId);
    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    // A doctor can resolve an alert. We could verify the doctor is assigned to the patient,
    // but for emergencies, any authorized doctor (or the assigned one) can resolve it.
    if (user.role !== "doctor" && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    alert.status = "resolved";
    alert.resolvedAt = new Date();
    await alert.save();

    return NextResponse.json(alert);
  } catch (error: any) {
    console.error("PATCH /api/sos error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
