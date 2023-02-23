import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    base: '/',
    build: {
        assetsDir: 'resource',
    },
    plugins: [
        viteStaticCopy({
            targets: [
                { src: './assets', dest: './' },
                { src: './node_modules/@9am/img-victor/dist/fastWorker.wasm', dest: './resource' }
            ]
        })
    ]
})
