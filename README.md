# 📓 Reunión Final del Día

App móvil minimalista para tu ritual de cierre diario. Cada noche respondes 5 preguntas y recibes un newsletter personal con tus respuestas.

## 🚀 Setup

### 1. Instalar dependencias

```bash
cd reunio-final-dia
npm install
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. Copiar tu **Project URL** y **anon key** de Settings > API
4. Actualizar `src/lib/supabase.ts`:

```ts
const SUPABASE_URL = "https://tu-project-id.supabase.co";
const SUPABASE_ANON_KEY = "tu-anon-key";
```

### 3. Configurar Resend (emails)

1. Crear cuenta en [resend.com](https://resend.com)
2. Obtener API key
3. Configurar como variable de entorno en Supabase:
   - Ir a **Edge Functions** > **Secrets**
   - Agregar `RESEND_API_KEY` = `tu-api-key`
4. En `supabase/functions/send-newsletter/index.ts`, cambiar el `from` email:
   ```ts
   from: "Reunión Final <noreply@tu-dominio.com>"
   ```
   _(Necesitas verificar tu dominio en Resend)_

5. Desplegar la Edge Function:
   ```bash
   supabase functions deploy send-newsletter
   ```

### 4. Ejecutar la app

```bash
npx expo start
```

Scanear el QR con Expo Go (Android) o la cámara (iOS).

## 📁 Estructura

```
reunio-final-dia/
├── app/                    # Pantallas (Expo Router)
│   ├── _layout.tsx         # Layout raíz
│   ├── index.tsx           # Splash / redirect
│   ├── onboarding.tsx      # Pantalla 1: Setup
│   ├── dashboard.tsx       # Pantalla 2: Dashboard
│   ├── review.tsx          # Pantalla 3: Reunión diaria
│   └── history.tsx         # Pantalla 4: Historial
├── src/
│   ├── lib/supabase.ts     # Cliente Supabase
│   ├── store/appStore.ts   # Estado global (Zustand)
│   ├── types/index.ts      # Tipos TypeScript
│   └── utils/date.ts       # Utilidades de fecha
├── supabase/
│   ├── schema.sql          # Database schema
│   └── functions/          # Edge Functions
│       └── send-newsletter/
│           └── index.ts    # Envío de newsletter
├── package.json
├── app.json
└── README.md
```

## 🔑 Reglas del sistema implementadas

| Regla | Descripción | Implementado |
|-------|-------------|:---:|
| 1 | Solo una reunión por día | ✅ |
| 2 | No se puede saltar días | ✅ |
| 3 | Streak se reinicia tras 24h | ✅ |
| 4 | No se puede editar después de enviar | ✅ (RLS) |
| 5 | Newsletter se envía inmediatamente | ✅ |

## 📧 Newsletter

El email se genera automáticamente con este formato:

```
Asunto: 📓 Reunión Final del Día #47 — 24 Jun 2026

Hola Alex,
Esta fue tu reunión final del día.

✅ ¿Qué hice hoy?       → {respuesta}
⏳ ¿Qué quedó pendiente? → {respuesta}
🧠 ¿Qué aprendí hoy?    → {respuesta}
🚧 ¿Qué me bloqueó?     → {respuesta}
🎯 Prioridad para mañana → {respuesta}

🔥 Streak actual: 13 días
```

## 🛠 Personalización

- **Preguntas**: Editar `QUESTIONS` en `app/review.tsx`
- **Colores**: Editar `tailwind.config.js`
- **Hora default**: Cambiar en `app/onboarding.tsx`
- **Email template**: Editar `supabase/functions/send-newsletter/index.ts`
