import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';
import { posthtmlInsertAt } from 'posthtml-insert-at';
import htmlnano from 'htmlnano';
import postcss from 'postcss';
import postcssUrl from 'postcss-url';
import sass from 'sass';
import esbuild from 'esbuild';
import copy from 'recursive-copy';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const main = async () => {
    // Compile our SCSS w/ sass, and inline the images w/ postcss-url
    const styleSource = fileURLToPath(new URL('./index.scss', import.meta.url));
    const style = await sass.compileAsync(styleSource, { style: 'compressed' })
        .then(({ css }) => postcss()
            .use(postcssUrl({ url: 'inline', encodeType: 'base64' }))
            .process(css, { from: styleSource }));

    // Compile our JS w/ esbuild
    const jsSource = fileURLToPath(new URL('./index.js', import.meta.url));
    const js = await esbuild.build({
        entryPoints: [ jsSource ],
        bundle: true,
        write: false,
        minify: true,
    }).then(({ outputFiles }) => outputFiles.map(({ text }) => text).join('\n'));

    // Compile our HTML w/ posthtml, and insert the JS + styles w/ posthtml-insert-at
    const htmlSource = await fs.readFile(new URL('./index.html', import.meta.url), 'utf8')
        .then(src => process.env.BASE_URL ? src.replace(/https:\/\/sysadminday\.digitalocean\.com/g,
            process.env.BASE_URL.replace(/\/$/, '')) : src);
    const html = await posthtml()
        .use(posthtmlInclude({ root: fileURLToPath(new URL('./', import.meta.url)) }))
        .use(posthtmlInsertAt({ selector: 'head', append: `<style>${style.css}</style>` }))
        .use(posthtmlInsertAt({ selector: 'body', append: `<script>${js}</script>` }))
        .use(htmlnano({
            collapseWhitespace: true,
            minifyCss: true,
            minifyJs: true,
            minifySvg: {
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                            },
                        },
                    },
                ],
            },
        }))
        .process(htmlSource);

    // Output the HTML
    if (!(await fs.access(new URL('../dist', import.meta.url)).then(() => true).catch(() => false)))
        await fs.mkdir(new URL('../dist', import.meta.url));
    await fs.writeFile(new URL('../dist/index.html', import.meta.url), html.html);

    // Copy static files over
    await copy(
        fileURLToPath(new URL('./static', import.meta.url)),
        fileURLToPath(new URL('../dist', import.meta.url)),
        { overwrite: true, dot: true, results: false },
    );
};

main().catch(err => {
    console.error(err);
    process.exit(1);
});
