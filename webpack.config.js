module.exports = {
    entry: './public/src/index',
    output: {
        filename: 'public/bundle.js'
    },
    module: {
        loaders: [
            { test: /\.handlebars$/, loader: "handlebars-loader" }
        ]
    }
};