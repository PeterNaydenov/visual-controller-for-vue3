import e from "ask-for-promise";
import { createApp as t, createSSRApp as n } from "vue";
//#region src/main.js
function r(r = {}) {
	let i = {};
	r = {
		...r,
		createApp: t,
		createSSRApp: n
	};
	function a(a, s = {}, c) {
		let l = typeof c == "string", { isCustomElement: u } = s, d = e();
		if (!a) return console.error("Error: Component is undefined"), d.done(!1), d.promise;
		l && o(c);
		let f = document.getElementById(c), p, m = (e) => {
			i[c] = e;
		};
		return f ? (p = f.innerHTML.trim() === "" ? t(a, s) : n(a, s), i[c] = {}, p.provide("dependencies", {
			...r,
			setupUpdates: m
		}), u && (p.config.compilerOptions = p.config.compilerOptions || {}, p.config.compilerOptions.isCustomElement = (e) => u), p.mount(`#${c}`), d.done(i[c]), d.promise) : (console.error(`Can't find node with id: "${c}"`), d.done(!1), d.promise);
	}
	function o(e) {
		if (i[e]) {
			let t = document.getElementById(e);
			if (!t) return !1;
			let n = t.__vue_app__.unmount;
			return n(), t.removeAttribute("data-v-app"), delete i[e], !0;
		} else return !1;
	}
	function s(e) {
		return i[e] || (console.error(`App with id: "${e}" was not found.`), !1);
	}
	function c(e) {
		return !!i[e];
	}
	return {
		publish: a,
		destroy: o,
		getApp: s,
		has: c
	};
}
//#endregion
export { r as default };
