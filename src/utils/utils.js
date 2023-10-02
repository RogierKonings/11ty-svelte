import {
  destroy_component,
  detach,
  insert,
  is_function,
  mount_component,
  noop,
  SvelteComponent,
} from "svelte/internal";

const createNodeFromString = (string) =>
  new DOMParser().parseFromString(string, "text/html").body.firstElementChild;

const createSlots = (slots) => {
  const svelteSlots = {};

  for (const slotName in slots) {
    svelteSlots[slotName] = [createSlotFn(slots[slotName])];
  }

  function createSlotFn([ele, props = {}]) {
    if (is_function(ele) && ele.prototype instanceof SvelteComponent) {
      let component;
      return function () {
        return {
          c: noop,
          m(target, anchor) {
            component = new ele({ target, props });
            mount_component(component, target, anchor, null);
          },
          d(detaching) {
            destroy_component(component, detaching);
          },
          l: noop,
        };
      };
    } else {
      return function () {
        return {
          c: noop,
          m: function mount(target, anchor) {
            insert(target, ele, anchor);
          },
          d: function destroy(detaching) {
            if (detaching) {
              detach(ele);
            }
          },
          l: noop,
        };
      };
    }
  }
  return svelteSlots;
};

const registerComponent = (component, name) => {
  document.querySelectorAll(`.${CSS.escape(name)}`).forEach(($el) => {
    const props = JSON.parse($el.dataset.props);
    delete $el.dataset.props;
    const content = JSON.parse($el.dataset.content);

    let slots = {};
    Object.fromEntries(
      Object.entries(content).map(([key, value]) => {
        return (slots = {
          ...slots,
          ...{
            [key]: [createNodeFromString(value)],
          },
        });
      })
    );
    delete $el.dataset.content;

    new component({
      target: $el,
      props: {
        ...props,
        ...(content
          ? {
              $$slots: createSlots(slots),
              $$scope: {},
            }
          : {}),
      },
      hydrate: true,
    });
  });
};

export { createNodeFromString, registerComponent };
