import DoctorLayout from "@/features/doctor/components/DoctorLayout";

export default function DoctorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorLayout>{children}</DoctorLayout>;
}
