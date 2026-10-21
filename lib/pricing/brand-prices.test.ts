import assert from "node:assert/strict";
import test from "node:test";
import { customerPriceCents, withCustomerPrices } from "./brand-prices";

test("the four requested brands double their supplier prices", () => {
  for (const slug of ["roly", "mukua", "velilla", "vpro", " ROLY "]) {
    assert.equal(customerPriceCents(1299, { slug }), 2598);
    assert.equal(customerPriceCents(0, { slug }), 0);
  }
});

test("other brands and products without a brand keep their prices", () => {
  for (const brand of [{ slug: "workteam" }, { slug: "roly-other" }, null, undefined]) {
    assert.equal(customerPriceCents(1299, brand), 1299);
  }
});

test("storefront ranges and variants change together without changing source data", () => {
  const source = {
    brand: { slug: "velilla" },
    minPriceCents: 101,
    maxPriceCents: 1599,
    variants: [{ id: "small", priceCents: 101 }, { id: "large", priceCents: 1599 }],
  };
  const result = withCustomerPrices(source);
  assert.equal(result.minPriceCents, 202);
  assert.equal(result.maxPriceCents, 3198);
  assert.deepEqual(result.variants.map((variant) => variant.priceCents), [202, 3198]);
  assert.equal(source.minPriceCents, 101);
  assert.equal(source.variants[0].priceCents, 101);
  assert.equal(withCustomerPrices({ brand: null, minPriceCents: null }).minPriceCents, null);
});
