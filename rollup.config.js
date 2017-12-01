import ascii from "rollup-plugin-ascii";
import node from "rollup-plugin-node-resolve";

export default {
  input: "src/plotPanel.js",
  extend: true,
  plugins: [node(), ascii()],
  external: ['d3'],
  output: {
    file: "build/cohortPanel.js",
    format: "umd",
    name: "cohortPanel"
  }
};