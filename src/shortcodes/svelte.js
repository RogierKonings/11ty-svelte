const path = require("path");
const rollup = require("rollup");
const sveltePlugin = require("rollup-plugin-svelte");
const nodeResolve = require("@rollup/plugin-node-resolve");
const css = require("rollup-plugin-css-only");
const fs = require("fs");
const svelte = require("svelte/compiler");

module.exports = async function svelteShortcode(content, filename, props) {
  const slottedContent = structuredClone(content);

  const input = path.join(
    process.cwd(),
    "src",
    "content",
    "scripts",
    "components",
    filename
  );

  // create the rollup ssr build
  const build = await rollup.rollup({
    input,
    plugins: [
      sveltePlugin({
        compilerOptions: {
          generate: "ssr",
          hydratable: true,
          css: "external",
        },
        emitCss: false,
        preprocess: {
          markup: ({ content }) => {
            let code = content.replaceAll(/<slot\s?\/>/gi, slottedContent);
            return { code };
          },
        },
      }),
      css(),
      nodeResolve.default(),
    ],
  });



  const {
    output: [main],
  } = await build.generate({
    format: "cjs",
    exports: "named",
  });


  // retrieve the css and add it to the pageCss context
  let component = svelte.compile(fs.readFileSync(input, "utf8"), {
    filename: this.filename,
    generate: "ssr",
    format: "cjs",
  });

  this.ctx.pageCss.addPageCss(this.page.url, component.css.code);

  if (main.facadeModuleId) {
    const Component = requireFromString(
      main.code,
      main.facadeModuleId
    ).default;
    return renderComponent(Component, filename, props, slottedContent);
  }
};

function renderComponent(component, filename, props, slottedContent) {
  return `
          <div class="svelte--${filename}" data-props='${JSON.stringify(
    props || {}
  )}' data-content='${slottedContent}'>
            ${component.render(props).html}
          </div>`;
}

function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}
