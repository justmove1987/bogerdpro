import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { normalizeColorGroup, normalizeSizeGroup } from "../lib/catalog/filter-groups";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const variants = await prisma.productVariant.findMany({
    select: { id: true, color: true, size: true },
  });
  const groups = new Map<string, { colorGroup: ReturnType<typeof normalizeColorGroup>; sizeGroup: ReturnType<typeof normalizeSizeGroup>; ids: string[] }>();

  for (const variant of variants) {
    const colorGroup = normalizeColorGroup(variant.color);
    const sizeGroup = normalizeSizeGroup(variant.size);
    const key = `${colorGroup ?? ""}:${sizeGroup ?? ""}`;
    const group = groups.get(key) ?? { colorGroup, sizeGroup, ids: [] };
    group.ids.push(variant.id);
    groups.set(key, group);
  }

  const groupedUpdates = [...groups.values()];

  for (let index = 0; index < groupedUpdates.length; index += 10) {
    await Promise.all(
      groupedUpdates.slice(index, index + 10).map((group) =>
        prisma.productVariant.updateMany({
          where: { id: { in: group.ids } },
          data: {
            colorGroup: group.colorGroup,
            sizeGroup: group.sizeGroup,
          },
        }),
      ),
    );
  }

  console.log(`Updated ${variants.length} variants in ${groupedUpdates.length} standard filter groups.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
