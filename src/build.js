import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';
import { posthtmlInsertAt } from 'posthtml-insert-at';
import postcss from 'postcss';
import postcssUrl from 'postcss-url';
import sass from 'sass';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const main = async () => {
    // Compile our SCSS w/ sass, and inline the images w/ postcss-url
    const styleSource = fileURLToPath(new URL('./style.scss', import.meta.url));
    const style = await sass.compileAsync(styleSource, { style: 'compressed' })
        .then(({ css }) => postcss()
            .use(postcssUrl({ url: 'inline', encodeType: 'base64' }))
            .process(css, { from: styleSource }));

    // Compile our HTML w/ posthtml, and insert the style w/ posthtml-insert-at
    const htmlSource = await fs.readFile(new URL('./index.html', import.meta.url), 'utf8');
    const html = await posthtml()
        .use(posthtmlInclude({ root: fileURLToPath(new URL('./', import.meta.url)) }))
        .use(posthtmlInsertAt({ selector: 'head', append: `<style>${style.css}</style>` }))
        .process(htmlSource);

    // Output the HTML
    if (!(await fs.access(new URL('../dist', import.meta.url)).then(() => true).catch(() => false)))
        await fs.mkdir(new URL('../dist', import.meta.url));
    await fs.writeFile(new URL('../dist/index.html', import.meta.url), html.html);
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
