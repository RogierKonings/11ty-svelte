const svelte = require("../shortcodes/svelte");
const fs = require("fs");

class CSSManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.pages = {};
  }

  addPageCss(pageUrl, css) {
    if (!this.pages[pageUrl]) {
      this.pages[pageUrl] = new Set();
    }
    this.pages[pageUrl].add(css);
  }

  getCssForPage(pageUrl) {
    return Array.from(this.pages[pageUrl] || []).join("\n");
  }
}

module.exports = function (eleventyConfig) {
  let pageCss = new CSSManager();
  eleventyConfig.addGlobalData("pageCss", pageCss);
  eleventyConfig.addPairedNunjucksAsyncShortcode("svelte", svelte);

  eleventyConfig.on("eleventy.before", () => pageCss.reset());

  eleventyConfig.on("eleventy.after", () => {
    fs.writeFileSync('dist/svelte.css', pageCss.getCssForPage("/"))
  });
};
