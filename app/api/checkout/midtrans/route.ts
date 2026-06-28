import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { packageId, voucher } = await req.json();
    if (!packageId) {
      return NextResponse.json({ message: "Package ID required" }, { status: 400 });
    }

    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    });
    
    if (!pkg) {
      return NextResponse.json({ message: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Ambil setting midtrans dari database
    const settings = await prisma.siteSettings.findMany({
      where: {
        key: {
          in: ["midtransEnabled", "midtransServerKey", "midtransIsProduction"]
        }
      }
    });

    const getSetting = (k: string) => settings.find((s) => s.key === k)?.value;
    
    const isEnabled = getSetting("midtransEnabled") === "true";
    const serverKey = getSetting("midtransServerKey");
    const isProd = getSetting("midtransIsProduction") === "true";

    if (!isEnabled || !serverKey) {
      return NextResponse.json({ message: "Pembayaran Midtrans sedang tidak aktif atau belum dikonfigurasi oleh admin." }, { status: 400 });
    }

    // Tentukan URL API Midtrans Snap
    const apiUrl = isProd 
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Buat Order ID yang unik
    const orderId = `ORDER-${session.user.id.substring(0, 5)}-${Date.now()}`;
    
    // Parse harga (bersihkan dari karakter non-digit)
    const priceStr = pkg.price.replace(/\D/g, "");
    let amount = parseInt(priceStr, 10);
    if (isNaN(amount) || amount <= 0) {
       return NextResponse.json({ message: "Harga paket tidak valid untuk pembayaran otomatis" }, { status: 400 });
    }

    // Encode server key ke Base64 untuk header Authorization Basic
    const authString = Buffer.from(serverKey + ":").toString("base64");

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: session.user.name || "Customer",
        email: session.user.email,
        phone: session.user.phone || "",
      },
      item_details: [
        {
          id: pkg.id,
          price: amount,
          quantity: 1,
          name: pkg.title.substring(0, 50),
        }
      ],
    };

    const midtransRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const midtransData = await midtransRes.json();

    if (!midtransRes.ok) {
      console.error("Midtrans Error:", midtransData);
      return NextResponse.json({ message: "Gagal memproses pembayaran ke payment gateway (Midtrans error)" }, { status: 500 });
    }

    // Berhasil, return redirect URL
    return NextResponse.json({ 
      redirectUrl: midtransData.redirect_url,
      token: midtransData.token
    });

  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
