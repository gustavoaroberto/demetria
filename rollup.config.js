import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import { eslint } from "rollup-plugin-eslint";

export default {
	input: "src/main.js",
	output: {
		file: process.env.NODE_ENV === "production" ? "build/demetria.min.js" : "build/demetria.js",
		format: "iife",
		name: "Demetria",
		sourceMap: "inline",
	},
	plugins: [
		eslint({
			exclude: "node_modules/**",
		}),
		babel({
			exclude: "node_modules/**",
		}),
		(process.env.NODE_ENV === "production" && uglify()),
	],
};
