import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "pernahgaofficial@gmail.com";
  const password = "@RAGILgg12345";
  
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      name: "Super Admin",
      email: email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin account created/updated:", email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
