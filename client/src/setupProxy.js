const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

    const proxy = process.env.REACT_APP_PROXY_HOST;

    app.use(
        createProxyMiddleware('/api',{
            target:proxy,
            changeOrigin: true,
        })
    );

    app.use(
        createProxyMiddleware( '/event',{
            target: proxy,
            changeOrigin: true,
            ws: true
        })
    );
};
