// Based on https://github.com/iam-medvedev/esbuild-plugin-less/blob/main/src/index.ts
// (license: WTFPL).

import path from "path";
import { promises as fs } from "fs";
import less from "less";
import postCssEnv from "postcss-preset-env";
import postcss from "postcss";

const filter = { filter: /\.less$/, namespace: "file" };

export default function lessPostCSSLoader() {
    return {
        name: "less-postcss-loader",
        setup: (build) => {
            build.onResolve(filter, (args) => {
                const filePath = path.resolve(process.cwd(), path.relative(process.cwd(), args.resolveDir), args.path);
                return {
                    path: filePath
                    // TODO: this doesn't support `watch` quite like the upstream plugin does
                };
            });

            build.onLoad(filter, async (args) => {
                const content = await fs.readFile(args.path, "utf-8");
                const dir = path.dirname(args.path);

                const opts = {
                    filename: args.path,
                    relativeUrls: true,
                    paths: [dir]
                };

                try {
                    const lessResult = await less.render(content, opts);
                    const postcssResult = await postcss([postCssEnv]).process(lessResult.css, { from: args.path });
                    const contents = postcssResult.css;
                    return {
                        contents,
                        loader: "css",
                        resolveDir: dir,
                    };
                } catch (e) {
                    return {
                        errors: [JSON.stringify(e)],
                        resolveDir: dir,
                    };
                }
            });
        }
    };
}
