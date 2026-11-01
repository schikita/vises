import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => ({
	base: command === 'build' ? '/vises/' : '/',
	plugins: [react(), tailwindcss()],
	optimizeDeps: {
		include: ['@vises/contracts'],
	},
	resolve: {
		alias: {
			'@': resolve(rootDir, 'src'),
		},
	},
	server: {
		host: true,
		port: 5173,
		proxy: {
			'/api': 'http://127.0.0.1:8100',
		},
	},
	test: {
		environment: 'jsdom',
		include: ['src/**/*.spec.{ts,tsx}'],
		setupFiles: [resolve(rootDir, 'src/shared/testing/setup.ts')],
		css: false,
	},
}))
