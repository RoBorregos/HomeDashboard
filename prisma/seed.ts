import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("RoboCup@Home 2026 — Seed");
  console.log("Users are created automatically when signing in with Google OAuth.");
  console.log("No manual seeding required.");

  // Show existing users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  if (users.length === 0) {
    console.log("\nNo users yet. Sign in with Google to create the first user.");
  } else {
    console.log(`\nExisting users (${users.length}):`);
    for (const u of users) {
      console.log(`  - ${u.name ?? "unnamed"} (${u.email ?? "no email"}) [${u.id}]`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
