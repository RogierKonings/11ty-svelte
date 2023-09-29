const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const nodeResolve = require('@rollup/plugin-node-resolve');
const path = require('path');
const terser = require("@rollup/plugin-terser");

const fs = require('fs');

const css = require('rollup-plugin-css-only');

module.exports = class Scripts {
  data () {
    return {
      permalink: '/scripts/index.js',
      eleventyExcludeFromCollections: true,
    }
  }

  async render () {
    const build = await rollup.rollup({
      input: path.join(process.cwd(), 'src', 'content', 'scripts', 'index.js'),
      plugins: [
        svelte({
          compilerOptions: {
            hydratable: true,
          },
          emitCss: true,
          preprocess: {
            markup: ({content}) => {
              console.log(content)
              // let code = content.replaceAll(/<slot\s?\/>/gi, slottedContent)
              // return { code }
            },
            style: (data) => {
              console.log(data)
              // fs.appendFileSync('./dist/style.css', data.content)
            },
          }
        }),
        // terser(),
        css(),
        nodeResolve.default({
          browser: true,
        }),
      ]
    });


    const { output: [ main ] } = await build.generate({
      format: 'iife',
    });

    if (main.facadeModuleId) {
      return main.code;
    }
  }
}