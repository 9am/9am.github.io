import { register } from '@9am/img-victor';
register({
    worker: () => new Worker(new URL('@9am/img-victor/fastWorker.js', import.meta.url)),
});

const BASE = 'https://github.com/9am/9am.github.io';
const IMG_PROXY = 'https://ik.imagekit.io/94av7hg7apo';
const main = document.querySelector('#main');
const moreBtn = document.querySelector('#more');

const getNextPage = () => {
    const [lastItem] = [...document.querySelectorAll('.item')].slice(-2, -1);
    return lastItem ? lastItem.dataset.next : 0;
};

const pending = (status = false) => {
    if (status) {
        moreBtn.textContent = '......';
        moreBtn.setAttribute('disabled', '');
    } else {
        moreBtn.textContent = 'MORE';
        moreBtn.removeAttribute('disabled');
    }
};

const addItems = (child) => {
    main.insertBefore(child, moreBtn.parentNode);
};

const template = document.createElement('template');
const renderIssue = ({
    href,
    src,
    ratio,
    title,
    desc,
    publishedAt,
    labels,
    next,
}) => `
    <article class="item" data-next="${next}">
        <a class="button" href="${href}" target="_blank" aria-label="${name}">
            <img-victor class="victor" data-src="${src}" ratio="${ratio}"></img-victor>
        </a>
        <section class="info">
            <h2 class="title">${title}</h2>
            <time class="date" datetime="${publishedAt}">${new Date(publishedAt).toDateString()}</time>
            <p class="desc">${desc}</p>
            <div class="tags">${renderLabels(labels)}</div>
        </section>
    </article>
`;
const renderLabels = ({ nodes }) => nodes.map(({ name }) => `
    <a class="button small" href="${BASE}/labels/${name}" target="_blank" aria-label="${name}">${name}</a>
`).join('');

const createItem = ({ body, number, ...rest }) => {
    const [, file = ''] = body.match(/<img [^</>]*src=.*\/([^\/]+\.\w{3,4})/) || [];
    const [, desc = ''] = body.match(/<blockquote>(.*)<\/blockquote>/) || [];
    const [, ratio = '1:1'] = body.match(/data-ratio="([\d:]*)"/) || [];
    template.innerHTML = renderIssue({
        href: `${BASE}/issues/${number}`,
        src: `${IMG_PROXY}/${file}`,
        ratio,
        desc,
        ...rest,
    });
    return template.content.cloneNode(true);
};

const loadMore = async () => {
    pending(true);
    const page = getNextPage();
    const {
        nodes = [],
        pageInfo = {},
        totalCount = 0,
    } = await fetch(`/assets/data/${page}.json?rid=${Math.random()}`).then(res => res.json());
    const ele = nodes.reduce((container, data) => {
        container.appendChild(createItem({ ...data, next: pageInfo.nextPage }));
        return container;
    }, document.createDocumentFragment());
    addItems(ele);
    if (pageInfo.hasNextPage) {
        pending(false);
    }
};

const generateTile = () => {
    const contour = document.querySelector('#contour');
    if (!contour) {
        return;
    }
    contour.querySelector('feTurbulence').setAttribute(
        'seed',
        Math.floor(Math.random() * 1000),
    );
    // adjust light for firefox
    if (Boolean(~navigator.userAgent.indexOf("Firefox"))) {
        [...contour.querySelectorAll(
            'feComponentTransfer[in=light] *',
        )].forEach(node => node.setAttribute('slope', 2));
    }
};

const generateGradient = () => {
    const gradient = document.querySelector('#gradient');
    const hue = Math.floor(Math.random() * 360);
    gradient.style.setProperty('--stop-1', `${+hue}deg`);
    gradient.style.setProperty('--stop-2', `${+hue - 60}deg`);
};

(async () => {
    moreBtn.addEventListener('click', loadMore);
    try {
        generateTile();
        generateGradient();
    } catch (err) {};
    try {
        await loadMore();
    } catch (err) {
        console.log('fail:', err);
    }
})();
