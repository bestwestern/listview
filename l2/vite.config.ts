import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  lib: {
    // Could also be a dictionary or array of multiple entry points
    entry: resolve(__dirname, "lib/main.js"),
    name: "MyLib",
    // the proper extensions will be added
    fileName: "my-lib",
  },
});
