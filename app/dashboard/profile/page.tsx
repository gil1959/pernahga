import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User, Settings, Save } from "lucide-react";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return null;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#2D2D2D", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Profil & Pengaturan
        </h1>
        <p style={{ color: "#6b6b6b", fontSize: "1.05rem" }}>
          Kelola informasi personal dan preferensi akun Anda.
        </p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "16px", border: "1px solid #ede9df", overflow: "hidden", maxWidth: "800px" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid #ede9df", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <User size={20} color="#8DA399" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2D2D2D" }}>
            Informasi Pribadi
          </h2>
        </div>

        <div style={{ padding: "2rem" }}>
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
}
