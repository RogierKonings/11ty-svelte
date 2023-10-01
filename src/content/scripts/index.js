import Test from "./components/Test.svelte";

import Counter from "./components/Counter.svelte";

import { registerComponent } from "../../utils/utils";



registerComponent(Test, "svelte--Test.svelte");
registerComponent(Counter, "svelte--Counter.svelte");
