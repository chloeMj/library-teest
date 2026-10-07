import { Fragment as e, Teleport as t, Transition as n, computed as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineComponent as u, nextTick as d, normalizeClass as f, onMounted as p, onUnmounted as m, openBlock as h, ref as g, renderList as _, renderSlot as v, toDisplayString as y, toRef as b, unref as x, useId as S, withCtx as C, withModifiers as w } from "vue";
//#region \0rolldown/runtime.js
var T = Object.defineProperty, E = (e, t) => {
	let n = {};
	for (var r in e) T(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || T(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/composables/useFieldClasses.ts
function D(e) {
	let { block: t, labelPosition: n, errorPosition: i, invalid: a, disabled: o, focused: s, floated: c } = e;
	return {
		rootClasses: r(() => [
			`${t}--label-${n.value}`,
			`${t}--error-${i.value}`,
			{
				[`${t}--invalid`]: a.value,
				[`${t}--disabled`]: o.value
			}
		]),
		controlClasses: r(() => ({
			[`${t}__control--focused`]: s.value,
			[`${t}__control--floated`]: c.value
		}))
	};
}
//#endregion
//#region src/composables/useFieldValidation.ts
var O = (e) => e == null || e === "";
function k(e) {
	let { value: t, type: n, required: i, max: a, validator: o, touched: s } = e, c = e.isEmpty ?? O;
	return { errorMessage: r(() => {
		if (!s.value) return null;
		if (i?.value && c(t.value)) return "필수 입력값입니다.";
		if (a?.value != null && !c(t.value)) {
			if (n.value === "number") {
				if (Number(t.value) > a.value) return `${a.value} 이하로 입력해주세요.`;
			} else if (String(t.value).length > a.value) return `최대 ${a.value}자까지 입력 가능합니다.`;
		}
		if (o?.value) {
			let e = o.value(t.value);
			if (typeof e == "string") return e;
			if (e === !1) return "입력값을 확인해주세요.";
		}
		return null;
	}) };
}
//#endregion
//#region src/types/form.ts
var A = (e) => typeof e == "object", j = {
	key: 0,
	class: "ui-checkbox-group__label"
}, M = {
	key: 0,
	class: "ui-checkbox-group__required-mark"
}, N = { class: "ui-checkbox-group__body" }, P = [
	"role",
	"aria-label",
	"aria-required",
	"aria-describedby"
], F = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], ee = { class: "ui-checkbox-group__option-label" }, I = {
	key: 0,
	class: "ui-checkbox-group__option-icon",
	"aria-hidden": "true"
}, L = ["src", "alt"], R = {
	key: 1,
	class: "ui-checkbox-group__required-mark"
}, z = {
	key: 0,
	class: "ui-checkbox-group__empty"
}, B = ["id"], V = /*@__PURE__*/ u({
	__name: "Checkbox",
	props: {
		modelValue: {
			type: [Boolean, Array],
			default: !1
		},
		options: {},
		label: {},
		labelPosition: { default: "top" },
		direction: { default: "vertical" },
		variant: { default: "box" },
		required: {
			type: Boolean,
			default: !1
		},
		errorPosition: { default: "bottom" },
		validator: {},
		disabled: {
			type: Boolean,
			default: !1
		},
		name: {},
		id: {}
	},
	emits: ["update:modelValue", "blur"],
	setup(t, { expose: n, emit: i }) {
		let l = t, u = i, d = g(!1), p = S(), m = r(() => l.id ?? p), C = r(() => l.name ?? m.value), w = r(() => `${m.value}-error`), T = r(() => Array.isArray(l.options)), E = r(() => T.value ? l.options : [{
			label: l.label ?? "",
			value: !0
		}]), { errorMessage: O } = k({
			value: b(l, "modelValue"),
			type: r(() => "checkbox"),
			required: b(l, "required"),
			validator: b(l, "validator"),
			touched: d,
			isEmpty: (e) => Array.isArray(e) ? e.length === 0 : e !== !0
		}), { rootClasses: V } = D({
			block: "ui-checkbox-group",
			labelPosition: b(l, "labelPosition"),
			errorPosition: b(l, "errorPosition"),
			invalid: r(() => !!O.value),
			disabled: b(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), H = (e) => l.disabled || !!e.disabled, U = (e) => T.value ? (Array.isArray(l.modelValue) ? l.modelValue : []).includes(e.value) : l.modelValue === !0, W = (e) => {
			if (H(e)) return;
			if (d.value = !0, !T.value) {
				u("update:modelValue", !U(e));
				return;
			}
			let t = Array.isArray(l.modelValue) ? l.modelValue : [], n = U(e) ? t.filter((t) => t !== e.value) : [...t, e.value];
			u("update:modelValue", n);
		}, G = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !O.value) }), (n, r) => (h(), o("div", { class: f(["ui-checkbox-group", x(V)]) }, [T.value && t.label ? (h(), o("span", j, [v(n.$slots, "label", {}, () => [c(y(t.label), 1), t.required ? (h(), o("span", M, "*")) : a("", !0)])])) : a("", !0), s("div", N, [s("div", {
			class: f(["ui-checkbox-group__options", [`ui-checkbox-group__options--${t.variant}`, { "ui-checkbox-group__options--horizontal": t.direction === "horizontal" }]]),
			role: T.value ? "group" : void 0,
			"aria-label": T.value ? t.label : void 0,
			"aria-required": t.required,
			"aria-describedby": x(O) ? w.value : void 0
		}, [(h(!0), o(e, null, _(E.value, (i, l) => (h(), o("label", {
			key: T.value ? i.value : "single",
			class: f(["ui-checkbox-group__option", {
				"ui-checkbox-group__option--disabled": H(i),
				"ui-checkbox-group__option--selected": U(i)
			}])
		}, [
			s("input", {
				type: "checkbox",
				class: "ui-checkbox-group__input",
				name: C.value,
				value: i.value,
				checked: U(i),
				disabled: H(i),
				onChange: (e) => W(i),
				onBlur: G
			}, null, 40, F),
			r[0] ||= s("span", {
				class: "ui-checkbox-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", ee, [v(n.$slots, "option", {
				option: i,
				index: l
			}, () => [
				i.icon ? (h(), o("span", I, [x(A)(i.icon) ? (h(), o("img", {
					key: 0,
					class: "ui-checkbox-group__option-icon-img",
					src: i.icon.src,
					alt: i.icon.alt ?? ""
				}, null, 8, L)) : (h(), o(e, { key: 1 }, [c(y(i.icon), 1)], 64))])) : a("", !0),
				c(" " + y(i.label), 1),
				!T.value && t.required ? (h(), o("span", R, "*")) : a("", !0)
			])])
		], 2))), 128)), T.value && E.value.length === 0 ? (h(), o("p", z, [v(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, P), x(O) ? (h(), o("p", {
			key: 0,
			id: w.value,
			class: "ui-checkbox-group__error",
			role: "alert"
		}, [v(n.$slots, "error", { message: x(O) }, () => [c(y(x(O)), 1)])], 8, B)) : a("", !0)])], 2));
	}
}), H = /* @__PURE__ */ E({ default: () => U }), U = V;
//#endregion
//#region src/composables/useFloatingLabel.ts
function W(e) {
	let t = g(!1), n = r(() => e.value !== null && e.value !== void 0 && e.value !== "");
	return {
		isFocused: t,
		hasValue: n,
		isFloated: r(() => t.value || n.value),
		onFocus: () => {
			t.value = !0;
		},
		onBlur: () => {
			t.value = !1;
		}
	};
}
//#endregion
//#region src/components/form/Input.vue?vue&type=script&setup=true&lang.ts
var G = ["for"], te = {
	key: 0,
	class: "ui-input__required-mark"
}, ne = { class: "ui-input__body" }, re = {
	key: 0,
	class: "ui-input__affix ui-input__affix--prefix"
}, K = ["for"], q = {
	key: 0,
	class: "ui-input__required-mark"
}, J = [
	"id",
	"type",
	"value",
	"placeholder",
	"disabled",
	"readonly",
	"name",
	"min",
	"max",
	"aria-invalid",
	"aria-describedby"
], Y = {
	key: 2,
	class: "ui-input__affix ui-input__affix--suffix"
}, X = {
	key: 3,
	class: "ui-input__stepper"
}, Z = ["disabled"], Q = ["disabled"], $ = ["id"], ie = /*@__PURE__*/ u({
	__name: "Input",
	props: {
		modelValue: { default: "" },
		type: { default: "text" },
		label: {},
		labelPosition: { default: "top" },
		placeholder: {},
		required: {
			type: Boolean,
			default: !1
		},
		max: {},
		min: {},
		step: { default: 1 },
		showStepper: {
			type: Boolean,
			default: !1
		},
		errorPosition: { default: "bottom" },
		validator: {},
		disabled: {
			type: Boolean,
			default: !1
		},
		readonly: {
			type: Boolean,
			default: !1
		},
		name: {},
		id: {}
	},
	emits: [
		"update:modelValue",
		"focus",
		"blur"
	],
	setup(e, { expose: t, emit: n }) {
		let i = e, l = n, u = g(null), d = g(!1), p = S(), m = r(() => i.id ?? p), _ = r(() => `${m.value}-error`), C = b(i, "modelValue"), w = W(C), { errorMessage: T } = k({
			value: C,
			type: b(i, "type"),
			required: b(i, "required"),
			max: b(i, "max"),
			validator: b(i, "validator"),
			touched: d
		}), E = r(() => i.modelValue ?? ""), { rootClasses: O, controlClasses: A } = D({
			block: "ui-input",
			labelPosition: b(i, "labelPosition"),
			errorPosition: b(i, "errorPosition"),
			invalid: r(() => !!T.value),
			disabled: b(i, "disabled"),
			focused: w.isFocused,
			floated: w.isFloated
		}), j = (e) => {
			let t = e.target;
			if (i.type === "number") {
				if (t.value === "") {
					l("update:modelValue", null);
					return;
				}
				let e = Number(t.value);
				l("update:modelValue", Number.isNaN(e) ? t.value : e);
				return;
			}
			l("update:modelValue", t.value);
		}, M = (e) => {
			w.onFocus(), l("focus", e);
		}, N = (e) => {
			w.onBlur(), d.value = !0, l("blur", e);
		}, P = (e) => {
			if (i.disabled || i.readonly) return;
			let t = (typeof i.modelValue == "number" ? i.modelValue : Number(i.modelValue) || 0) + e * i.step;
			i.max != null && (t = Math.min(t, i.max)), i.min != null && (t = Math.max(t, i.min)), l("update:modelValue", t);
		};
		return t({
			focus: () => u.value?.focus(),
			validate: () => (d.value = !0, !T.value)
		}), (t, n) => (h(), o("div", { class: f(["ui-input", x(O)]) }, [e.label && e.labelPosition !== "inside" ? (h(), o("label", {
			key: 0,
			class: "ui-input__label",
			for: m.value
		}, [v(t.$slots, "label", {}, () => [c(y(e.label), 1), e.required ? (h(), o("span", te, "*")) : a("", !0)])], 8, G)) : a("", !0), s("div", ne, [s("div", { class: f(["ui-input__control", x(A)]) }, [
			t.$slots.prefix ? (h(), o("span", re, [v(t.$slots, "prefix")])) : a("", !0),
			e.label && e.labelPosition === "inside" ? (h(), o("label", {
				key: 1,
				class: "ui-input__label ui-input__label--inside",
				for: m.value
			}, [v(t.$slots, "label", {}, () => [c(y(e.label), 1), e.required ? (h(), o("span", q, "*")) : a("", !0)])], 8, K)) : a("", !0),
			s("input", {
				id: m.value,
				ref_key: "inputRef",
				ref: u,
				class: "ui-input__field",
				type: e.type,
				value: E.value,
				placeholder: e.labelPosition === "inside" ? void 0 : e.placeholder,
				disabled: e.disabled,
				readonly: e.readonly,
				name: e.name,
				min: e.type === "number" ? e.min : void 0,
				max: e.type === "number" ? e.max : void 0,
				"aria-invalid": !!x(T),
				"aria-describedby": x(T) ? _.value : void 0,
				onInput: j,
				onFocus: M,
				onBlur: N
			}, null, 40, J),
			t.$slots.suffix ? (h(), o("span", Y, [v(t.$slots, "suffix")])) : a("", !0),
			e.type === "number" && e.showStepper ? (h(), o("span", X, [s("button", {
				type: "button",
				class: "ui-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[0] ||= (e) => P(1)
			}, "+", 8, Z), s("button", {
				type: "button",
				class: "ui-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[1] ||= (e) => P(-1)
			}, "-", 8, Q)])) : a("", !0)
		], 2), x(T) ? (h(), o("p", {
			key: 0,
			id: _.value,
			class: "ui-input__error",
			role: "alert"
		}, [v(t.$slots, "error", { message: x(T) }, () => [c(y(x(T)), 1)])], 8, $)) : a("", !0)])], 2));
	}
}), ae = /* @__PURE__ */ E({ default: () => oe }), oe = ie, se = {
	key: 0,
	class: "ui-radio-group__label"
}, ce = {
	key: 0,
	class: "ui-radio-group__required-mark"
}, le = { class: "ui-radio-group__body" }, ue = [
	"aria-label",
	"aria-required",
	"aria-describedby"
], de = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], fe = { class: "ui-radio-group__option-label" }, pe = {
	key: 0,
	class: "ui-radio-group__option-icon",
	"aria-hidden": "true"
}, me = ["src", "alt"], he = {
	key: 0,
	class: "ui-radio-group__empty"
}, ge = ["id"], _e = /*@__PURE__*/ u({
	__name: "Radio",
	props: {
		modelValue: { default: null },
		options: { default: () => [] },
		label: {},
		labelPosition: { default: "top" },
		direction: { default: "vertical" },
		variant: { default: "dot" },
		required: {
			type: Boolean,
			default: !1
		},
		errorPosition: { default: "bottom" },
		validator: {},
		disabled: {
			type: Boolean,
			default: !1
		},
		name: {},
		id: {}
	},
	emits: ["update:modelValue", "blur"],
	setup(t, { expose: n, emit: i }) {
		let l = t, u = i, d = g(!1), p = S(), m = r(() => l.id ?? p), C = r(() => l.name ?? m.value), w = r(() => `${m.value}-error`), { errorMessage: T } = k({
			value: b(l, "modelValue"),
			type: r(() => "radio"),
			required: b(l, "required"),
			validator: b(l, "validator"),
			touched: d
		}), { rootClasses: E } = D({
			block: "ui-radio-group",
			labelPosition: b(l, "labelPosition"),
			errorPosition: b(l, "errorPosition"),
			invalid: r(() => !!T.value),
			disabled: b(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), O = (e) => l.disabled || !!e.disabled, j = (e) => {
			O(e) || (d.value = !0, u("update:modelValue", e.value));
		}, M = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !T.value) }), (n, r) => (h(), o("div", { class: f(["ui-radio-group", x(E)]) }, [t.label ? (h(), o("span", se, [v(n.$slots, "label", {}, () => [c(y(t.label), 1), t.required ? (h(), o("span", ce, "*")) : a("", !0)])])) : a("", !0), s("div", le, [s("div", {
			class: f(["ui-radio-group__options", [`ui-radio-group__options--${t.variant}`, { "ui-radio-group__options--horizontal": t.direction === "horizontal" }]]),
			role: "radiogroup",
			"aria-label": t.label,
			"aria-required": t.required,
			"aria-describedby": x(T) ? w.value : void 0
		}, [(h(!0), o(e, null, _(t.options, (i) => (h(), o("label", {
			key: i.value,
			class: f(["ui-radio-group__option", {
				"ui-radio-group__option--disabled": O(i),
				"ui-radio-group__option--selected": i.value === t.modelValue
			}])
		}, [
			s("input", {
				type: "radio",
				class: "ui-radio-group__input",
				name: C.value,
				value: i.value,
				checked: i.value === t.modelValue,
				disabled: O(i),
				onChange: (e) => j(i),
				onBlur: M
			}, null, 40, de),
			r[0] ||= s("span", {
				class: "ui-radio-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", fe, [v(n.$slots, "option", { option: i }, () => [i.icon ? (h(), o("span", pe, [x(A)(i.icon) ? (h(), o("img", {
				key: 0,
				class: "ui-radio-group__option-icon-img",
				src: i.icon.src,
				alt: i.icon.alt ?? ""
			}, null, 8, me)) : (h(), o(e, { key: 1 }, [c(y(i.icon), 1)], 64))])) : a("", !0), c(" " + y(i.label), 1)])])
		], 2))), 128)), t.options.length === 0 ? (h(), o("p", he, [v(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, ue), x(T) ? (h(), o("p", {
			key: 0,
			id: w.value,
			class: "ui-radio-group__error",
			role: "alert"
		}, [v(n.$slots, "error", { message: x(T) }, () => [c(y(x(T)), 1)])], 8, ge)) : a("", !0)])], 2));
	}
}), ve = /* @__PURE__ */ E({ default: () => ye }), ye = _e;
//#endregion
//#region src/composables/useIsMobile.ts
function be(e = 640) {
	let t = g(!1), n = null, r = () => {
		t.value = n?.matches ?? !1;
	};
	return p(() => {
		typeof window > "u" || (n = window.matchMedia(`(max-width: ${e}px)`), r(), n.addEventListener("change", r));
	}), m(() => {
		n?.removeEventListener("change", r);
	}), t;
}
//#endregion
//#region src/components/form/Select.vue?vue&type=script&setup=true&lang.ts
var xe = ["for"], Se = {
	key: 0,
	class: "ui-select__required-mark"
}, Ce = { class: "ui-select__body" }, we = ["for"], Te = {
	key: 0,
	class: "ui-select__required-mark"
}, Ee = [
	"id",
	"disabled",
	"aria-expanded",
	"aria-controls",
	"aria-describedby"
], De = {
	key: 2,
	class: "ui-select__trigger ui-select__trigger--searchable"
}, Oe = [
	"id",
	"value",
	"placeholder",
	"disabled",
	"aria-expanded",
	"aria-controls",
	"aria-activedescendant",
	"aria-describedby"
], ke = ["id"], Ae = [
	"id",
	"aria-selected",
	"onMousedown",
	"onMouseenter"
], je = {
	key: 0,
	class: "ui-select__empty"
}, Me = ["id"], Ne = { class: "ui-select__sheet-header" }, Pe = { class: "ui-select__sheet-title" }, Fe = ["value"], Ie = { class: "ui-select__sheet-list" }, Le = ["aria-selected", "onClick"], Re = {
	key: 0,
	class: "ui-select__sheet-empty"
}, ze = /*@__PURE__*/ u({
	__name: "Select",
	props: {
		modelValue: { default: null },
		options: { default: () => [] },
		label: {},
		labelPosition: { default: "top" },
		placeholder: {},
		required: {
			type: Boolean,
			default: !1
		},
		errorPosition: { default: "bottom" },
		validator: {},
		disabled: {
			type: Boolean,
			default: !1
		},
		searchable: {
			type: Boolean,
			default: !1
		},
		filterKeys: { default: () => ["label", "value"] },
		filterOption: {},
		mobileBreakpoint: { default: 640 },
		name: {},
		id: {}
	},
	emits: [
		"update:modelValue",
		"focus",
		"blur"
	],
	setup(u, { expose: p, emit: m }) {
		let T = u, E = m, O = g(null), A = g(null), j = g(!1), M = g(!1), N = g(-1), P = g(""), F = be(T.mobileBreakpoint), ee = S(), I = r(() => T.id ?? ee), L = r(() => `${I.value}-error`), R = r(() => `${I.value}-listbox`), z = b(T, "modelValue"), B = W(z), { errorMessage: V } = k({
			value: z,
			type: r(() => "select"),
			required: b(T, "required"),
			validator: b(T, "validator"),
			touched: j
		}), H = r(() => T.options.find((e) => e.value === T.modelValue) ?? null), U = r(() => {
			if (!T.searchable || !P.value.trim()) return T.options;
			let e = P.value.trim().toLowerCase();
			if (T.filterOption) return T.options.filter((t) => T.filterOption(t, e));
			let t = T.filterKeys.length > 0 ? T.filterKeys : ["label", "value"];
			return T.options.filter((n) => t.some((t) => String(n[t] ?? "").toLowerCase().includes(e)));
		}), G = r(() => M.value ? P.value : H.value?.label ?? ""), { rootClasses: te, controlClasses: ne } = D({
			block: "ui-select",
			labelPosition: b(T, "labelPosition"),
			errorPosition: b(T, "errorPosition"),
			invalid: r(() => !!V.value),
			disabled: b(T, "disabled"),
			focused: B.isFocused,
			floated: B.isFloated
		}), re = r(() => ({
			...ne.value,
			"ui-select__control--open": M.value
		})), K = () => {
			if (T.disabled || M.value) return;
			M.value = !0, T.searchable && (P.value = "");
			let e = U.value, t = e.findIndex((e) => e.value === T.modelValue);
			N.value = t >= 0 ? t : e.length > 0 ? 0 : -1, T.searchable && d(() => {
				F.value ? A.value?.focus() : O.value?.focus();
			});
		}, q = () => {
			M.value = !1, N.value = -1, j.value = !0, T.searchable && (P.value = "");
		}, J = () => {
			T.disabled || (M.value ? q() : K());
		}, Y = (e) => {
			T.disabled || (E("update:modelValue", e.value), q(), O.value?.focus());
		}, X = (e) => {
			let t = e.target;
			P.value = t.value, M.value = !0, N.value = U.value.length > 0 ? 0 : -1;
		}, Z = (e) => {
			B.onFocus(), T.searchable && K(), E("focus", e);
		}, Q = (e) => {
			B.onBlur(), F.value ? j.value = !0 : q(), E("blur", e);
		}, $ = (e) => {
			if (T.disabled) return;
			let t = U.value;
			switch (e.key) {
				case "ArrowDown":
					if (e.preventDefault(), !M.value) {
						K();
						return;
					}
					N.value = Math.min(N.value + 1, t.length - 1);
					break;
				case "ArrowUp":
					if (e.preventDefault(), !M.value) {
						K();
						return;
					}
					N.value = Math.max(N.value - 1, 0);
					break;
				case "Enter":
					e.preventDefault(), M.value && N.value >= 0 && t[N.value] ? Y(t[N.value]) : T.searchable || J();
					break;
				case " ":
					T.searchable || (e.preventDefault(), M.value && N.value >= 0 && t[N.value] ? Y(t[N.value]) : J());
					break;
				case "Escape": q(), O.value?.focus();
			}
		};
		return p({
			focus: () => O.value?.focus(),
			validate: () => (j.value = !0, !V.value)
		}), (r, d) => (h(), o("div", { class: f(["ui-select", x(te)]) }, [
			u.label && u.labelPosition !== "inside" ? (h(), o("label", {
				key: 0,
				class: "ui-select__label",
				for: I.value
			}, [v(r.$slots, "label", {}, () => [c(y(u.label), 1), u.required ? (h(), o("span", Se, "*")) : a("", !0)])], 8, xe)) : a("", !0),
			s("div", Ce, [s("div", { class: f(["ui-select__control", re.value]) }, [
				u.label && u.labelPosition === "inside" ? (h(), o("label", {
					key: 0,
					class: "ui-select__label ui-select__label--inside",
					for: I.value
				}, [v(r.$slots, "label", {}, () => [c(y(u.label), 1), u.required ? (h(), o("span", Te, "*")) : a("", !0)])], 8, we)) : a("", !0),
				u.searchable ? (h(), o("div", De, [s("input", {
					id: I.value,
					ref_key: "triggerRef",
					ref: O,
					type: "text",
					class: "ui-select__search-input",
					role: "combobox",
					"aria-autocomplete": "list",
					value: G.value,
					placeholder: u.labelPosition === "inside" ? void 0 : u.placeholder,
					disabled: u.disabled,
					"aria-expanded": M.value,
					"aria-haspopup": "listbox",
					"aria-controls": R.value,
					"aria-activedescendant": N.value >= 0 ? `${I.value}-option-${N.value}` : void 0,
					"aria-describedby": x(V) ? L.value : void 0,
					autocomplete: "off",
					onInput: X,
					onKeydown: $,
					onFocus: Z,
					onBlur: Q
				}, null, 40, Oe), d[2] ||= s("span", {
					class: "ui-select__arrow",
					"aria-hidden": "true"
				}, "▾", -1)])) : (h(), o("button", {
					key: 1,
					id: I.value,
					ref_key: "triggerRef",
					ref: O,
					type: "button",
					class: "ui-select__trigger",
					disabled: u.disabled,
					"aria-expanded": M.value,
					"aria-haspopup": "listbox",
					"aria-controls": R.value,
					"aria-describedby": x(V) ? L.value : void 0,
					onClick: J,
					onKeydown: $,
					onFocus: Z,
					onBlur: Q
				}, [s("span", { class: f(["ui-select__value", { "ui-select__value--placeholder": !H.value }]) }, y(H.value ? H.value.label : u.labelPosition === "inside" ? "" : u.placeholder), 3), d[1] ||= s("span", {
					class: "ui-select__arrow",
					"aria-hidden": "true"
				}, "▾", -1)], 40, Ee)),
				M.value && !x(F) ? (h(), o("ul", {
					key: 3,
					id: R.value,
					class: "ui-select__menu",
					role: "listbox"
				}, [(h(!0), o(e, null, _(U.value, (e, t) => (h(), o("li", {
					id: `${I.value}-option-${t}`,
					key: e.value,
					role: "option",
					"aria-selected": e.value === u.modelValue,
					class: f(["ui-select__option", {
						"ui-select__option--selected": e.value === u.modelValue,
						"ui-select__option--active": t === N.value
					}]),
					onMousedown: w((t) => Y(e), ["prevent"]),
					onMouseenter: (e) => N.value = t
				}, [v(r.$slots, "option", { option: e }, () => [c(y(e.label), 1)])], 42, Ae))), 128)), U.value.length === 0 ? (h(), o("li", je, [v(r.$slots, "empty", {}, () => [c(y(u.searchable && P.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)], 8, ke)) : a("", !0)
			], 2), x(V) ? (h(), o("p", {
				key: 0,
				id: L.value,
				class: "ui-select__error",
				role: "alert"
			}, [v(r.$slots, "error", { message: x(V) }, () => [c(y(x(V)), 1)])], 8, Me)) : a("", !0)]),
			(h(), i(t, { to: "body" }, [l(n, { name: "ui-select-sheet" }, {
				default: C(() => [M.value && x(F) ? (h(), o("div", {
					key: 0,
					class: "ui-select__sheet-backdrop",
					onClick: q
				}, [s("div", {
					class: "ui-select__sheet",
					role: "listbox",
					onClick: d[0] ||= w(() => {}, ["stop"])
				}, [
					s("div", Ne, [s("span", Pe, y(u.label || u.placeholder), 1), s("button", {
						type: "button",
						class: "ui-select__sheet-close",
						"aria-label": "닫기",
						onClick: q
					}, "✕")]),
					u.searchable ? (h(), o("input", {
						key: 0,
						ref_key: "sheetSearchRef",
						ref: A,
						type: "text",
						class: "ui-select__sheet-search",
						placeholder: "검색",
						value: P.value,
						onInput: X,
						onKeydown: $
					}, null, 40, Fe)) : a("", !0),
					s("ul", Ie, [(h(!0), o(e, null, _(U.value, (e, t) => (h(), o("li", {
						key: e.value,
						role: "option",
						"aria-selected": e.value === u.modelValue,
						class: f(["ui-select__sheet-option", {
							"ui-select__sheet-option--selected": e.value === u.modelValue,
							"ui-select__sheet-option--active": t === N.value
						}]),
						onClick: (t) => Y(e)
					}, [v(r.$slots, "option", { option: e }, () => [c(y(e.label), 1)])], 10, Le))), 128)), U.value.length === 0 ? (h(), o("li", Re, [v(r.$slots, "empty", {}, () => [c(y(u.searchable && P.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)])
				])])) : a("", !0)]),
				_: 3
			})]))
		], 2));
	}
}), Be = /* @__PURE__ */ E({ default: () => Ve }), Ve = ze, He = "Ui", Ue = /* #__PURE__ */ Object.assign({
	"./components/form/Checkbox.vue": H,
	"./components/form/Input.vue": ae,
	"./components/form/Radio.vue": ve,
	"./components/form/Select.vue": Be
}), We = {};
Object.entries(Ue).forEach(([e, t]) => {
	let n = e.split("/").pop()?.replace(".vue", "") ?? "";
	We[`${He}${n}`] = t.default;
});
var Ge = We, Ke = { install(e) {
	Object.entries(We).forEach(([t, n]) => {
		e.component(t, n);
	});
} };
//#endregion
export { Ge as allComponents, Ke as default };
