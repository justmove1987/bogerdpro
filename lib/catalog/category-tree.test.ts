import assert from "node:assert/strict";
import test from "node:test";
import { categoryCatalogGroup, categoryDescendants, categoryPath } from "./category-tree";

const categories = [
  { id: "sport", name: "Sport, casual, promo y eventos", parentId: null, catalogGroup: "sport-promo" },
  { id: "pants", name: "Pantalones", parentId: "sport" },
  { id: "women", name: "Mujer", parentId: "pants" },
  { id: "health", name: "Sanidad", parentId: null, catalogGroup: "healthcare" },
];

test("a parent filter includes all descendants without including other sectors", () => {
  assert.deepEqual([...categoryDescendants(categories, "sport")], ["sport", "pants", "women"]);
  assert.deepEqual([...categoryDescendants(categories, "pants")], ["pants", "women"]);
});
test("manual sector is inherited across levels and follows category moves", () => {
  assert.equal(categoryCatalogGroup(categories, "women"), "sport-promo");
  const moved = categories.map((category) => category.id === "pants" ? { ...category, parentId: "health" } : category);
  assert.equal(categoryCatalogGroup(moved, "women"), "healthcare");
  assert.equal(categoryCatalogGroup(categories, undefined), null);
});
test("paths distinguish categories and cycles cannot loop indefinitely", () => {
  assert.equal(categoryPath(categories, "women"), "Sport, casual, promo y eventos > Pantalones > Mujer");
  const cyclic = [{ id: "a", name: "A", parentId: "b" }, { id: "b", name: "B", parentId: "a" }];
  assert.equal(categoryDescendants(cyclic, "a").size, 2);
  assert.equal(categoryCatalogGroup(cyclic, "a"), null);
  assert.equal(categoryPath(cyclic, "a"), "B > A");
});
