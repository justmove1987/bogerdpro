# BogerdPro Ecommerce

Plataforma ecommerce B2B/B2C para BogerdPro, construida con Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, Stripe Checkout y Resend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Auth.js / NextAuth con credenciales
- Stripe Checkout y webhooks
- Resend para emails transaccionales
- Importación CSV de productos
- Upload local preparado para migrar a S3, Supabase Storage o Cloudflare R2

## Requisitos

- Node.js 22 o superior
- PostgreSQL, recomendado Supabase
- Cuenta Stripe
- Cuenta Resend para emails reales

## Instalación local

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

La app queda disponible en:

```txt
http://localhost:3000
```

## Variables de entorno

Nunca subas `.env` al repositorio. Solo `.env.example` debe estar versionado.

Variables obligatorias para producción:

```env
DATABASE_URL=""
DIRECT_URL=""
NEXTAUTH_URL="https://tudominio.com"
NEXTAUTH_SECRET=""
NEXT_PUBLIC_APP_URL="https://tudominio.com"
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

Variables recomendadas:

```env
RESEND_API_KEY=""
EMAIL_FROM="BogerdPro <no-reply@bogerdpro.com>"
ORDER_NOTIFICATION_EMAIL="admin@bogerdpro.com"
ADMIN_EMAIL=""
ADMIN_PASSWORD=""
```

Comprobar variables:

```bash
npm run check:env
```

## Base de datos

El modelo está en:

```txt
prisma/schema.prisma
```

Comandos:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

En producción usa migraciones controladas:

```bash
npx prisma migrate deploy
```

## Admin

El panel privado está en:

```txt
/admin
```

La protección se hace con:

```txt
lib/auth/guards.ts
app/admin/layout.tsx
```

Solo usuarios con rol `ADMIN` pueden acceder. El botón Admin solo aparece en el header si la sesión tiene rol `ADMIN`.

## Productos e importación CSV

Importación desde:

```txt
/admin/imports
```

Ejemplo:

```txt
public/examples/product-import-example.csv
```

Campos aceptados:

```csv
sku,name,description,category,subcategory,brand,price,stock,colors,sizes,images,attributes,isActive
```

Reglas:

- Si el SKU existe, actualiza producto.
- Si el SKU no existe, crea producto.
- Si la categoría no existe, la crea.
- Si la marca no existe, la crea.
- Colores, tallas e imágenes aceptan listas separadas por `|`.
- Los atributos usan formato `Clave=Valor|Clave=Valor`.
- El CSV se valida antes de importar.
- Tamaño máximo CSV: 2 MB.

## Imágenes

Uploads actuales:

```txt
public/uploads
```

Formatos permitidos:

```txt
JPG, PNG, WEBP, AVIF
```

Límite:

```txt
5 MB por imagen
```

Para producción con mucho catálogo se recomienda migrar a:

- Supabase Storage
- Cloudflare R2
- AWS S3

## Stripe

Checkout:

```txt
app/api/checkout/route.ts
```

Webhook:

```txt
app/api/stripe/webhook/route.ts
```

Eventos necesarios:

```txt
checkout.session.completed
checkout.session.expired
```

Endpoint de producción:

```txt
https://tudominio.com/api/stripe/webhook
```

Seguridad:

- El frontend solo envía `variantId` y `quantity`.
- El backend recalcula precios desde Prisma.
- Se crea una comanda pendiente antes del pago.
- Stripe confirma pago por webhook firmado.
- El stock baja solo después de confirmación de Stripe.
- No se guardan datos de tarjeta.

## Emails

Emails:

```txt
lib/email/resend.ts
lib/email/order-emails.ts
```

Se envían cuando Stripe confirma pago:

- Confirmación al cliente.
- Aviso al administrador.

Si `RESEND_API_KEY` no existe, el sistema hace dry-run y registra el intento en logs.

Para producción:

1. Crear cuenta en Resend.
2. Verificar dominio.
3. Crear API key.
4. Configurar:

```env
RESEND_API_KEY=""
EMAIL_FROM="BogerdPro <no-reply@tudominio.com>"
ORDER_NOTIFICATION_EMAIL="admin@tudominio.com"
```

## SEO

Incluye:

- Metadata global.
- Metadata dinámica por producto.
- Open Graph.
- Twitter cards.
- Schema.org `Product`.
- `sitemap.xml`.
- `robots.txt`.
- URLs amigables.

Rutas:

```txt
/sitemap.xml
/robots.txt
```

## Seguridad

Medidas incluidas:

- `.env` ignorado por Git.
- Admin protegido por sesión y rol.
- Webhook Stripe con verificación de firma.
- Checkout sin confiar en precios del frontend.
- Validación de CSV antes de importar.
- Límite de tamaño en CSV.
- Validación de formato y tamaño en uploads.
- APIs admin protegidas con `requireAdmin`.
- Carrito sin login, con validación de stock antes de pagar.

Pendientes recomendados antes de producción:

- Activar HTTPS.
- Rotar secretos si alguno fue compartido.
- Usar Stripe live keys.
- Usar Resend con dominio verificado.
- Mover uploads a storage externo.
- Activar backups de base de datos.
- Revisar permisos de Supabase.
- Configurar monitorización de errores.

## Backups recomendados

Supabase:

- Activar backups automáticos diarios.
- Revisar política de retención.
- Exportar backup antes de imports masivos.
- Mantener CSV originales versionados fuera de Git si contienen datos sensibles.

Imágenes:

- Si se usa storage externo, activar versionado o backups.
- Mantener copia offline de imágenes originales.

## Despliegue recomendado en Vercel

1. Subir repositorio a GitHub.
2. Crear proyecto en Vercel.
3. Conectar repositorio.
4. Configurar variables de entorno.
5. Build command:

```bash
npm run build
```

6. Install command:

```bash
npm install
```

7. Deploy.
8. Ejecutar migraciones en producción:

```bash
npx prisma migrate deploy
```

9. Configurar webhook Stripe:

```txt
https://tudominio.com/api/stripe/webhook
```

10. Probar compra completa.

## Checklist final de producción

- [ ] Dominio conectado.
- [ ] HTTPS activo.
- [ ] `NEXTAUTH_URL` apunta al dominio real.
- [ ] `NEXT_PUBLIC_APP_URL` apunta al dominio real.
- [ ] Base de datos productiva configurada.
- [ ] Migraciones aplicadas.
- [ ] Admin real creado.
- [ ] Stripe live keys configuradas.
- [ ] Stripe webhook configurado.
- [ ] Resend configurado.
- [ ] Emails probados.
- [ ] Importación CSV probada.
- [ ] Checkout probado.
- [ ] Webhook probado.
- [ ] Stock baja tras pago confirmado.
- [ ] Sitemap accesible.
- [ ] Robots accesible.
- [ ] Backups activados.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
npm run check:env
```
