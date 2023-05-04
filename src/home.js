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
    // hover animation for tile
    const tiles = document.querySelectorAll('.tile');
    const light = contour.querySelector('feDistantLight');
    const trans = contour.querySelector('feFuncA');
    const { width, height } = tiles[0].getBoundingClientRect();
    const tileMoveHandler = getTileMoveHandler({ light, trans, mx: width / 2, my: height / 2 });
    Array.from(tiles).forEach((tile) => {
        tile.addEventListener('mousemove', tileMoveHandler);
    });
};

const generateGradient = () => {
    const gradient = document.querySelector('#gradient');
    const hue = Math.floor(Math.random() * 360);
    gradient.style.setProperty('--stop-1', `${+hue}deg`);
    gradient.style.setProperty('--stop-2', `${+hue - 60}deg`);
};

const throttle = (fn, delay = 50) => {
    let tid = null;
    return (...args) => {
        if (tid) {
            return;
        }
        tid = setTimeout(() => {
            fn.apply(this, args);
            clearTimeout(tid);
            tid = null;
        }, delay);
    };
};

const getTileMoveHandler = ({ light, trans, mx, my }) => throttle((evt) => {
    const ox = evt.offsetX - mx;
    const oy = evt.offsetY - my;
    const angle = Math.floor(Math.atan2(oy, ox) * 180 / Math.PI + 180);
    const dist = Math.hypot(oy, ox);
    const scale = 0.1 + (dist / mx) * 0.3;
    light.setAttribute('azimuth', angle);
    trans.setAttribute('amplitude', scale);
});

(() => {
    moreBtn.addEventListener('click', loadMore);
    try {
        generateTile();
        generateGradient();
    } catch (err) {};
})();
