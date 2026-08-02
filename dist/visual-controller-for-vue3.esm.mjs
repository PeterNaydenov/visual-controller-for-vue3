import e from "ask-for-promise";
import { createApp as t, createSSRApp as n } from "vue";
//#region src/dim.js
function r() {
	let e = {}, t = {};
	function n(n, ...r) {
		let i = document.createTextNode(""), a = document.createTextNode(""), o = n({
			start: i,
			end: a
		}, ...r);
		if (!i.parentNode || !a.parentNode) throw Error("dim.set: callback must attach both \"start\" and \"end\" markers to the DOM");
		let s = document.createRange();
		s.setStartAfter(i), s.setEndBefore(a);
		let c = {
			isEmpty() {
				return !i.isConnected || !a.isConnected ? !0 : (s.setStartAfter(i), s.setEndBefore(a), s.collapsed);
			},
			getContext() {
				return i.isConnected && a.isConnected ? s.commonAncestorContainer : null;
			},
			destroy() {
				i.isConnected && i.parentNode.removeChild(i), a.isConnected && a.parentNode.removeChild(a);
			}
		};
		o && (t[o] = c), e[Object.keys(e).length] = c;
	}
	function r(n) {
		if (!(typeof n != "string" && !Array.isArray(n))) return typeof n == "string" && n.includes(",") && (n = n.split(",").map((e) => e.trim())), Array.isArray(n) ? n.map((n) => t[n] || e[n]) : t[n] || e[n];
	}
	function i() {
		let n = /* @__PURE__ */ new Set();
		for (let t of Object.values(e)) n.add(t);
		for (let e of Object.values(t)) n.add(e);
		for (let e of n) e.destroy();
		for (let t of Object.keys(e)) delete e[t];
		for (let e of Object.keys(t)) delete t[e];
	}
	function a() {
		return Object.keys(t);
	}
	return {
		set: n,
		get: r,
		reset: i,
		aliases: a
	};
}
//#endregion
//#region src/main.js
function i(i = {}) {
	let a = {}, o = {}, s = r(), c = {
		...i,
		createApp: t
	};
	function l(e, ...t) {
		let n = null, r = null;
		s.set((t, ...i) => {
			r = t;
			let a = e(t, ...i);
			return typeof a == "string" && (n = a), a;
		}, ...t), n && (o[n] = r);
	}
	function u(r, i, s = {}, l = {}) {
		let u = e();
		if (!i) return console.error("Error: Component is undefined"), u.done(!1), u.promise;
		if (!r || typeof r != "string") return console.error("Error: Alias is missing or invalid"), u.done(!1), u.promise;
		let f = o[r];
		if (!f || !f.start.isConnected || !f.end.isConnected) return console.error(`Error: Region "${r}" was not defined or its markers are orphaned. Call html.set(...) first.`), u.done(!1), u.promise;
		a[r] && d(r);
		let { isCustomElement: p } = s, m = [], h = f.start.nextSibling;
		for (; h && h !== f.end;) m.push(h), h = h.nextSibling;
		let g, _ = !1;
		if (m.length === 0) g = document.createElement("span"), g.style.display = "contents", f.end.parentNode.insertBefore(g, f.end), _ = !1;
		else if (m.length === 1 && m[0].nodeType === 1) g = m[0], _ = !0;
		else {
			let e = document.createElement("span");
			e.style.display = "contents", f.end.parentNode.insertBefore(e, f.end), m.forEach((t) => e.appendChild(t)), g = e, _ = !0;
		}
		let v = _ ? n(i, s) : t(i, s), y = {
			app: v,
			mountSpan: g,
			setupUpdates: {}
		};
		a[r] = y;
		let b = (e) => {
			y.setupUpdates = e;
		};
		return v.provide("dependencies", {
			...c,
			setupUpdates: b
		}), p && (v.config.compilerOptions = v.config.compilerOptions || {}, v.config.compilerOptions.isCustomElement = (e) => p), v.mount(g), u.done(y.setupUpdates), u.promise;
	}
	function d(e) {
		if (e === void 0) {
			let e = 0;
			for (let t of Object.keys(a)) d(t), e++;
			return e;
		}
		if (Array.isArray(e)) {
			let t = 0;
			for (let n of e) typeof n == "string" && a[n] && (d(n), t++);
			return t;
		}
		if (typeof e != "string") return console.error("Error: destroy() expects a string alias or an array of strings"), !1;
		let t = a[e];
		return t ? (t.app.unmount(), t.mountSpan.parentNode && t.mountSpan.parentNode.removeChild(t.mountSpan), delete a[e], !0) : !1;
	}
	function f(e) {
		return !!a[e];
	}
	function p(e) {
		let t = a[e];
		return t ? t.setupUpdates : (console.error(`App with alias: "${e}" was not found.`), !1);
	}
	function m() {
		return s.aliases();
	}
	function h(e) {
		if (!e || typeof e != "string") {
			console.error("Error: Alias is missing or invalid");
			return;
		}
		let t = s.get(e);
		if (!t) {
			console.error(`Region "${e}" was not defined. Call html.set(...) first.`);
			return;
		}
		return t.isEmpty();
	}
	function g() {
		for (let e of Object.keys(a)) d(e);
		for (let e of Object.keys(o)) delete o[e];
		s.reset();
	}
	return {
		set: l,
		publish: u,
		destroy: d,
		has: f,
		getApp: p,
		isEmpty: h,
		list: m,
		reset: g
	};
}
//#endregion
export { i as default };
