# Juol Web

Web pública de Juol construida con Next.js, TypeScript, Tailwind CSS y Supabase.

## Rutas

- `/`: landing principal.
- `/descargar`: redirección inteligente a tiendas.
- `/partido/[id]`: invitación pública de partido.
- `/reset-password`: cambio de contraseña desde email de Supabase.
- `/auth/callback`: confirmación/callback de Supabase.
- `/pro`: lista de espera Juol Pro.
- `/beneficios`: banners y beneficios activos.
- `/terminos` y `/privacidad`.

## Variables

Copiar `.env.example` a `.env.local` y completar:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_STORE_URL=
NEXT_PUBLIC_PLAY_STORE_URL=
NEXT_PUBLIC_APP_SCHEME=juol://
NEXT_PUBLIC_SITE_URL=https://juol.lat
```

## Hostinger Node/VPS

Build command: `npm run build`

Start command: `npm run start`

Configurar HTTPS antes de usar esta web como redirect en Supabase Auth.

## Supabase Auth redirects

Agregar en Supabase Dashboard > Auth > URL Configuration:

- `https://juol.lat/auth/callback`
- `https://juol.lat/reset-password`
- `juol://auth-callback`
- `juol://reset-password`

## Futuro Juol Pro pago

Flujo recomendado: checkout web local -> webhook/backend -> tabla `memberships` -> app lee membresía activa por usuario.

