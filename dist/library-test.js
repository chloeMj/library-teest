import { Fragment as e, Teleport as t, Transition as n, computed as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineComponent as u, nextTick as d, normalizeClass as f, onMounted as p, onUnmounted as m, openBlock as h, ref as g, renderList as _, renderSlot as v, toDisplayString as y, toRef as b, unref as x, useId as S, withCtx as C, withModifiers as w } from "vue";
//#region src/composables/useFieldClasses.ts
function T(e) {
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
var E = (e) => e == null || e === "";
function D(e) {
	let { value: t, type: n, required: i, max: a, validator: o, touched: s } = e, c = e.isEmpty ?? E;
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
//#region src/composables/useFloatingLabel.ts
function O(e) {
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
var k = ["for"], A = {
	key: 0,
	class: "ui-input__required-mark"
}, j = { class: "ui-input__body" }, M = {
	key: 0,
	class: "ui-input__affix ui-input__affix--prefix"
}, N = ["for"], P = {
	key: 0,
	class: "ui-input__required-mark"
}, F = [
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
], I = {
	key: 2,
	class: "ui-input__affix ui-input__affix--suffix"
}, ee = {
	key: 3,
	class: "ui-input__stepper"
}, L = ["disabled"], R = ["disabled"], z = ["id"], B = /* @__PURE__ */ u({
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
		let i = e, l = n, u = g(null), d = g(!1), p = S(), m = r(() => i.id ?? p), _ = r(() => `${m.value}-error`), C = b(i, "modelValue"), w = O(C), { errorMessage: E } = D({
			value: C,
			type: b(i, "type"),
			required: b(i, "required"),
			max: b(i, "max"),
			validator: b(i, "validator"),
			touched: d
		}), B = r(() => i.modelValue ?? ""), { rootClasses: te, controlClasses: ne } = T({
			block: "ui-input",
			labelPosition: b(i, "labelPosition"),
			errorPosition: b(i, "errorPosition"),
			invalid: r(() => !!E.value),
			disabled: b(i, "disabled"),
			focused: w.isFocused,
			floated: w.isFloated
		}), re = (e) => {
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
		}, ie = (e) => {
			w.onFocus(), l("focus", e);
		}, ae = (e) => {
			w.onBlur(), d.value = !0, l("blur", e);
		}, V = (e) => {
			if (i.disabled || i.readonly) return;
			let t = (typeof i.modelValue == "number" ? i.modelValue : Number(i.modelValue) || 0) + e * i.step;
			i.max != null && (t = Math.min(t, i.max)), i.min != null && (t = Math.max(t, i.min)), l("update:modelValue", t);
		};
		return t({
			focus: () => u.value?.focus(),
			validate: () => (d.value = !0, !E.value)
		}), (t, n) => (h(), o("div", { class: f(["ui-input", x(te)]) }, [e.label && e.labelPosition !== "inside" ? (h(), o("label", {
			key: 0,
			class: "ui-input__label",
			for: m.value
		}, [v(t.$slots, "label", {}, () => [c(y(e.label), 1), e.required ? (h(), o("span", A, "*")) : a("", !0)])], 8, k)) : a("", !0), s("div", j, [s("div", { class: f(["ui-input__control", x(ne)]) }, [
			t.$slots.prefix ? (h(), o("span", M, [v(t.$slots, "prefix")])) : a("", !0),
			e.label && e.labelPosition === "inside" ? (h(), o("label", {
				key: 1,
				class: "ui-input__label ui-input__label--inside",
				for: m.value
			}, [v(t.$slots, "label", {}, () => [c(y(e.label), 1), e.required ? (h(), o("span", P, "*")) : a("", !0)])], 8, N)) : a("", !0),
			s("input", {
				id: m.value,
				ref_key: "inputRef",
				ref: u,
				class: "ui-input__field",
				type: e.type,
				value: B.value,
				placeholder: e.labelPosition === "inside" ? void 0 : e.placeholder,
				disabled: e.disabled,
				readonly: e.readonly,
				name: e.name,
				min: e.type === "number" ? e.min : void 0,
				max: e.type === "number" ? e.max : void 0,
				"aria-invalid": !!x(E),
				"aria-describedby": x(E) ? _.value : void 0,
				onInput: re,
				onFocus: ie,
				onBlur: ae
			}, null, 40, F),
			t.$slots.suffix ? (h(), o("span", I, [v(t.$slots, "suffix")])) : a("", !0),
			e.type === "number" && e.showStepper ? (h(), o("span", ee, [s("button", {
				type: "button",
				class: "ui-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[0] ||= (e) => V(1)
			}, "+", 8, L), s("button", {
				type: "button",
				class: "ui-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[1] ||= (e) => V(-1)
			}, "-", 8, R)])) : a("", !0)
		], 2), x(E) ? (h(), o("p", {
			key: 0,
			id: _.value,
			class: "ui-input__error",
			role: "alert"
		}, [v(t.$slots, "error", { message: x(E) }, () => [c(y(x(E)), 1)])], 8, z)) : a("", !0)])], 2));
	}
});
//#endregion
//#region src/composables/useIsMobile.ts
function te(e = 640) {
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
var ne = ["for"], re = {
	key: 0,
	class: "ui-select__required-mark"
}, ie = { class: "ui-select__body" }, ae = ["for"], V = {
	key: 0,
	class: "ui-select__required-mark"
}, oe = [
	"id",
	"disabled",
	"aria-expanded",
	"aria-controls",
	"aria-describedby"
], se = {
	key: 2,
	class: "ui-select__trigger ui-select__trigger--searchable"
}, ce = [
	"id",
	"value",
	"placeholder",
	"disabled",
	"aria-expanded",
	"aria-controls",
	"aria-activedescendant",
	"aria-describedby"
], le = ["id"], ue = [
	"id",
	"aria-selected",
	"onMousedown",
	"onMouseenter"
], de = {
	key: 0,
	class: "ui-select__empty"
}, fe = ["id"], pe = { class: "ui-select__sheet-header" }, me = { class: "ui-select__sheet-title" }, he = ["value"], ge = { class: "ui-select__sheet-list" }, _e = ["aria-selected", "onClick"], ve = {
	key: 0,
	class: "ui-select__sheet-empty"
}, H = /* @__PURE__ */ u({
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
		let E = u, k = m, A = g(null), j = g(null), M = g(!1), N = g(!1), P = g(-1), F = g(""), I = te(E.mobileBreakpoint), ee = S(), L = r(() => E.id ?? ee), R = r(() => `${L.value}-error`), z = r(() => `${L.value}-listbox`), B = b(E, "modelValue"), H = O(B), { errorMessage: U } = D({
			value: B,
			type: r(() => "select"),
			required: b(E, "required"),
			validator: b(E, "validator"),
			touched: M
		}), W = r(() => E.options.find((e) => e.value === E.modelValue) ?? null), G = r(() => {
			if (!E.searchable || !F.value.trim()) return E.options;
			let e = F.value.trim().toLowerCase();
			if (E.filterOption) return E.options.filter((t) => E.filterOption(t, e));
			let t = E.filterKeys.length > 0 ? E.filterKeys : ["label", "value"];
			return E.options.filter((n) => t.some((t) => String(n[t] ?? "").toLowerCase().includes(e)));
		}), ye = r(() => N.value ? F.value : W.value?.label ?? ""), { rootClasses: be, controlClasses: xe } = T({
			block: "ui-select",
			labelPosition: b(E, "labelPosition"),
			errorPosition: b(E, "errorPosition"),
			invalid: r(() => !!U.value),
			disabled: b(E, "disabled"),
			focused: H.isFocused,
			floated: H.isFloated
		}), Se = r(() => ({
			...xe.value,
			"ui-select__control--open": N.value
		})), K = () => {
			if (E.disabled || N.value) return;
			N.value = !0, E.searchable && (F.value = "");
			let e = G.value, t = e.findIndex((e) => e.value === E.modelValue);
			P.value = t >= 0 ? t : e.length > 0 ? 0 : -1, E.searchable && d(() => {
				I.value ? j.value?.focus() : A.value?.focus();
			});
		}, q = () => {
			N.value = !1, P.value = -1, M.value = !0, E.searchable && (F.value = "");
		}, J = () => {
			E.disabled || (N.value ? q() : K());
		}, Y = (e) => {
			E.disabled || (k("update:modelValue", e.value), q(), A.value?.focus());
		}, X = (e) => {
			let t = e.target;
			F.value = t.value, N.value = !0, P.value = G.value.length > 0 ? 0 : -1;
		}, Z = (e) => {
			H.onFocus(), E.searchable && K(), k("focus", e);
		}, Q = (e) => {
			H.onBlur(), I.value ? M.value = !0 : q(), k("blur", e);
		}, $ = (e) => {
			if (E.disabled) return;
			let t = G.value;
			switch (e.key) {
				case "ArrowDown":
					if (e.preventDefault(), !N.value) {
						K();
						return;
					}
					P.value = Math.min(P.value + 1, t.length - 1);
					break;
				case "ArrowUp":
					if (e.preventDefault(), !N.value) {
						K();
						return;
					}
					P.value = Math.max(P.value - 1, 0);
					break;
				case "Enter":
					e.preventDefault(), N.value && P.value >= 0 && t[P.value] ? Y(t[P.value]) : E.searchable || J();
					break;
				case " ":
					E.searchable || (e.preventDefault(), N.value && P.value >= 0 && t[P.value] ? Y(t[P.value]) : J());
					break;
				case "Escape": q(), A.value?.focus();
			}
		};
		return p({
			focus: () => A.value?.focus(),
			validate: () => (M.value = !0, !U.value)
		}), (r, d) => (h(), o("div", { class: f(["ui-select", x(be)]) }, [
			u.label && u.labelPosition !== "inside" ? (h(), o("label", {
				key: 0,
				class: "ui-select__label",
				for: L.value
			}, [v(r.$slots, "label", {}, () => [c(y(u.label), 1), u.required ? (h(), o("span", re, "*")) : a("", !0)])], 8, ne)) : a("", !0),
			s("div", ie, [s("div", { class: f(["ui-select__control", Se.value]) }, [
				u.label && u.labelPosition === "inside" ? (h(), o("label", {
					key: 0,
					class: "ui-select__label ui-select__label--inside",
					for: L.value
				}, [v(r.$slots, "label", {}, () => [c(y(u.label), 1), u.required ? (h(), o("span", V, "*")) : a("", !0)])], 8, ae)) : a("", !0),
				u.searchable ? (h(), o("div", se, [s("input", {
					id: L.value,
					ref_key: "triggerRef",
					ref: A,
					type: "text",
					class: "ui-select__search-input",
					role: "combobox",
					"aria-autocomplete": "list",
					value: ye.value,
					placeholder: u.labelPosition === "inside" ? void 0 : u.placeholder,
					disabled: u.disabled,
					"aria-expanded": N.value,
					"aria-haspopup": "listbox",
					"aria-controls": z.value,
					"aria-activedescendant": P.value >= 0 ? `${L.value}-option-${P.value}` : void 0,
					"aria-describedby": x(U) ? R.value : void 0,
					autocomplete: "off",
					onInput: X,
					onKeydown: $,
					onFocus: Z,
					onBlur: Q
				}, null, 40, ce), d[2] ||= s("span", {
					class: "ui-select__arrow",
					"aria-hidden": "true"
				}, "▾", -1)])) : (h(), o("button", {
					key: 1,
					id: L.value,
					ref_key: "triggerRef",
					ref: A,
					type: "button",
					class: "ui-select__trigger",
					disabled: u.disabled,
					"aria-expanded": N.value,
					"aria-haspopup": "listbox",
					"aria-controls": z.value,
					"aria-describedby": x(U) ? R.value : void 0,
					onClick: J,
					onKeydown: $,
					onFocus: Z,
					onBlur: Q
				}, [s("span", { class: f(["ui-select__value", { "ui-select__value--placeholder": !W.value }]) }, y(W.value ? W.value.label : u.labelPosition === "inside" ? "" : u.placeholder), 3), d[1] ||= s("span", {
					class: "ui-select__arrow",
					"aria-hidden": "true"
				}, "▾", -1)], 40, oe)),
				N.value && !x(I) ? (h(), o("ul", {
					key: 3,
					id: z.value,
					class: "ui-select__menu",
					role: "listbox"
				}, [(h(!0), o(e, null, _(G.value, (e, t) => (h(), o("li", {
					id: `${L.value}-option-${t}`,
					key: e.value,
					role: "option",
					"aria-selected": e.value === u.modelValue,
					class: f(["ui-select__option", {
						"ui-select__option--selected": e.value === u.modelValue,
						"ui-select__option--active": t === P.value
					}]),
					onMousedown: w((t) => Y(e), ["prevent"]),
					onMouseenter: (e) => P.value = t
				}, [v(r.$slots, "option", { option: e }, () => [c(y(e.label), 1)])], 42, ue))), 128)), G.value.length === 0 ? (h(), o("li", de, [v(r.$slots, "empty", {}, () => [c(y(u.searchable && F.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)], 8, le)) : a("", !0)
			], 2), x(U) ? (h(), o("p", {
				key: 0,
				id: R.value,
				class: "ui-select__error",
				role: "alert"
			}, [v(r.$slots, "error", { message: x(U) }, () => [c(y(x(U)), 1)])], 8, fe)) : a("", !0)]),
			(h(), i(t, { to: "body" }, [l(n, { name: "ui-select-sheet" }, {
				default: C(() => [N.value && x(I) ? (h(), o("div", {
					key: 0,
					class: "ui-select__sheet-backdrop",
					onClick: q
				}, [s("div", {
					class: "ui-select__sheet",
					role: "listbox",
					onClick: d[0] ||= w(() => {}, ["stop"])
				}, [
					s("div", pe, [s("span", me, y(u.label || u.placeholder), 1), s("button", {
						type: "button",
						class: "ui-select__sheet-close",
						"aria-label": "닫기",
						onClick: q
					}, "✕")]),
					u.searchable ? (h(), o("input", {
						key: 0,
						ref_key: "sheetSearchRef",
						ref: j,
						type: "text",
						class: "ui-select__sheet-search",
						placeholder: "검색",
						value: F.value,
						onInput: X,
						onKeydown: $
					}, null, 40, he)) : a("", !0),
					s("ul", ge, [(h(!0), o(e, null, _(G.value, (e, t) => (h(), o("li", {
						key: e.value,
						role: "option",
						"aria-selected": e.value === u.modelValue,
						class: f(["ui-select__sheet-option", {
							"ui-select__sheet-option--selected": e.value === u.modelValue,
							"ui-select__sheet-option--active": t === P.value
						}]),
						onClick: (t) => Y(e)
					}, [v(r.$slots, "option", { option: e }, () => [c(y(e.label), 1)])], 10, _e))), 128)), G.value.length === 0 ? (h(), o("li", ve, [v(r.$slots, "empty", {}, () => [c(y(u.searchable && F.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)])
				])])) : a("", !0)]),
				_: 3
			})]))
		], 2));
	}
}), U = (e) => typeof e == "object", W = {
	key: 0,
	class: "ui-radio-group__label"
}, G = {
	key: 0,
	class: "ui-radio-group__required-mark"
}, ye = { class: "ui-radio-group__body" }, be = [
	"aria-label",
	"aria-required",
	"aria-describedby"
], xe = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], Se = { class: "ui-radio-group__option-label" }, K = {
	key: 0,
	class: "ui-radio-group__option-icon",
	"aria-hidden": "true"
}, q = ["src", "alt"], J = {
	key: 0,
	class: "ui-radio-group__empty"
}, Y = ["id"], X = /* @__PURE__ */ u({
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
		let l = t, u = i, d = g(!1), p = S(), m = r(() => l.id ?? p), C = r(() => l.name ?? m.value), w = r(() => `${m.value}-error`), { errorMessage: E } = D({
			value: b(l, "modelValue"),
			type: r(() => "radio"),
			required: b(l, "required"),
			validator: b(l, "validator"),
			touched: d
		}), { rootClasses: O } = T({
			block: "ui-radio-group",
			labelPosition: b(l, "labelPosition"),
			errorPosition: b(l, "errorPosition"),
			invalid: r(() => !!E.value),
			disabled: b(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), k = (e) => l.disabled || !!e.disabled, A = (e) => {
			k(e) || (d.value = !0, u("update:modelValue", e.value));
		}, j = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !E.value) }), (n, r) => (h(), o("div", { class: f(["ui-radio-group", x(O)]) }, [t.label ? (h(), o("span", W, [v(n.$slots, "label", {}, () => [c(y(t.label), 1), t.required ? (h(), o("span", G, "*")) : a("", !0)])])) : a("", !0), s("div", ye, [s("div", {
			class: f(["ui-radio-group__options", [`ui-radio-group__options--${t.variant}`, { "ui-radio-group__options--horizontal": t.direction === "horizontal" }]]),
			role: "radiogroup",
			"aria-label": t.label,
			"aria-required": t.required,
			"aria-describedby": x(E) ? w.value : void 0
		}, [(h(!0), o(e, null, _(t.options, (i) => (h(), o("label", {
			key: i.value,
			class: f(["ui-radio-group__option", {
				"ui-radio-group__option--disabled": k(i),
				"ui-radio-group__option--selected": i.value === t.modelValue
			}])
		}, [
			s("input", {
				type: "radio",
				class: "ui-radio-group__input",
				name: C.value,
				value: i.value,
				checked: i.value === t.modelValue,
				disabled: k(i),
				onChange: (e) => A(i),
				onBlur: j
			}, null, 40, xe),
			r[0] ||= s("span", {
				class: "ui-radio-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", Se, [v(n.$slots, "option", { option: i }, () => [i.icon ? (h(), o("span", K, [x(U)(i.icon) ? (h(), o("img", {
				key: 0,
				class: "ui-radio-group__option-icon-img",
				src: i.icon.src,
				alt: i.icon.alt ?? ""
			}, null, 8, q)) : (h(), o(e, { key: 1 }, [c(y(i.icon), 1)], 64))])) : a("", !0), c(" " + y(i.label), 1)])])
		], 2))), 128)), t.options.length === 0 ? (h(), o("p", J, [v(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, be), x(E) ? (h(), o("p", {
			key: 0,
			id: w.value,
			class: "ui-radio-group__error",
			role: "alert"
		}, [v(n.$slots, "error", { message: x(E) }, () => [c(y(x(E)), 1)])], 8, Y)) : a("", !0)])], 2));
	}
}), Z = {
	key: 0,
	class: "ui-checkbox-group__label"
}, Q = {
	key: 0,
	class: "ui-checkbox-group__required-mark"
}, $ = { class: "ui-checkbox-group__body" }, Ce = [
	"role",
	"aria-label",
	"aria-required",
	"aria-describedby"
], we = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], Te = { class: "ui-checkbox-group__option-label" }, Ee = {
	key: 0,
	class: "ui-checkbox-group__option-icon",
	"aria-hidden": "true"
}, De = ["src", "alt"], Oe = {
	key: 1,
	class: "ui-checkbox-group__required-mark"
}, ke = {
	key: 0,
	class: "ui-checkbox-group__empty"
}, Ae = ["id"], je = "single", Me = /* @__PURE__ */ u({
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
		let l = t, u = i, d = g(!1), p = S(), m = r(() => l.id ?? p), C = r(() => l.name ?? m.value), w = r(() => `${m.value}-error`), E = r(() => Array.isArray(l.options)), O = r(() => E.value ? l.options : [{
			label: l.label ?? "",
			value: je
		}]), { errorMessage: k } = D({
			value: b(l, "modelValue"),
			type: r(() => "checkbox"),
			required: b(l, "required"),
			validator: b(l, "validator"),
			touched: d,
			isEmpty: (e) => Array.isArray(e) ? e.length === 0 : e !== !0
		}), { rootClasses: A } = T({
			block: "ui-checkbox-group",
			labelPosition: b(l, "labelPosition"),
			errorPosition: b(l, "errorPosition"),
			invalid: r(() => !!k.value),
			disabled: b(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), j = (e) => l.disabled || !!e.disabled, M = (e) => E.value ? (Array.isArray(l.modelValue) ? l.modelValue : []).includes(e.value) : l.modelValue === !0, N = (e) => {
			if (j(e)) return;
			if (d.value = !0, !E.value) {
				u("update:modelValue", !M(e));
				return;
			}
			let t = Array.isArray(l.modelValue) ? l.modelValue : [], n = M(e) ? t.filter((t) => t !== e.value) : [...t, e.value];
			u("update:modelValue", n);
		}, P = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !k.value) }), (n, r) => (h(), o("div", { class: f(["ui-checkbox-group", x(A)]) }, [E.value && t.label ? (h(), o("span", Z, [v(n.$slots, "label", {}, () => [c(y(t.label), 1), t.required ? (h(), o("span", Q, "*")) : a("", !0)])])) : a("", !0), s("div", $, [s("div", {
			class: f(["ui-checkbox-group__options", [`ui-checkbox-group__options--${t.variant}`, { "ui-checkbox-group__options--horizontal": t.direction === "horizontal" }]]),
			role: E.value ? "group" : void 0,
			"aria-label": E.value ? t.label : void 0,
			"aria-required": t.required,
			"aria-describedby": x(k) ? w.value : void 0
		}, [(h(!0), o(e, null, _(O.value, (i, l) => (h(), o("label", {
			key: E.value ? i.value : "single",
			class: f(["ui-checkbox-group__option", {
				"ui-checkbox-group__option--disabled": j(i),
				"ui-checkbox-group__option--selected": M(i)
			}])
		}, [
			s("input", {
				type: "checkbox",
				class: "ui-checkbox-group__input",
				name: C.value,
				value: i.value,
				checked: M(i),
				disabled: j(i),
				onChange: (e) => N(i),
				onBlur: P
			}, null, 40, we),
			r[0] ||= s("span", {
				class: "ui-checkbox-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", Te, [v(n.$slots, "option", {
				option: i,
				index: l
			}, () => [
				i.icon ? (h(), o("span", Ee, [x(U)(i.icon) ? (h(), o("img", {
					key: 0,
					class: "ui-checkbox-group__option-icon-img",
					src: i.icon.src,
					alt: i.icon.alt ?? ""
				}, null, 8, De)) : (h(), o(e, { key: 1 }, [c(y(i.icon), 1)], 64))])) : a("", !0),
				c(" " + y(i.label), 1),
				!E.value && t.required ? (h(), o("span", Oe, "*")) : a("", !0)
			])])
		], 2))), 128)), E.value && O.value.length === 0 ? (h(), o("p", ke, [v(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, Ce), x(k) ? (h(), o("p", {
			key: 0,
			id: w.value,
			class: "ui-checkbox-group__error",
			role: "alert"
		}, [v(n.$slots, "error", { message: x(k) }, () => [c(y(x(k)), 1)])], 8, Ae)) : a("", !0)])], 2));
	}
}), Ne = {
	UiInput: B,
	UiSelect: H,
	UiRadio: X,
	UiCheckbox: Me
}, Pe = { install(e) {
	Object.entries(Ne).forEach(([t, n]) => {
		e.component(t, n);
	});
} };
//#endregion
export { Me as UiCheckbox, B as UiInput, X as UiRadio, H as UiSelect, Ne as allComponents, Pe as default };
