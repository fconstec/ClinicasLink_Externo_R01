const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.', // Geralmente é '.' se tsconfig.json está na raiz
        tsConfigPath: './tsconfig.json',
      },
    },
  ],
  // Escondendo warnings de source-map do html2pdf.js
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        {
          module: /node_modules\/html2pdf\.js/,
          message: /Failed to parse source map/,
        },
      ];
      return webpackConfig;
    },
  },
  // Descomente se usar Tailwind com PostCSS:
  // style: {
  //   postcss: {
  //     plugins: [
  //       require('tailwindcss'),
  //       require('autoprefixer'),
  //     ],
  //   },
  // },
};