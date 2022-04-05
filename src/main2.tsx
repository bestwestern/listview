import { register } from "./register";
import { App } from "./app";
register(App, "list-view", ["data", "url"], {});
var el = document.getElementsByTagName("list-view");
el[0].data = [1, 2];
// url="https://global-power-plants.datasettes.com/global-power-plants/global-power-plants.json"
