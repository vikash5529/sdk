import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SDKCore',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['ethers', '@web3auth/modal', '@web3auth/base', '@web3auth/openlogin-adapter'],
      output: {
        globals: {
          ethers: 'ethers',
          '@web3auth/modal': 'Web3Auth',
          '@web3auth/base': 'Web3AuthBase',
          '@web3auth/openlogin-adapter': 'OpenloginAdapter',
        },
      },
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
}); 