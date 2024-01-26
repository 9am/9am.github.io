const BASE = 'https://github.com/9am/9am.github.io';
const IMG_PROXY = 'https://ik.imagekit.io/94av7hg7apo';

const doc = typeof document !== 'undefined' ? document : {
    createElement() {
        const nodeDoc = {};
        let html = '';
        Object.defineProperties(nodeDoc, {
            innerHTML: {
                set(val) {
                    html = val;
                },
            },
            content: {
                get() {
                    return {
                        cloneNode() {
                            return html;
                        }
                    };
                }
            }
        });
        return nodeDoc;
    }
}
const template = doc.createElement('template')
const renderIssue = ({
    id,
    href,
    src,
    ratio = '1:1',
    title,
    desc,
    publishedAt,
    labels,
    next,
}) => `
    <article class="item" id="${id}" data-next="${next}">
        <a class="button" href="${href}" target="_blank" aria-label="${title}" style="aspect-ratio: ${ratio.split(':').join('/')}">
            <noscript>
                <img class="victor-nojs" src="${src}" loading="lazy" alt="thumbnail" />
            </noscript>
            <img-victor class="victor" data-src="${src}" ratio="${ratio}"></img-victor>
        </a>
        <section class="info">
            <h2 class="title">${title}</h2>
            <time class="date" datetime="${publishedAt}">${new Date(publishedAt).toDateString()}</time>
            <p class="desc">${desc}</p>
            <div class="tags">${renderLabels(labels)}</div>
        </section>
    </article>`;

const renderLabels = ({ nodes }) =>
    nodes.map(
        ({ name }) => `<a class="button small" href="${BASE}/labels/${name}" target="_blank" aria-label="${name}">${name}</a>`
    ).join('');

export const createItem = ({ body, number, ...rest }) => {
    const [, file = ''] = body.match(/<img [^</>]*src="[^"]*\/([^/"]+)"/) || [];
    const [, src = ''] = body.match(/<img [^</>]*src="([^"]*)"/) || [];
    const [, desc = ''] = body.match(/<blockquote>(.*)<\/blockquote>/) || [];
    const [, ratio = '1:1'] = body.match(/data-ratio="([\d:]*)"/) || [];
    const needProxy = /github/.test(src);
    template.innerHTML = renderIssue({
        href: `${BASE}/issues/${number}`,
        src: needProxy ? `${IMG_PROXY}/${file}` : src,
        ratio,
        desc,
        ...rest,
    });
    return template.content.cloneNode(true);
};
