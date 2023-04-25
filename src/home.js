import { register } from '@9am/img-victor';
import { createItem } from './article.js';
register({
    worker: () => new Worker(new URL('@9am/img-victor/fastWorker.js', import.meta.url)),
});

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

(() => {
    moreBtn.addEventListener('click', loadMore);
    try {
        generateTile();
        generateGradient();
    } catch (err) {};
})();
