import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { prisma } from "../lib/db/prisma";
import { categoryCatalogGroup } from "../lib/catalog/category-tree";
import { catalogGroupKeys, type CatalogGroupKey } from "../lib/catalog/catalog-groups";
import { inferProductCatalogGroups } from "../lib/catalog/product-catalog-groups";

async function main() {
  const groupArg = process.argv.find((arg) => arg.startsWith("--group="))?.slice(8) ?? "healthcare";
  if (!catalogGroupKeys.includes(groupArg as CatalogGroupKey)) throw new Error("Unknown catalog group");
  const group = groupArg as CatalogGroupKey;
  const apply = process.argv.includes("--apply");
  const [categories, products] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({ include: { category: true, brand: true, catalogGroups: true } }),
  ]);
  const changes = products.flatMap((product) => {
    const manual = categoryCatalogGroup(categories, product.categoryId);
    const groups = manual ? [manual] : inferProductCatalogGroups(product);
    const before = product.catalogGroups.some((item) => item.group === group);
    const after = groups.includes(group);
    return before === after ? [] : [{ id: product.id, name: product.name, category: product.category?.name, before, after }];
  });
  const report = { group, before: products.filter((p) => p.catalogGroups.some((g) => g.group === group)).length, removed: changes.filter((p) => !p.after).length, added: changes.filter((p) => p.after).length, manualCategoriesPreserved: products.filter((p) => categoryCatalogGroup(categories, p.categoryId)).length, changes };
  await mkdir("tmp", { recursive: true });
  await writeFile(`tmp/classification-${group}-${apply ? "apply" : "preview"}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ ...report, changes: changes.slice(0, 12) }, null, 2));
  if (!apply) { console.log("Preview only. Use --apply to update this group."); return; }
  // Only this sector changes; other groups and manual category assignments stay intact.
  await prisma.$transaction(async (tx) => {
    await tx.productCatalogGroup.deleteMany({ where: { group, productId: { in: changes.filter((p) => !p.after).map((p) => p.id) } } });
    await tx.productCatalogGroup.createMany({ data: changes.filter((p) => p.after).map((p) => ({ productId: p.id, group })), skipDuplicates: true });
  });
  console.log(`Updated ${changes.length} product memberships for ${group}.`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
