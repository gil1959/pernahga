import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "test@pernahga.com";
  const password = "User@123";
  
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "USER", // Ensures it's a standard user
    },
    create: {
      name: "User Tester",
      email: email,
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("Akun tester berhasil dibuat!");
  console.log("--------------------------------");
  console.log(`Email    : ${email}`);
  console.log(`Password : ${password}`);
  console.log("--------------------------------");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
