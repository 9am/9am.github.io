import path from 'path'
import fs from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import handlebars from 'vite-plugin-handlebars';
import firstPage from './assets/data/0.json';
import { createItem } from './src/article.js';

const hasMore = fs.existsSync('./assets/data/1.json');
const defaultArticles = {
    // prevent handlebars to escape HTML
    toHTML() {
        return firstPage?.nodes.map(item => createItem({...item, next: 1})).join('');
    }
};

export default defineConfig({
    base: '/',
    build: {
        assetsDir: 'resource',
    },
    plugins: [
        handlebars({
            context: {
                defaultArticles,
                more: hasMore
                    ? { text: 'MORE', disabled: '' }
                    : { text: '......', disabled: 'disabled' },
            },
        }),
        viteStaticCopy({
            targets: [
                { src: './assets', dest: './' },
                { src: './node_modules/@9am/img-victor/dist/fastWorker.wasm', dest: './resource' }
            ]
        })
    ]
})
