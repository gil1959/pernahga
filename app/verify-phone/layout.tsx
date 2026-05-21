import SessionProvider from "@/components/providers/SessionProvider";

export default function VerifyPhoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
