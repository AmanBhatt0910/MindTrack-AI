import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

const VALID_ROLES = ["patient", "doctor"] as const;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role: requestedRole } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const role = VALID_ROLES.includes(requestedRole) ? requestedRole : "patient";

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const token = signToken({ id: user._id.toString(), role });

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role,
      },
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}