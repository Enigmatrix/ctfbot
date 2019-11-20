module.exports = {
  lintOnSave: false,
  outputDir: './build',

  devServer: {
    port: 3000,
    proxy: {
      '^/api': {
        target: 'http://localhost:8080',
      },
    },
  },
};
