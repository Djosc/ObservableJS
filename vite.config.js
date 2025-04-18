export default {
    server: {
      port: 3000,
      open: true
    },
    resolve: {
      alias: {
        '@observablejs/core': '/packages/core/src',
        '@observablejs/components': '/packages/components/src',
        '@observablejs/devtools': '/packages/devtools/src'
      }
    }
  }