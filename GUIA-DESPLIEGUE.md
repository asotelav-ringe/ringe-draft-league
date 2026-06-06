# 🚀 Guía para publicar la Ringe Draft League

Esta guía te lleva, paso a paso, de la carpeta de archivos a una página web pública con datos compartidos entre todos tus amigos **en tiempo real** y **gratis**.

Vas a usar dos servicios gratuitos:

- **Supabase** → la base de datos en la nube (donde viven los datos compartidos).
- **Vercel** → el hosting (donde vive la página web).

Tiempo aproximado: 20–30 minutos. No necesitas saber programar, solo copiar y pegar.

---

## Parte 0 · Lo que necesitas instalar en tu computadora

1. **Node.js** (incluye `npm`). Descárgalo de https://nodejs.org y elige la versión "LTS". Instálalo con las opciones por defecto.
2. Para comprobar que quedó instalado, abre una terminal (en Windows: "Símbolo del sistema" o "PowerShell"; en Mac: "Terminal") y escribe:
   ```
   node --version
   ```
   Si te muestra un número (por ejemplo `v20.x.x`), todo bien.

---

## Parte 1 · Crear la base de datos en Supabase

1. Entra a https://supabase.com y crea una cuenta gratis (puedes usar tu cuenta de GitHub o tu correo).
2. Pulsa **"New project"**.
   - **Name**: `ringe-draft-league` (o lo que quieras).
   - **Database Password**: inventa una contraseña y **guárdala** (no la usarás en la app, pero Supabase la pide).
   - **Region**: elige la más cercana a ti.
   - Pulsa **"Create new project"** y espera ~2 minutos a que se cree.
3. Cuando esté listo, ve en el menú lateral a **"SQL Editor"** → **"New query"**.
4. Abre el archivo **`supabase-setup.sql`** de tu carpeta, copia **todo** su contenido, pégalo en el editor y pulsa **"Run"** (abajo a la derecha).
   - Debe decir *"Success"*. Eso crea la tabla y activa el tiempo real.
5. Ahora consigue tus dos claves: ve a **"Project Settings"** (el engranaje, abajo) → **"API"**. Anota:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **Project API keys → `anon` `public`** (una clave larga)

   Las necesitarás en la Parte 3.

---

## Parte 2 · Probar la app en tu computadora (opcional pero recomendado)

1. Abre una terminal **dentro de la carpeta del proyecto** (la que contiene `package.json`).
   - Truco: en muchos sistemas puedes hacer clic derecho en la carpeta y elegir "Abrir en terminal".
2. Instala las dependencias (solo la primera vez):
   ```
   npm install
   ```
3. Crea tu archivo de claves: copia el archivo **`.env.example`** y renómbralo a **`.env`**. Ábrelo con un editor de texto y pega tus dos claves de Supabase:
   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=la-clave-anon-larga-que-copiaste
   ```
4. Arranca la app:
   ```
   npm run dev
   ```
   Abre en tu navegador la dirección que aparece (normalmente `http://localhost:5173`). Deberías ver la liga. ¡Y ahora con sprites reales de los Pokémon!

Para detenerla, pulsa `Ctrl + C` en la terminal.

---

## Parte 3 · Publicarla en internet con Vercel

La forma más fácil es subir el proyecto a **GitHub** y conectarlo con **Vercel**.

### 3a. Subir el código a GitHub

1. Crea una cuenta gratis en https://github.com si no la tienes.
2. Crea un repositorio nuevo (botón **"New"** → ponle un nombre, por ejemplo `ringe-draft-league` → **"Create repository"**).
3. La forma más sencilla sin terminal: en la página del repo vacío, usa **"uploading an existing file"** y arrastra **todos los archivos del proyecto EXCEPTO** las carpetas `node_modules` y el archivo `.env` (esos no se suben; el `.gitignore` ya los excluye si usas git).
   - ⚠️ **Nunca subas tu archivo `.env`**: contiene tus claves.

### 3b. Conectar con Vercel

1. Entra a https://vercel.com y crea una cuenta gratis (lo más cómodo: "Continue with GitHub").
2. Pulsa **"Add New…" → "Project"** e **importa** el repositorio que acabas de crear.
3. Vercel detectará que es un proyecto **Vite** automáticamente. Antes de pulsar Deploy, añade tus claves:
   - Abre la sección **"Environment Variables"** y agrega estas dos (las mismas del `.env`):

     | Name | Value |
     |------|-------|
     | `VITE_SUPABASE_URL` | tu Project URL de Supabase |
     | `VITE_SUPABASE_ANON_KEY` | tu clave anon public |

4. Pulsa **"Deploy"** y espera ~1 minuto.
5. ¡Listo! Vercel te dará una dirección pública (algo como `https://ringe-draft-league.vercel.app`). Compártela con tus amigos.

---

## ✅ Cómo funciona el día a día

- **Todos ven los mismos datos.** Cualquier cambio (draftear, reportar marcadores, intercambios) se guarda en Supabase y aparece en tiempo real en las pantallas de los demás.
- **Solo quien tiene la contraseña puede editar.** La app abre en modo solo lectura. El botón 🔒 del encabezado pide la contraseña de edición.
  - La contraseña actual es **`RDL2026!!`**. Para cambiarla, edita la línea `const EDIT_PASSWORD = "..."` en `src/App.jsx` y vuelve a desplegar.
- **Para publicar cambios** que hagas al código en el futuro: solo súbelos a GitHub y Vercel los desplegará solo.

---

## 🆘 Problemas comunes

- **"Cargando liga…" no termina** → revisa que las dos variables de entorno en Vercel estén bien escritas (sin espacios) y que ejecutaste el `supabase-setup.sql`.
- **Los sprites no aparecen** → la app dibuja un emblema de respaldo automáticamente si una imagen no carga; no es un error grave.
- **Cambié algo y no se ve** → en Vercel, entra al proyecto y comprueba que el último "Deployment" terminó en estado *Ready*.
- **Quiero borrar todo y empezar de cero** → en Supabase, SQL Editor, ejecuta:
  ```sql
  update public.league
  set data = '{"coaches":[],"picks":{},"matches":[],"trades":[]}'::jsonb
  where id = 'main';
  ```

---

¡Que disfruten la temporada de los Matachanchos! 🏆
