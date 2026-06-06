# Ringe Draft League · «Matachanchos»

App web para gestionar una liga privada de Pokémon VGC estilo *draft league*: tablero de draft (100 pts, 10 Pokémon), entrenadores, equipos, calendario todos-contra-todos (Bo3), final (Bo5) e intercambios. Datos compartidos en tiempo real entre todos los participantes.

## Stack
- **Vite + React** (frontend)
- **Supabase** (base de datos en la nube + tiempo real)
- Pensado para desplegarse gratis en **Vercel**

## Puesta en marcha rápida
```bash
npm install
cp .env.example .env   # y rellena tus claves de Supabase
npm run dev
```

## Despliegue
Sigue **`GUIA-DESPLIEGUE.md`** (paso a paso, sin necesidad de saber programar).

## Estructura
- `src/App.jsx` — toda la aplicación (datos del draft, componentes y lógica).
- `src/supabaseClient.js` — conexión a Supabase.
- `supabase-setup.sql` — crea la tabla `league` y activa el tiempo real (ejecutar una vez).
- `.env.example` — plantilla de claves.

## Edición
La app abre en solo lectura. El botón 🔒 pide una contraseña para editar
(`EDIT_PASSWORD` en `src/App.jsx`, por defecto `RDL2026!!`).
