const util = require('util');
const exec = util.promisify(require('child_process').exec);

const BASE = 'https://github.com/9am/9am.github.io';
const EMAIL = 'tech.9am@gmail.com';

const escapeHTML = str => str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

const rss = ({
    lastBuildDate = new Date().toUTCString(),
    items = '',
}) => `<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title>The 9am Blog</title>
        <link>http://9am.github.io/</link>
        <description>9am blog</description>
        <image>
            <url>https://github.com/9am/9am.github.io/raw/main/assets/img/logo.svg</url>
            <title>9am</title>
            <link>http://9am.github.io/</link>
        </image>
        <language>en-us</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>
        <managingEditor>${EMAIL}</managingEditor>${items}
    </channel>
</rss>`;

const item = ({
    id,
    title,
    number,
    body,
    publishedAt,
    labels,
}) => {
    const [, img = ''] = body.match(/img [^</>]*src="([^"]*)"/) || [];
    const [, desc = ''] = body.match(/<mark>(.*)<\/mark>/) || [];
    return `
        <item>
            <title>${title}</title>
            <link>${BASE}/issues/${number}</link>
            <description>${escapeHTML(desc)}</description>
            <author>${EMAIL}</author>
            <pubDate>${new Date(publishedAt).toUTCString()}</pubDate>
            <guid>${id}</guid>
            <enclosure url="${img}" />
        </item>`;
};

const writeRSS = async ({ nodes = [] }) => {
    const items = nodes.map(node => item(node)).join('');
    const output = rss({ items });
    return exec(`echo '${output}' > ./assets/data/rss.xml`);
};

module.exports = async ({ github, context, core }) => {
    const pages = JSON.parse(process.env.DATA);
    core.info(`write start: ${pages.length}`);
    await exec('rm -rf ./assets/data');
    await exec('mkdir ./assets/data');
    await Promise.all(pages.map(
        (page, index) => exec(`echo '${JSON.stringify(page, null, 2)}' > ./assets/data/${index}.json`)),
    );
    if (pages.length) {
        await writeRSS(pages[0]);
    }
    core.info(`write end: ${pages.length}`);
}
