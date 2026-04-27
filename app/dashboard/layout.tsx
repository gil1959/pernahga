import UserSidebar from "@/components/dashboard/Sidebar";
import SessionProvider from "@/components/providers/SessionProvider";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SessionProvider>
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F4F1EA" }}>
          <UserSidebar />
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
    </NextIntlClientProvider>
  );
}
