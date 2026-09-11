import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Seeded so the category selector is useful on first run. An empty category list
// forces a setup task before the user's first real task. These are editable and
// deletable, so they don't feel imposed.
// Colour/icon assignments: docs/design/06-screens-categories-calendar.md §5.9.4
const categories = [
  { name: 'Work', color: 'indigo', icon: 'briefcase' },
  { name: 'Personal', color: 'rose', icon: 'user' },
  { name: 'Study', color: 'violet', icon: 'book-open' },
  { name: 'Health', color: 'emerald', icon: 'heart' },
];

async function main() {
  for (const category of categories) {
    // Upsert on the unique name keeps this idempotent: re-running never
    // duplicates a category, and never overwrites one the user has edited.
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
