// vite.config.js in project root
export default {
    server: {
      port: 3000,
      open: true
    },
    optimizeDeps: {
      include: ['@observablejs/core', '@observablejs/components', '@observablejs/devtools']
    },
    resolve: {
      alias: {
        '@observablejs/core': '/packages/core',
        '@observablejs/components': '/packages/components',
        '@observablejs/devtools': '/packages/devtools'
      }
    }
  }