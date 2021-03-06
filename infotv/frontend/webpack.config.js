const webpack = require("webpack");
const autoprefixer = require("autoprefixer");

const CURRENT_STYLE = process.env.INFOTV_STYLE || "desucon";
const outputFsPath = process.env.OUTPUT_PATH || `${__dirname}/../static/infotv`;
const outputPublicPath = process.env.PUBLIC_PATH || "/static/infotv";

module.exports = (env, argv) => ({
    context: __dirname,
    entry: ["./src/main.tsx"],
    bail: true,
    devtool: "source-map",
    output: {
        path: outputFsPath,
        filename: "bundle.js",
        publicPath: outputPublicPath,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.(woff|woff2|svg|otf|ttf|eot|png)(\?.*)?$/,
                use: [
                    {
                        loader: "url-loader",
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        symlinks: false,  // SPEED BOOST
        alias: {
            "current-style": `../styles/${CURRENT_STYLE}/less/style.less`,
        },
        fallback: { "path": false },
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(argv.mode === "production" ? "production" : "development"),
            },
        }),
    ],
});
