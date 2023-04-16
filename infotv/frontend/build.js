import { context } from "esbuild";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { readdir } from "fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import postCssPlugin from "@baurine/esbuild-plugin-postcss3";
import postCssEnv from "postcss-preset-env";

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

const ctx = await context({
    bundle: true,
    entryPoints: {
        bundle: `${__dirname}/src/main.tsx`,
        ...(await getThemes()),
    },
    outdir,
    publicPath,
    minify: mode === "production",
    plugins: [postCssPlugin.default({ plugins: [postCssEnv] })],
    loader: { ".png": "file", ".woff": "file" },
    sourcemap: true,
    logLevel: "info",
    define: {
        "process.env.NODE_ENV": JSON.stringify(
            mode === "production" ? "production" : "development",
        ),
    },
});
if (watch) {
    void ctx.watch();
} else {
    await ctx.rebuild();
    await ctx.dispose();
}
