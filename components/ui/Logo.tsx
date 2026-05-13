import Image from "next/image";

export default function PernahgaLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/favicon.ico" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
    </div>
  );
}
