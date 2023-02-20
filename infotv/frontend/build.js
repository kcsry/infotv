import { build } from "esbuild";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { readdir } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import lessLoader from './less-postcss-plugin.js';

const { mode, watch } = yargs(hideBin(process.argv)).argv;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outdir = process.env.OUTPUT_PATH || `${__dirname}/../static/infotv`;
const publicPath = process.env.PUBLIC_PATH || "/static/infotv";

async function getThemes() {
    const dirs = await readdir(`${__dirname}/styles`, { withFileTypes: true });
    const entries = dirs
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .map((theme) => [theme, `${__dirname}/styles/${theme}/less/style.less`]);

    return Object.fromEntries(entries);
}

build({
    bundle: true,
    entryPoints: {
        bundle: `${__dirname}/src/main.tsx`,
        ...(await getThemes()),
    },
    outdir,
    publicPath,
    watch,
    minify: mode === "production",
    plugins: [lessLoader()],
    loader: { ".png": "file", ".woff": "file" },
    sourcemap: true,
    define: {
        "process.env.NODE_ENV": JSON.stringify(
            mode === "production" ? "production" : "development",
        ),
    },
});
