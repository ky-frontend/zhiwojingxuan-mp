// eslint-disable-next-line import/no-commonjs
module.exports = {
  env: {
    NODE_ENV: '"production"',
    // M_URL: '"https://m.knowyourself.cc"',
    // prod
    // IM_SKD_ID: '"1400822648"',
    // prod
    // API_URL: '"https://tapi.knowyourself.cc"',

    // dev2
    M_URL: '"https://m-dev2.knowyourself.cc"',
    IM_SKD_ID: '"1400818915"',
    API_URL: '"https://tapi-dev2.knowyourself.cc"',
  },
  defineConstants: {},
  mini: {
    // optimizeMainPackage: true,
    // // 开启 tree-shaking
    // minify: true,
    // // 开启 source-map
    // sourceMap: true,
    // // 开启 gzip
    // gzip: true,
    // // 开启 brotli
    // brotli: true,
    // // 开启多进程打包
    // thread: true,
    // // 开启多进程压缩
    // compress: true,
  },
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/neutrinojs/webpack-chain
     */
    // webpackChain (chain) {
    //   /**
    //    * 如果 h5 端编译后体积过大，可以使用 webpack-bundle-analyzer 插件对打包体积进行分析。
    //    * @docs https://github.com/webpack-contrib/webpack-bundle-analyzer
    //    */
    //   chain.plugin('analyzer')
    //     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
    //   /**
    //    * 如果 h5 端首屏加载时间过长，可以使用 prerender-spa-plugin 插件预加载首页。
    //    * @docs https://github.com/chrisvfritz/prerender-spa-plugin
    //    */
    //   const path = require('path')
    //   const Prerender = require('prerender-spa-plugin')
    //   const staticDir = path.join(__dirname, '..', 'dist')
    //   chain
    //     .plugin('prerender')
    //     .use(new Prerender({
    //       staticDir,
    //       routes: [ '/pages/index/index' ],
    //       postProcess: (context) => ({ ...context, outputPath: path.join(staticDir, 'index.html') })
    //     }))
    // }
  },
};
