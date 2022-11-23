import cfg from "cypress"

export default cfg.defineConfig({
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
  },
});
