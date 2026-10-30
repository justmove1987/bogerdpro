import assert from "node:assert/strict";
import test from "node:test";
import { inferProductCatalogGroups } from "./product-catalog-groups";

const healthcare = (product: Parameters<typeof inferProductCatalogGroups>[0]) => inferProductCatalogGroups(product).includes("healthcare");

test("sports design and garment care do not imply a healthcare sector", () => {
  assert.equal(healthcare({ name: "Community 2.0 Pants", category: { name: "Pants" }, description: "Pantalón deportivo con una estética moderna. Fácil limpieza." }), false);
  assert.equal(healthcare({ name: "Chaqueta chef", description: "Conserva la estética. Lavado y limpieza en seco." }), false);
  assert.equal(healthcare({ name: "Botas agroalimentarias", description: "Facilitan la limpieza de las botas." }), false);
});
test("whole words prevent corbata/bata and epidermis/EPI collisions", () => {
  assert.equal(healthcare({ name: "Corbata", description: "Corbata sin nudo." }), false);
  assert.equal(inferProductCatalogGroups({ description: "Suave con la epidermis" }).includes("protective-equipment"), false);
});
test("accented words and plural healthcare families are recognized", () => {
  for (const family of ["BATAS", "CASACAS", "PIJAMAS", "Sanidad y servicios", "Health & Wellness"]) {
    assert.equal(healthcare({ category: { name: family } }), true, family);
  }
});
test("explicit supplier professions and collections outrank incidental prose", () => {
  assert.equal(healthcare({ name: "Blusa Mika", specifications: [{ label: "Profesión", value: "Dentistas, Enfermería, Veterinario" }] }), true);
  assert.equal(healthcare({ name: "Uplift Pant", specifications: [{ label: "Colección", value: "Health & Wellness" }] }), true);
  assert.equal(healthcare({ name: "Chaqueta", specifications: [{ label: "Tratamiento", value: "Limpieza en seco" }] }), false);
});
test("professional use and descriptions of healthcare garments remain valid evidence", () => {
  for (const description of ["Conjunto de casaca y pantalón.", "Pantalones para personal de limpieza.", "Uniforme para centros de estética.", "Prenda sanitaria de corte deportivo."]) {
    assert.equal(healthcare({ name: "Uniforme", description }), true, description);
  }
});
