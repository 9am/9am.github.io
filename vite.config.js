import { resolve } from 'path'
import fs from 'fs'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import handlebars from 'vite-plugin-handlebars';
import postcssNesting from 'postcss-nesting';
import firstPage from './assets/data/0.json';
import { createItem } from './src/home/article.js';

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
        rollupOptions: {
            input: {
                'index': resolve(__dirname, 'index.html'),
                '404': resolve(__dirname, '404.html'),
            },
        },
        assetsDir: 'resource',
        polyfillModulePreload: false,
    },
    css: {
        postcss: {
            plugins: [postcssNesting],
        },
    },
    plugins: [
        handlebars({
            partialDirectory: resolve(__dirname, 'partials'),
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
