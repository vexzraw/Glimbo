# Cómo publicar Glimbo en GitHub Pages

## Por qué estaba en blanco

Tu proyecto es código fuente de **Vite + React + TypeScript**. El `index.html`
carga `/src/main.tsx`, que es TypeScript + JSX sin compilar. Los navegadores
no saben ejecutar eso directamente, y GitHub Pages solo sirve archivos
estáticos tal cual, sin compilarlos. Por eso la página quedaba en blanco: el
navegador intentaba cargar un archivo `.tsx` como si fuera JavaScript y
fallaba de inmediato.

Revisé todo el código (`src/**`) en busca de errores reales: no hay errores
de sintaxis, imports rotos ni exports faltantes — el proyecto compila y
empaqueta sin problemas. El único problema era el despliegue.

## La solución: build automático con GitHub Actions

Añadí `.github/workflows/deploy.yml`. Este workflow, cada vez que hagas push
a `main`, instala las dependencias, compila el proyecto con Vite (que genera
un único `index.html` autocontenido gracias a `vite-plugin-singlefile`) y lo
publica en GitHub Pages automáticamente.

### Pasos para activarlo

1. Sube estos archivos a tu repositorio de GitHub (rama `main`).
2. En GitHub: **Settings → Pages**.
3. En "Build and deployment" → "Source", elige **GitHub Actions**
   (no "Deploy from a branch").
4. Haz un push (o ve a la pestaña **Actions** y ejecuta el workflow
   manualmente con "Run workflow").
5. Espera a que termine (aparecerá una URL tipo
   `https://tu-usuario.github.io/tu-repo/`).

Eso es todo — no necesitas subir una carpeta `dist`, ni configurar rutas
base, ni tocar nada más. El workflow se encarga de compilar el proyecto en
cada push.

## Si prefieres hacerlo manualmente (sin Actions)

```bash
npm install
npm run build
```

Esto genera `dist/index.html`, un único archivo con todo el juego incluido
(JS, CSS y lógica). Puedes subir el **contenido** de `dist/` a la rama
`gh-pages` (o configurar Pages para servir desde `dist/`), o incluso abrir
ese archivo directamente en el navegador sin servidor.
