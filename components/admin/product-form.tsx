import { deleteProductImage, deleteVariant, saveProduct, saveVariant, updateProductImage } from "@/app/admin/actions";
import { ProductImageForm } from "@/components/admin/product-image-form";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { centsToEuros } from "@/lib/admin/utils";

type CategoryOption = { id: string; name: string };
type BrandOption = { id: string; name: string };

type ProductFormProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  gender: string | null;
  material: string | null;
  categoryId: string | null;
  brandId: string | null;
  isActive: boolean;
  isFeatured: boolean;
  images: { id: string; url: string; alt: string | null; position: number }[];
  variants: {
    id: string;
    sku: string;
    name: string;
    color: string | null;
    size: string | null;
    priceCents: number;
    stock: number;
    isActive: boolean;
  }[];
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-[#151515]">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass = "premium-focus h-11 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 text-sm";

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: ProductFormProduct | null;
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const isNew = !product;

  return (
    <div className="grid gap-6">
      <form action={saveProduct} className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <input className={inputClass} name="name" defaultValue={product?.name ?? ""} required />
          </Field>
          <Field label="Slug">
            <input className={inputClass} name="slug" defaultValue={product?.slug ?? ""} placeholder="se-genera-si-se-deja-vacio" />
          </Field>
          <Field label="SKU principal">
            <input className={inputClass} name="sku" defaultValue={product?.sku ?? ""} placeholder="Se genera si se deja vacío" />
          </Field>
          <Field label="Género">
            <input className={inputClass} name="gender" defaultValue={product?.gender ?? ""} placeholder="Unisex, Hombre, Mujer..." />
          </Field>
          <Field label="Material">
            <input className={inputClass} name="material" defaultValue={product?.material ?? ""} placeholder="Algodón, poliéster, piel..." />
          </Field>
          <Field label="Categoría">
            <select className={inputClass} name="categoryId" defaultValue={product?.categoryId ?? ""}>
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Marca">
            <select className={inputClass} name="brandId" defaultValue={product?.brandId ?? ""}>
              <option value="">Sin marca</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input name="isActive" type="checkbox" defaultChecked={product?.isActive ?? true} className="h-4 w-4 accent-[var(--accent)]" />
              Disponible en la web
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input name="isFeatured" type="checkbox" defaultChecked={product?.isFeatured ?? false} className="h-4 w-4 accent-[var(--accent)]" />
              Destacado
            </label>
          </div>
        </div>
        <Field label="Descripción">
          <textarea className="premium-focus min-h-32 w-full rounded-[var(--radius-sm)] border border-[#d8d1c5] bg-white px-3 py-3 text-sm" name="description" defaultValue={product?.description ?? ""} />
        </Field>
        {isNew ? (
          <div className="mt-5 grid gap-4 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-4 md:grid-cols-3">
            <Field label="Imagen inicial desde archivo">
              <input className={inputClass} name="initialImageFile" type="file" accept="image/jpeg,image/png,image/webp,image/avif" />
            </Field>
            <Field label="O URL de imagen inicial">
              <input className={inputClass} name="initialImageUrl" placeholder="https://... o /images/..." />
            </Field>
            <Field label="Alt imagen inicial">
              <input className={inputClass} name="initialImageAlt" placeholder="Descripción breve" />
            </Field>
          </div>
        ) : null}
        <button className="mt-5 inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] bg-[#151515] px-5 text-sm font-semibold text-white" type="submit">
          {isNew ? "Crear producto" : "Guardar cambios"}
        </button>
      </form>

      {!product ? null : (
        <>
          <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <h2 className="text-xl font-semibold">Imágenes</h2>
            <div className="mt-4 rounded-[var(--radius-sm)] border border-[#e7e2d8] bg-[#f7f5f0] p-4">
              <h3 className="text-sm font-semibold text-[#151515]">Imágenes cargadas</h3>
              {product.images.length ? (
                <div className="mt-3 grid gap-3">
                  {product.images.map((image) => (
                    <form key={image.id} action={updateProductImage} className="grid gap-3 rounded-[var(--radius-sm)] border border-[#e7e2d8] bg-white p-3 lg:grid-cols-[120px_1fr_90px_1fr_auto] lg:items-end">
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="productId" value={product.id} />
                      <div>
                        <p className="mb-2 text-xs font-semibold text-[#62615d]">Vista previa</p>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-sm)] bg-[#f7f5f0]">
                          <ImageWithFallback src={image.url} fallbackSrc="/images/products/product-image-pending.svg" alt={image.alt ?? product.name} fill sizes="120px" className="object-cover" />
                        </div>
                      </div>
                      <Field label="URL">
                        <input className={inputClass} name="url" defaultValue={image.url} required />
                      </Field>
                      <Field label="Orden">
                        <input className={inputClass} name="position" type="number" defaultValue={image.position} />
                      </Field>
                      <Field label="Alt">
                        <input className={inputClass} name="alt" defaultValue={image.alt ?? ""} placeholder="Descripción breve" />
                      </Field>
                      <div className="flex gap-2">
                        <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">Guardar</button>
                        <button formAction={deleteProductImage} className="h-10 rounded-[var(--radius-sm)] border border-red-200 px-4 text-sm font-semibold text-red-600" type="submit">Eliminar</button>
                      </div>
                    </form>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-[var(--radius-sm)] bg-white px-3 py-2 text-sm text-[#62615d]">
                  Este producto todavía no tiene imágenes cargadas.
                </p>
              )}
            </div>
            <ProductImageForm productId={product.id} />
          </section>

          <section className="rounded-[var(--radius-md)] border border-[#e7e2d8] bg-white p-5">
            <h2 className="text-xl font-semibold">Variantes, precios y disponibilidad</h2>
            <div className="mt-4 grid gap-3">
              {product.variants.map((variant) => (
                <form key={variant.id} action={saveVariant} className="grid gap-3 rounded-[var(--radius-sm)] border border-[#e7e2d8] p-3 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr_0.7fr_auto] md:items-end">
                  <input type="hidden" name="id" value={variant.id} />
                  <input type="hidden" name="productId" value={product.id} />
                  <Field label="SKU"><input className={inputClass} name="sku" defaultValue={variant.sku} required /></Field>
                  <Field label="Nombre"><input className={inputClass} name="name" defaultValue={variant.name} /></Field>
                  <Field label="Color"><input className={inputClass} name="color" defaultValue={variant.color ?? ""} /></Field>
                  <Field label="Talla"><input className={inputClass} name="size" defaultValue={variant.size ?? ""} /></Field>
                  <Field label="Precio €"><input className={inputClass} name="price" type="number" step="0.01" defaultValue={centsToEuros(variant.priceCents)} required /></Field>
              <input type="hidden" name="stock" value={variant.stock} />
              <label className="flex items-center gap-2 pb-3 text-sm font-medium">
                <input name="isActive" type="checkbox" defaultChecked={variant.isActive} className="h-4 w-4 accent-[var(--accent)]" />
                Variante disponible
                  </label>
                  <div className="flex gap-2 md:col-span-7">
                    <button className="h-10 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white" type="submit">Guardar variante</button>
                    <button formAction={deleteVariant} className="h-10 rounded-[var(--radius-sm)] border border-red-200 px-4 text-sm font-semibold text-red-600" type="submit">Eliminar</button>
                  </div>
                </form>
              ))}
            </div>
            <form action={saveVariant} className="mt-5 grid gap-3 rounded-[var(--radius-sm)] bg-[#f7f5f0] p-4 md:grid-cols-3">
              <input type="hidden" name="productId" value={product.id} />
              <Field label="SKU"><input className={inputClass} name="sku" required /></Field>
              <Field label="Nombre"><input className={inputClass} name="name" /></Field>
              <Field label="Color"><input className={inputClass} name="color" /></Field>
              <Field label="Talla"><input className={inputClass} name="size" /></Field>
              <Field label="Precio €"><input className={inputClass} name="price" type="number" step="0.01" required /></Field>
              <input type="hidden" name="stock" value="999" />
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="isActive" type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--accent)]" />
                Variante disponible
              </label>
              <button className="h-11 rounded-[var(--radius-sm)] bg-[#151515] px-4 text-sm font-semibold text-white md:col-span-3" type="submit">Añadir variante</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
