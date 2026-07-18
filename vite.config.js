import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// vite-plugin-svgr: convierte los .svg importados con ?react en componentes React
// inline en el DOM. Configuramos SVGO para NO tocar los estilos ni atributos que
// necesitamos preservar: los perfiles de altimetría usan fill/stroke: var(--ibon)
// (deben heredar la variable CSS) y vector-effect='non-scaling-stroke'.
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        svgo: true,
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  // no colapsar/quitar los estilos con var(--ibon)
                  removeViewBox: false,
                  // conservar ids de gradiente (url(#...)) tal cual
                  cleanupIds: false,
                  // no convertir estilos inline
                  inlineStyles: false,
                },
              },
            },
          ],
        },
      },
    }),
  ],
})
