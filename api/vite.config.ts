import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    port: 3101,
    host: '0.0.0.0'
  },
  plugins: [
    tsconfigPaths(),
    ...VitePluginNode({
      adapter: 'nest',
      appPath: './src/vite-main.ts',
      exportName: 'viteApp',
      tsCompiler: 'swc',
      swcOptions: {
        sourceMaps: true,
        jsc: {
          target: 'es2019',
          parser: {
            syntax: 'typescript',
            decorators: true,
            dynamicImport: true,
            tsx: true
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true
          }
        }
      }
    })
  ],
  optimizeDeps: {
    exclude: [
      'class-transformer',
      'class-validator',
      'cpu-features'
    ]
  }
});
