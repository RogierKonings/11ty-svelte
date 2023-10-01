const svelte = require('./src/shortcodes/svelte');
const EleventySveltePlugin = require('./src/plugins/EleventySvelte.js');

module.exports = function (eleventyConfig) {

  eleventyConfig.addPairedNunjucksAsyncShortcode('svelte', svelte);
  eleventyConfig.addWatchTarget('src/content/scripts/**/*.(js|svelte)')
  eleventyConfig.addPlugin(EleventySveltePlugin);

  return {
    dir: {
      input: 'src/content',
      output: 'dist',
    },
    htmlTemplateEngine: 'njk',
  };
};
