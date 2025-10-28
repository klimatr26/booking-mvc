import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
  server: {
    fs: {
      // Solo permitir servir archivos de src, public y node_modules
      allow: ['.']
    },
    watch: {
      // Ignorar cambios en esb/ y server/
      ignored: ['**/esb/**', '**/server/**']
    }
  },
  optimizeDeps: {
    // Excluir módulos que no deben ser pre-bundled
    exclude: ['pg']
  }
});
