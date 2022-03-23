const util = require('util');
const exec = util.promisify(require('child_process').exec);

const BASE = 'https://github.com/9am/sample_app';
const EMAIL = 'test@gmail.com';

const rss = ({
    lastBuildDate = new Date().toUTCString(),
    items = '',
}) => `<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title>The 9am Blog</title>
        <link>http://9am.github.io/sample_app/</link>
        <description>9am blog</description>
        <image>
            <url>https://user-images.githubusercontent.com/1435457/152101883-570bdcf0-4d71-41f3-97f1-e3801a16cf54.jpeg</url>
            <title>9am</title>
            <link>http://9am.github.io/sample_app/</link>
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
    const img = body.match(/img src="([^"]*)"/)[1];
    const desc = body.match(/<mark>(.*)<\/mark>/)[1];
    return `
        <item>
            <title>${title}</title>
            <link>${BASE}/issues/${number}</link>
            <description>${desc}</description>
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
