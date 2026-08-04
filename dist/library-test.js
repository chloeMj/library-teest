//#region src/index.ts
var e = /* #__PURE__ */ Object.assign({}), t = {};
Object.entries(e).forEach((e) => {
	let [n, r] = e, i = String(n?.split("/")?.pop().replace(".vue", "") ?? "");
	t[i] = r.default;
});
var { ...n } = t, r = { install: (e) => {
	Object.entries(t).forEach(([t, n]) => {
		e.component(t, n);
	});
} };
//#endregion
export { n as allComponents, r as default };
