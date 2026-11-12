// eslint-disable-next-line import/no-commonjs
module.exports = {
  env: {
    NODE_ENV: '"development"',
    M_URL: '"https://m-dev2.knowyourself.cc"',
    API_URL: '"https://tapi-dev2.knowyourself.cc"',
    IM_SKD_ID: '"1400818915"',
  },
  defineConstants: {},
  mini: {
    // optimization: {
    //   minimize: true,
    // },
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
    webpackChain: (chain, webpack) => {
      chain.merge({
        plugin: {
          install: {
            plugin: require('terser-webpack-plugin'),
            args: [
              {
                terserOptions: {
                  compress: true, // 默认使用terser压缩
                  // mangle: false,
                  keep_classnames: true, // 不改变class名称
                  keep_fnames: true, // 不改变函数名称
                },
              },
            ],
          },
        },
      });
    },
  },
  h5: {},
};
