# BogerdPro Ecommerce

Base profesional para migrar BogerdPro de WordPress a una plataforma ecommerce moderna con Next.js.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- NextAuth/Auth.js con credenciales para admin
- Stripe Checkout
- Upload local preparado para sustituirse por S3
- Importación CSV de productos

## Empezar

1. Copia `.env.example` a `.env` y ajusta `DATABASE_URL`, `NEXTAUTH_SECRET` y Stripe.
2. Ejecuta `npm run db:generate`.
3. Ejecuta `npm run db:migrate`.
4. Ejecuta `npm run db:seed` para crear el usuario admin inicial.
5. Ejecuta `npm run dev`.

## Idiomas

El idioma principal será el castellano. La plataforma queda preparada para añadir catalán, inglés y neerlandés desde `config/i18n.ts`.

## Estructura

- `app/(store)`: web pública, catálogo, ficha de producto y carrito.
- `app/admin`: panel privado para productos, pedidos e importaciones.
- `app/api`: auth, checkout, uploads e importación CSV.
- `lib`: servicios compartidos de Prisma, auth, Stripe, uploads y CSV.
- `prisma/schema.prisma`: modelo de datos ecommerce.
- `public/uploads`: destino local temporal para imágenes.

## CSV inicial

Columnas esperadas:

```csv
sku,name,slug,description,brand,category,variantSku,variantName,priceCents,stock
PROD-001,Chaqueta técnica,chaqueta-tecnica,Descripción,BogerdPro,Alta visibilidad,PROD-001-STD,Estándar,12900,10
```
