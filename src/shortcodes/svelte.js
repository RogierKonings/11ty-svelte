const path = require("path");
const rollup = require("rollup");
const sveltePlugin = require("rollup-plugin-svelte");
const nodeResolve = require("@rollup/plugin-node-resolve");
const css = require("rollup-plugin-css-only");
const fs = require("fs");
const svelte = require("svelte/compiler");
const { JSDOM } = require("jsdom");

module.exports = async function svelteShortcode(content, filename, props) {
  const slottedContent = structuredClone(content);
  const dom = new JSDOM(slottedContent);
  const slots = [...dom.window.document.querySelectorAll("[data-slot]")].reduce(
    (acc, el) => ({ ...acc, ...{ [el.dataset.slot]: el.outerHTML } }),
    {}
  );

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
            if (Object.keys(slots).length > 0) {
              for (const [key, value] of Object.entries(slots)) {
                content =
                  key === "default"
                    ? content.replace(/<slot\s?\/>/gi, value)
                    : content.replace(
                        new RegExp(`<slot\\s?name="${key}"\\s?\/>`, "gi"),
                        value
                      );
              }
            }
            code = structuredClone(content);
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

  // retrieve the css
  let component = svelte.compile(fs.readFileSync(input, "utf8"), {
    filename: this.filename,
    generate: "ssr",
    format: "cjs",
  });

  // add the css to the page context
  this.ctx.pageCss.addPageCss(this.page.url, component.css.code);

  if (main.facadeModuleId) {
    const Component = requireFromString(main.code, main.facadeModuleId).default;
    return renderComponent(Component, filename, props, slots);
  }
};

function renderComponent(component, filename, props, slots) {
  return `
          <div class="svelte--${filename}" data-props='${JSON.stringify(
    props || {}
  )}' data-content='${JSON.stringify(slots)}'>
            ${component.render(props).html}
          </div>`;
}

function requireFromString(src, filename) {
  const m = new module.constructor();
  m.paths = module.paths;
  m._compile(src, filename);
  return m.exports;
}
