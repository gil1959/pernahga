import AdminSidebar from "@/components/admin/Sidebar";
import SessionProvider from "@/components/providers/SessionProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9f8f6" }}>
        <AdminSidebar />
        <main
          style={{
            flex: 1,
            marginLeft: "260px",
            padding: "2rem 3rem",
            width: "calc(100% - 260px)",
          }}
        >
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
