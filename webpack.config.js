module.exports = {
    entry: './public/src/index',
    output: {
        path: __dirname + '/public',
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader!postcss-loader' },
            { test: /\.(svg|png|jpe?g)$/, loader: 'url-loader?limit=100000&name=files/[name].[ext]' },
            { test: /\.(woff2?|ttf|eot)$/, loader: 'file-loader?name=files/[name].[ext]' }
        ]
    },
    resolveLoader: {
        root: require('path').join(__dirname, 'node_modules')
    },
    devtool: 'inline-source-map',
    postcss: function () {
        return [require('precss'), require('autoprefixer')];
    }
};