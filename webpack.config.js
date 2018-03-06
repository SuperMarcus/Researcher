const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: [
        path.join(__dirname, "app/src/index.js")
    ],
    output: {
        path: path.join(__dirname, "app"),
        filename: "dist.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new webpack.ExternalsPlugin('commonjs', [
            'desktop-capturer',
            'electron',
            'ipc',
            'ipc-renderer',
            'native-image',
            'remote',
            'web-frame',
            'clipboard',
            'crash-reporter',
            'screen',
            'shell'
        ])
    ]
};
