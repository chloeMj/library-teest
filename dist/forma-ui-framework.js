import { Fragment as e, Teleport as t, Transition as n, computed as r, createBlock as i, createCommentVNode as a, createElementBlock as o, createElementVNode as s, createTextVNode as c, createVNode as l, defineComponent as u, mergeProps as d, nextTick as f, normalizeClass as p, normalizeStyle as m, onBeforeUnmount as h, onMounted as g, onUnmounted as _, openBlock as v, ref as y, renderList as b, renderSlot as x, resolveComponent as S, resolveDynamicComponent as C, toDisplayString as w, toRef as T, unref as E, useId as D, useSlots as O, watch as k, withCtx as A, withModifiers as j } from "vue";
//#region src/composables/useFieldClasses.ts
function M(e) {
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
var N = (e) => e == null || e === "";
function P(e) {
	let { value: t, type: n, required: i, max: a, min: o, validator: s, touched: c } = e, l = e.isEmpty ?? N;
	return { errorMessage: r(() => {
		if (!c.value) return null;
		if (i?.value && l(t.value)) return "필수 입력값입니다.";
		if (a?.value != null && !l(t.value)) {
			if (n.value === "number") {
				if (Number(t.value) > a.value) return `${a.value} 이하로 입력해주세요.`;
			} else if (String(t.value).length > a.value) return `최대 ${a.value}자까지 입력 가능합니다.`;
		}
		if (o?.value != null && !l(t.value) && n.value === "number" && Number(t.value) < o.value) return `${o.value} 이상으로 입력해주세요.`;
		if (s?.value) {
			let e = s.value(t.value);
			if (typeof e == "string") return e;
			if (e === !1) return "입력값을 확인해주세요.";
		}
		return null;
	}) };
}
//#endregion
//#region src/composables/useFloatingLabel.ts
function ee(e) {
	let t = y(!1), n = r(() => e.value !== null && e.value !== void 0 && e.value !== "");
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
var F = ["for"], I = {
	key: 0,
	class: "fm-input__required-mark"
}, L = { class: "fm-input__body" }, R = {
	key: 0,
	class: "fm-input__affix fm-input__affix--prefix"
}, te = ["for"], z = {
	key: 0,
	class: "fm-input__required-mark"
}, B = [
	"id",
	"type",
	"value",
	"placeholder",
	"disabled",
	"readonly",
	"name",
	"min",
	"max",
	"step",
	"aria-invalid",
	"aria-describedby"
], V = {
	key: 2,
	class: "fm-input__affix fm-input__affix--suffix"
}, ne = {
	key: 3,
	class: "fm-input__stepper",
	"aria-hidden": "true"
}, H = ["disabled"], U = ["disabled"], W = ["id"], G = /* @__PURE__ */ u({
	__name: "Input",
	props: {
		modelValue: { default: "" },
		type: { default: "text" },
		variant: { default: "outlined" },
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
		let i = e, l = n, u = y(null), d = y(!1), f = D(), m = r(() => i.id ?? f), h = r(() => `${m.value}-error`), g = T(i, "modelValue"), _ = ee(g), { errorMessage: b } = P({
			value: g,
			type: T(i, "type"),
			required: T(i, "required"),
			max: T(i, "max"),
			min: T(i, "min"),
			validator: T(i, "validator"),
			touched: d
		}), S = r(() => i.modelValue ?? ""), { rootClasses: C, controlClasses: O } = M({
			block: "fm-input",
			labelPosition: T(i, "labelPosition"),
			errorPosition: T(i, "errorPosition"),
			invalid: r(() => !!b.value),
			disabled: T(i, "disabled"),
			focused: _.isFocused,
			floated: _.isFloated
		}), k = (e) => {
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
		}, A = (e) => {
			_.onFocus(), l("focus", e);
		}, j = (e) => {
			_.onBlur(), d.value = !0, l("blur", e);
		}, N = (e) => {
			if (i.disabled || i.readonly) return;
			let t = typeof i.modelValue == "number" ? i.modelValue : Number(i.modelValue) || 0, n = (String(i.step).split(".")[1] ?? "").length, r = Number((t + e * i.step).toFixed(n));
			i.max != null && (r = Math.min(r, i.max)), i.min != null && (r = Math.max(r, i.min)), l("update:modelValue", r);
		};
		return t({
			focus: () => u.value?.focus(),
			validate: () => (d.value = !0, !b.value)
		}), (t, n) => (v(), o("div", { class: p(["fm-input", [E(C), `fm-input--${e.variant}`]]) }, [e.label && e.labelPosition !== "inside" ? (v(), o("label", {
			key: 0,
			class: "fm-input__label",
			for: m.value
		}, [x(t.$slots, "label", {}, () => [c(w(e.label) + " ", 1), e.required ? (v(), o("span", I, "*")) : a("", !0)])], 8, F)) : a("", !0), s("div", L, [s("div", { class: p(["fm-input__control", E(O)]) }, [
			t.$slots.prefix ? (v(), o("span", R, [x(t.$slots, "prefix")])) : a("", !0),
			e.label && e.labelPosition === "inside" ? (v(), o("label", {
				key: 1,
				class: "fm-input__label fm-input__label--inside",
				for: m.value
			}, [x(t.$slots, "label", {}, () => [c(w(e.label) + " ", 1), e.required ? (v(), o("span", z, "*")) : a("", !0)])], 8, te)) : a("", !0),
			s("input", {
				id: m.value,
				ref_key: "inputRef",
				ref: u,
				class: "fm-input__field",
				type: e.type,
				value: S.value,
				placeholder: e.labelPosition === "inside" ? void 0 : e.placeholder,
				disabled: e.disabled,
				readonly: e.readonly,
				name: e.name,
				min: e.type === "number" ? e.min : void 0,
				max: e.type === "number" ? e.max : void 0,
				step: e.type === "number" ? e.step : void 0,
				"aria-invalid": !!E(b),
				"aria-describedby": E(b) ? h.value : void 0,
				onInput: k,
				onFocus: A,
				onBlur: j
			}, null, 40, B),
			t.$slots.suffix ? (v(), o("span", V, [x(t.$slots, "suffix")])) : a("", !0),
			e.type === "number" && e.showStepper ? (v(), o("span", ne, [s("button", {
				type: "button",
				class: "fm-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[0] ||= (e) => N(-1)
			}, " − ", 8, H), s("button", {
				type: "button",
				class: "fm-input__stepper-btn",
				tabindex: "-1",
				disabled: e.disabled || e.readonly,
				onClick: n[1] ||= (e) => N(1)
			}, " + ", 8, U)])) : a("", !0)
		], 2), E(b) ? (v(), o("p", {
			key: 0,
			id: h.value,
			class: "fm-input__error",
			role: "alert"
		}, [x(t.$slots, "error", { message: E(b) }, () => [c(w(E(b)), 1)])], 8, W)) : a("", !0)])], 2));
	}
});
//#endregion
//#region src/composables/useIsMobile.ts
function re(e = 640) {
	let t = y(!1), n = null, r = () => {
		t.value = n?.matches ?? !1;
	};
	return g(() => {
		typeof window > "u" || (n = window.matchMedia(`(max-width: ${e}px)`), r(), n.addEventListener("change", r));
	}), _(() => {
		n?.removeEventListener("change", r);
	}), t;
}
//#endregion
//#region src/components/form/Select.vue?vue&type=script&setup=true&lang.ts
var ie = ["for"], ae = {
	key: 0,
	class: "fm-select__required-mark"
}, oe = { class: "fm-select__body" }, se = ["for"], ce = {
	key: 0,
	class: "fm-select__required-mark"
}, le = [
	"id",
	"disabled",
	"aria-expanded",
	"aria-controls",
	"aria-describedby"
], ue = {
	key: 0,
	class: "fm-select__affix"
}, de = {
	key: 2,
	class: "fm-select__trigger fm-select__trigger--searchable"
}, fe = {
	key: 0,
	class: "fm-select__affix"
}, pe = [
	"id",
	"value",
	"placeholder",
	"disabled",
	"readonly",
	"aria-expanded",
	"aria-controls",
	"aria-activedescendant",
	"aria-describedby"
], me = ["id"], he = [
	"id",
	"aria-selected",
	"onMousedown",
	"onMouseenter"
], ge = {
	key: 0,
	class: "fm-select__empty"
}, _e = ["id"], ve = { class: "fm-select__sheet-header" }, ye = { class: "fm-select__sheet-title" }, be = ["value"], xe = { class: "fm-select__sheet-list" }, Se = ["aria-selected", "onClick"], Ce = {
	key: 0,
	class: "fm-select__sheet-empty"
}, we = 4, Te = 240, Ee = 120, De = /* @__PURE__ */ u({
	__name: "Select",
	props: {
		modelValue: { default: null },
		options: { default: () => [] },
		variant: { default: "outlined" },
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
		readonly: {
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
	setup(u, { expose: d, emit: g }) {
		let _ = u, S = g, C = y(null), O = y(null), N = y(!1), F = y(!1), I = y(-1), L = y(""), R = re(_.mobileBreakpoint), te = D(), z = r(() => _.id ?? te), B = r(() => `${z.value}-error`), V = r(() => `${z.value}-listbox`), ne = T(_, "modelValue"), H = ee(ne), { errorMessage: U } = P({
			value: ne,
			type: r(() => "select"),
			required: T(_, "required"),
			validator: T(_, "validator"),
			touched: N
		}), W = r(() => _.options.find((e) => e.value === _.modelValue) ?? null), G = r(() => {
			if (!_.searchable || !L.value.trim()) return _.options;
			let e = L.value.trim().toLowerCase();
			if (_.filterOption) return _.options.filter((t) => _.filterOption(t, e));
			let t = _.filterKeys.length > 0 ? _.filterKeys : ["label", "value"];
			return _.options.filter((n) => t.some((t) => String(n[t] ?? "").toLowerCase().includes(e)));
		}), De = r(() => F.value ? L.value : W.value?.label ?? ""), { rootClasses: Oe, controlClasses: ke } = M({
			block: "fm-select",
			labelPosition: T(_, "labelPosition"),
			errorPosition: T(_, "errorPosition"),
			invalid: r(() => !!U.value),
			disabled: T(_, "disabled"),
			focused: H.isFocused,
			floated: H.isFloated
		}), Ae = y(null), je = y({}), K = () => {
			let e = Ae.value?.querySelector(".fm-select__trigger");
			if (!e) return;
			let t = e.getBoundingClientRect(), n = window.innerHeight - t.bottom - 8, r = t.top - 8, i = n < Te && r > n, a = i ? r : n;
			je.value = {
				left: `${t.left}px`,
				width: `${t.width}px`,
				maxHeight: `${Math.max(Ee, Math.min(Te, a))}px`,
				...i ? { bottom: `${window.innerHeight - t.top + we}px` } : { top: `${t.bottom + we}px` }
			};
		}, Me = () => {
			window.removeEventListener("scroll", K, !0), window.removeEventListener("resize", K);
		}, Ne = r(() => F.value && !R.value);
		k(Ne, (e) => {
			e ? (K(), window.addEventListener("scroll", K, !0), window.addEventListener("resize", K)) : Me();
		}), h(Me);
		let q = r(() => _.disabled || _.readonly), Pe = r(() => ({
			...ke.value,
			"fm-select__control--open": F.value
		})), J = () => {
			if (q.value || F.value) return;
			F.value = !0, _.searchable && (L.value = "");
			let e = G.value, t = e.findIndex((e) => e.value === _.modelValue);
			I.value = t >= 0 ? t : e.length > 0 ? 0 : -1, _.searchable && f(() => {
				R.value ? O.value?.focus() : C.value?.focus();
			});
		}, Y = () => {
			F.value = !1, I.value = -1, N.value = !0, _.searchable && (L.value = "");
		}, X = () => {
			q.value || (F.value ? Y() : J());
		}, Z = (e) => {
			q.value || (S("update:modelValue", e.value), Y(), C.value?.focus());
		}, Q = (e) => {
			let t = e.target;
			L.value = t.value, F.value = !0, I.value = G.value.length > 0 ? 0 : -1;
		}, Fe = (e) => {
			H.onFocus(), _.searchable && J(), S("focus", e);
		}, Ie = (e) => {
			H.onBlur(), R.value ? N.value = !0 : Y(), S("blur", e);
		}, $ = (e) => {
			if (q.value) return;
			let t = G.value;
			switch (e.key) {
				case "ArrowDown":
					if (e.preventDefault(), !F.value) {
						J();
						return;
					}
					I.value = Math.min(I.value + 1, t.length - 1);
					break;
				case "ArrowUp":
					if (e.preventDefault(), !F.value) {
						J();
						return;
					}
					I.value = Math.max(I.value - 1, 0);
					break;
				case "Enter":
					e.preventDefault(), F.value && I.value >= 0 && t[I.value] ? Z(t[I.value]) : _.searchable || X();
					break;
				case " ":
					_.searchable || (e.preventDefault(), F.value && I.value >= 0 && t[I.value] ? Z(t[I.value]) : X());
					break;
				case "Escape": Y(), C.value?.focus();
			}
		};
		return d({
			focus: () => C.value?.focus(),
			validate: () => (N.value = !0, !U.value)
		}), (r, d) => (v(), o("div", { class: p(["fm-select", [
			E(Oe),
			`fm-select--${u.variant}`,
			{ "fm-select--readonly": u.readonly }
		]]) }, [
			u.label && u.labelPosition !== "inside" ? (v(), o("label", {
				key: 0,
				class: "fm-select__label",
				for: z.value
			}, [x(r.$slots, "label", {}, () => [c(w(u.label) + " ", 1), u.required ? (v(), o("span", ae, "*")) : a("", !0)])], 8, ie)) : a("", !0),
			s("div", oe, [s("div", {
				ref_key: "controlRef",
				ref: Ae,
				class: p(["fm-select__control", Pe.value])
			}, [
				u.label && u.labelPosition === "inside" ? (v(), o("label", {
					key: 0,
					class: "fm-select__label fm-select__label--inside",
					for: z.value
				}, [x(r.$slots, "label", {}, () => [c(w(u.label) + " ", 1), u.required ? (v(), o("span", ce, "*")) : a("", !0)])], 8, se)) : a("", !0),
				u.searchable ? (v(), o("div", de, [
					r.$slots.prefix ? (v(), o("span", fe, [x(r.$slots, "prefix")])) : a("", !0),
					s("input", {
						id: z.value,
						ref_key: "triggerRef",
						ref: C,
						type: "text",
						class: "fm-select__search-input",
						role: "combobox",
						"aria-autocomplete": "list",
						value: De.value,
						placeholder: u.labelPosition === "inside" ? void 0 : u.placeholder,
						disabled: u.disabled,
						readonly: u.readonly,
						"aria-expanded": F.value,
						"aria-haspopup": "listbox",
						"aria-controls": V.value,
						"aria-activedescendant": I.value >= 0 ? `${z.value}-option-${I.value}` : void 0,
						"aria-describedby": E(U) ? B.value : void 0,
						autocomplete: "off",
						onInput: Q,
						onKeydown: $,
						onFocus: Fe,
						onBlur: Ie
					}, null, 40, pe),
					d[2] ||= s("span", {
						class: "fm-select__arrow",
						"aria-hidden": "true"
					}, "▾", -1)
				])) : (v(), o("button", {
					key: 1,
					id: z.value,
					ref_key: "triggerRef",
					ref: C,
					type: "button",
					class: "fm-select__trigger",
					disabled: u.disabled,
					"aria-expanded": F.value,
					"aria-haspopup": "listbox",
					"aria-controls": V.value,
					"aria-describedby": E(U) ? B.value : void 0,
					onClick: X,
					onKeydown: $,
					onFocus: Fe,
					onBlur: Ie
				}, [
					r.$slots.prefix ? (v(), o("span", ue, [x(r.$slots, "prefix")])) : a("", !0),
					s("span", { class: p(["fm-select__value", { "fm-select__value--placeholder": !W.value }]) }, w(W.value ? W.value.label : u.labelPosition === "inside" ? "" : u.placeholder), 3),
					d[1] ||= s("span", {
						class: "fm-select__arrow",
						"aria-hidden": "true"
					}, "▾", -1)
				], 40, le)),
				(v(), i(t, { to: "body" }, [Ne.value ? (v(), o("ul", {
					key: 0,
					id: V.value,
					class: "fm-select__menu",
					style: m(je.value),
					role: "listbox"
				}, [(v(!0), o(e, null, b(G.value, (e, t) => (v(), o("li", {
					id: `${z.value}-option-${t}`,
					key: e.value,
					role: "option",
					"aria-selected": e.value === u.modelValue,
					class: p(["fm-select__option", {
						"fm-select__option--selected": e.value === u.modelValue,
						"fm-select__option--active": t === I.value
					}]),
					onMousedown: j((t) => Z(e), ["prevent"]),
					onMouseenter: (e) => I.value = t
				}, [x(r.$slots, "option", { option: e }, () => [c(w(e.label), 1)])], 42, he))), 128)), G.value.length === 0 ? (v(), o("li", ge, [x(r.$slots, "empty", {}, () => [c(w(u.searchable && L.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)], 12, me)) : a("", !0)]))
			], 2), E(U) ? (v(), o("p", {
				key: 0,
				id: B.value,
				class: "fm-select__error",
				role: "alert"
			}, [x(r.$slots, "error", { message: E(U) }, () => [c(w(E(U)), 1)])], 8, _e)) : a("", !0)]),
			(v(), i(t, { to: "body" }, [l(n, { name: "fm-select-sheet" }, {
				default: A(() => [F.value && E(R) ? (v(), o("div", {
					key: 0,
					class: "fm-select__sheet-backdrop",
					onClick: Y
				}, [s("div", {
					class: "fm-select__sheet",
					role: "listbox",
					onClick: d[0] ||= j(() => {}, ["stop"])
				}, [
					s("div", ve, [s("span", ye, w(u.label || u.placeholder), 1), s("button", {
						type: "button",
						class: "fm-select__sheet-close",
						"aria-label": "닫기",
						onClick: Y
					}, " ✕ ")]),
					u.searchable ? (v(), o("input", {
						key: 0,
						ref_key: "sheetSearchRef",
						ref: O,
						type: "text",
						class: "fm-select__sheet-search",
						placeholder: "검색",
						value: L.value,
						onInput: Q,
						onKeydown: $
					}, null, 40, be)) : a("", !0),
					s("ul", xe, [(v(!0), o(e, null, b(G.value, (e, t) => (v(), o("li", {
						key: e.value,
						role: "option",
						"aria-selected": e.value === u.modelValue,
						class: p(["fm-select__sheet-option", {
							"fm-select__sheet-option--selected": e.value === u.modelValue,
							"fm-select__sheet-option--active": t === I.value
						}]),
						onClick: (t) => Z(e)
					}, [x(r.$slots, "option", { option: e }, () => [c(w(e.label), 1)])], 10, Se))), 128)), G.value.length === 0 ? (v(), o("li", Ce, [x(r.$slots, "empty", {}, () => [c(w(u.searchable && L.value ? "검색 결과가 없습니다." : "표시할 항목이 없습니다."), 1)])])) : a("", !0)])
				])])) : a("", !0)]),
				_: 3
			})]))
		], 2));
	}
}), Oe = (e) => typeof e == "object", ke = {
	key: 0,
	class: "fm-radio-group__label"
}, Ae = {
	key: 0,
	class: "fm-radio-group__required-mark"
}, je = { class: "fm-radio-group__body" }, K = [
	"aria-label",
	"aria-required",
	"aria-describedby"
], Me = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], Ne = { class: "fm-radio-group__option-label" }, q = {
	key: 0,
	class: "fm-radio-group__option-icon",
	"aria-hidden": "true"
}, Pe = ["src", "alt"], J = {
	key: 0,
	class: "fm-radio-group__empty"
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
		let l = t, u = i, d = y(!1), f = D(), m = r(() => l.id ?? f), h = r(() => l.name ?? m.value), g = r(() => `${m.value}-error`), { errorMessage: _ } = P({
			value: T(l, "modelValue"),
			type: r(() => "radio"),
			required: T(l, "required"),
			validator: T(l, "validator"),
			touched: d
		}), { rootClasses: S } = M({
			block: "fm-radio-group",
			labelPosition: T(l, "labelPosition"),
			errorPosition: T(l, "errorPosition"),
			invalid: r(() => !!_.value),
			disabled: T(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), C = (e) => l.disabled || !!e.disabled, O = (e) => {
			C(e) || (d.value = !0, u("update:modelValue", e.value));
		}, k = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !_.value) }), (n, r) => (v(), o("div", { class: p(["fm-radio-group", E(S)]) }, [t.label ? (v(), o("span", ke, [x(n.$slots, "label", {}, () => [c(w(t.label), 1), t.required ? (v(), o("span", Ae, "*")) : a("", !0)])])) : a("", !0), s("div", je, [s("div", {
			class: p(["fm-radio-group__options", [`fm-radio-group__options--${t.variant}`, { "fm-radio-group__options--horizontal": t.direction === "horizontal" }]]),
			role: "radiogroup",
			"aria-label": t.label,
			"aria-required": t.required,
			"aria-describedby": E(_) ? g.value : void 0
		}, [(v(!0), o(e, null, b(t.options, (i) => (v(), o("label", {
			key: i.value,
			class: p(["fm-radio-group__option", {
				"fm-radio-group__option--disabled": C(i),
				"fm-radio-group__option--selected": i.value === t.modelValue
			}])
		}, [
			s("input", {
				type: "radio",
				class: "fm-radio-group__input",
				name: h.value,
				value: i.value,
				checked: i.value === t.modelValue,
				disabled: C(i),
				onChange: (e) => O(i),
				onBlur: k
			}, null, 40, Me),
			r[0] ||= s("span", {
				class: "fm-radio-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", Ne, [x(n.$slots, "option", { option: i }, () => [i.icon ? (v(), o("span", q, [E(Oe)(i.icon) ? (v(), o("img", {
				key: 0,
				class: "fm-radio-group__option-icon-img",
				src: i.icon.src,
				alt: i.icon.alt ?? ""
			}, null, 8, Pe)) : (v(), o(e, { key: 1 }, [c(w(i.icon), 1)], 64))])) : a("", !0), c(" " + w(i.label), 1)])])
		], 2))), 128)), t.options.length === 0 ? (v(), o("p", J, [x(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, K), E(_) ? (v(), o("p", {
			key: 0,
			id: g.value,
			class: "fm-radio-group__error",
			role: "alert"
		}, [x(n.$slots, "error", { message: E(_) }, () => [c(w(E(_)), 1)])], 8, Y)) : a("", !0)])], 2));
	}
}), Z = {
	key: 0,
	class: "fm-checkbox-group__label"
}, Q = {
	key: 0,
	class: "fm-checkbox-group__required-mark"
}, Fe = { class: "fm-checkbox-group__body" }, Ie = [
	"role",
	"aria-label",
	"aria-required",
	"aria-describedby"
], $ = [
	"name",
	"value",
	"checked",
	"disabled",
	"onChange"
], Le = { class: "fm-checkbox-group__option-label" }, Re = {
	key: 0,
	class: "fm-checkbox-group__option-icon",
	"aria-hidden": "true"
}, ze = ["src", "alt"], Be = {
	key: 1,
	class: "fm-checkbox-group__required-mark"
}, Ve = {
	key: 0,
	class: "fm-checkbox-group__empty"
}, He = ["id"], Ue = "single", We = /* @__PURE__ */ u({
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
		let l = t, u = i, d = y(!1), f = D(), m = r(() => l.id ?? f), h = r(() => l.name ?? m.value), g = r(() => `${m.value}-error`), _ = r(() => Array.isArray(l.options)), S = r(() => _.value ? l.options : [{
			label: l.label ?? "",
			value: Ue
		}]), { errorMessage: C } = P({
			value: T(l, "modelValue"),
			type: r(() => "checkbox"),
			required: T(l, "required"),
			validator: T(l, "validator"),
			touched: d,
			isEmpty: (e) => Array.isArray(e) ? e.length === 0 : e !== !0
		}), { rootClasses: O } = M({
			block: "fm-checkbox-group",
			labelPosition: T(l, "labelPosition"),
			errorPosition: T(l, "errorPosition"),
			invalid: r(() => !!C.value),
			disabled: T(l, "disabled"),
			focused: r(() => !1),
			floated: r(() => !1)
		}), k = (e) => l.disabled || !!e.disabled, A = (e) => _.value ? (Array.isArray(l.modelValue) ? l.modelValue : []).includes(e.value) : l.modelValue === !0, j = (e) => {
			if (k(e)) return;
			if (d.value = !0, !_.value) {
				u("update:modelValue", !A(e));
				return;
			}
			let t = Array.isArray(l.modelValue) ? l.modelValue : [], n = A(e) ? t.filter((t) => t !== e.value) : [...t, e.value];
			u("update:modelValue", n);
		}, N = (e) => {
			d.value = !0, u("blur", e);
		};
		return n({ validate: () => (d.value = !0, !C.value) }), (n, r) => (v(), o("div", { class: p(["fm-checkbox-group", E(O)]) }, [_.value && t.label ? (v(), o("span", Z, [x(n.$slots, "label", {}, () => [c(w(t.label) + " ", 1), t.required ? (v(), o("span", Q, "*")) : a("", !0)])])) : a("", !0), s("div", Fe, [s("div", {
			class: p(["fm-checkbox-group__options", [`fm-checkbox-group__options--${t.variant}`, { "fm-checkbox-group__options--horizontal": t.direction === "horizontal" }]]),
			role: _.value ? "group" : void 0,
			"aria-label": _.value ? t.label : void 0,
			"aria-required": t.required,
			"aria-describedby": E(C) ? g.value : void 0
		}, [(v(!0), o(e, null, b(S.value, (i, l) => (v(), o("label", {
			key: _.value ? i.value : "single",
			class: p(["fm-checkbox-group__option", {
				"fm-checkbox-group__option--disabled": k(i),
				"fm-checkbox-group__option--selected": A(i)
			}])
		}, [
			s("input", {
				type: "checkbox",
				class: "fm-checkbox-group__input",
				name: h.value,
				value: i.value,
				checked: A(i),
				disabled: k(i),
				onChange: (e) => j(i),
				onBlur: N
			}, null, 40, $),
			r[0] ||= s("span", {
				class: "fm-checkbox-group__control",
				"aria-hidden": "true"
			}, null, -1),
			s("span", Le, [x(n.$slots, "option", {
				option: i,
				index: l
			}, () => [
				i.icon ? (v(), o("span", Re, [E(Oe)(i.icon) ? (v(), o("img", {
					key: 0,
					class: "fm-checkbox-group__option-icon-img",
					src: i.icon.src,
					alt: i.icon.alt ?? ""
				}, null, 8, ze)) : (v(), o(e, { key: 1 }, [c(w(i.icon), 1)], 64))])) : a("", !0),
				c(" " + w(i.label) + " ", 1),
				!_.value && t.required ? (v(), o("span", Be, " * ")) : a("", !0)
			])])
		], 2))), 128)), _.value && S.value.length === 0 ? (v(), o("p", Ve, [x(n.$slots, "empty", {}, () => [r[1] ||= c("표시할 항목이 없습니다.", -1)])])) : a("", !0)], 10, Ie), E(C) ? (v(), o("p", {
			key: 0,
			id: g.value,
			class: "fm-checkbox-group__error",
			role: "alert"
		}, [x(n.$slots, "error", { message: E(C) }, () => [c(w(E(C)), 1)])], 8, He)) : a("", !0)])], 2));
	}
});
//#endregion
//#region src/utils/color.ts
function Ge(e) {
	let t = e.trim(), n = t.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
	if (n) {
		let e = n[1];
		return e.length <= 4 && (e = [...e].map((e) => e + e).join("")), [
			0,
			2,
			4
		].map((t) => parseInt(e.slice(t, t + 2), 16));
	}
	let r = t.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
	return r ? [
		Number(r[1]),
		Number(r[2]),
		Number(r[3])
	] : null;
}
function Ke([e, t, n]) {
	let r = (e) => {
		let t = e / 255;
		return t <= .03928 ? t / 12.92 : ((t + .055) / 1.055) ** 2.4;
	};
	return .2126 * r(e) + .7152 * r(t) + .0722 * r(n);
}
function qe(e, t) {
	let [n, r] = [Ke(e), Ke(t)].sort((e, t) => t - e);
	return (n + .05) / (r + .05);
}
var Je = [
	255,
	255,
	255
], Ye = [
	26,
	29,
	35
];
function Xe(e) {
	let t = Ge(e);
	return t ? qe(Je, t) >= qe(Ye, t) ? "#ffffff" : "#1a1d23" : null;
}
//#endregion
//#region src/components/button/Button.vue?vue&type=script&setup=true&lang.ts
var Ze = {
	key: 0,
	class: "fm-button__spinner",
	"aria-hidden": "true"
}, Qe = {
	key: 1,
	class: "fm-button__affix"
}, $e = {
	key: 2,
	class: "fm-button__label"
}, et = {
	key: 3,
	class: "fm-button__affix"
}, tt = /* @__PURE__ */ u({
	__name: "Button",
	props: {
		variant: { default: "filled" },
		color: { default: "primary" },
		size: { default: "md" },
		type: { default: "button" },
		href: {},
		target: {},
		to: {},
		disabled: {
			type: Boolean,
			default: !1
		},
		loading: {
			type: Boolean,
			default: !1
		},
		block: {
			type: Boolean,
			default: !1
		},
		icon: {
			type: Boolean,
			default: !1
		}
	},
	emits: ["click"],
	setup(e, { emit: t }) {
		let n = [
			"primary",
			"secondary",
			"danger"
		], s = e, c = t, l = O(), u = r(() => s.disabled || s.loading), f = r(() => n.includes(s.color)), p = r(() => {
			if (f.value) return;
			let e = Xe(s.color);
			return {
				"--fm-button-color": s.color,
				...e ? { "--fm-button-on": e } : {}
			};
		}), m = r(() => s.to !== void 0 && !u.value ? S("RouterLink") : s.to !== void 0 || s.href !== void 0 ? "a" : "button"), h = r(() => m.value === "button" ? {
			type: s.type,
			disabled: u.value
		} : u.value ? {
			"aria-disabled": "true",
			tabindex: -1
		} : s.to === void 0 ? {
			href: s.href,
			target: s.target,
			rel: s.target === "_blank" ? "noopener noreferrer" : void 0
		} : { to: s.to }), g = (e) => {
			if (u.value) {
				e.preventDefault();
				return;
			}
			c("click", e);
		};
		return (t, n) => (v(), i(C(m.value), d({
			class: ["fm-button", [
				`fm-button--${e.variant}`,
				f.value ? `fm-button--${e.color}` : "fm-button--custom",
				`fm-button--${e.size}`,
				{
					"fm-button--block": e.block,
					"fm-button--icon": e.icon,
					"fm-button--loading": e.loading,
					"fm-button--disabled": e.disabled
				}
			]],
			style: p.value
		}, h.value, {
			"aria-busy": e.loading || void 0,
			onClick: g
		}), {
			default: A(() => [
				e.loading ? (v(), o("span", Ze)) : E(l).prefix ? (v(), o("span", Qe, [x(t.$slots, "prefix")])) : a("", !0),
				e.icon && e.loading ? a("", !0) : (v(), o("span", $e, [x(t.$slots, "default")])),
				E(l).suffix ? (v(), o("span", et, [x(t.$slots, "suffix")])) : a("", !0)
			]),
			_: 3
		}, 16, [
			"class",
			"style",
			"aria-busy"
		]));
	}
}), nt = ["aria-labelledby"], rt = {
	key: 0,
	class: "fm-modal__header"
}, it = ["id"], at = { class: "fm-modal__body" }, ot = {
	key: 1,
	class: "fm-modal__footer"
}, st = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=\"-1\"])", ct = /* @__PURE__ */ u({
	__name: "Modal",
	props: {
		modelValue: {
			type: Boolean,
			default: !1
		},
		title: {},
		size: { default: "md" },
		closeOnBackdrop: {
			type: Boolean,
			default: !0
		},
		closeOnEsc: {
			type: Boolean,
			default: !0
		},
		hideClose: {
			type: Boolean,
			default: !1
		}
	},
	emits: [
		"update:modelValue",
		"open",
		"close"
	],
	setup(e, { emit: r }) {
		let u = e, d = r, m = O(), g = D(), _ = y(null), b = () => d("update:modelValue", !1), S = () => {
			u.closeOnBackdrop && b();
		}, C = null, T = () => Array.from(_.value?.querySelectorAll(st) ?? []), j = (e) => {
			if (e.key === "Escape" && u.closeOnEsc) {
				e.stopPropagation(), b();
				return;
			}
			if (e.key !== "Tab") return;
			let t = T();
			if (t.length === 0) {
				e.preventDefault();
				return;
			}
			let n = t[0], r = t[t.length - 1];
			e.shiftKey && document.activeElement === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n.focus());
		}, M = () => {
			let e = Number(document.body.dataset.fmModalCount ?? 0);
			e === 0 && (document.body.dataset.fmModalOverflow = document.body.style.overflow, document.body.style.overflow = "hidden"), document.body.dataset.fmModalCount = String(e + 1);
		}, N = () => {
			let e = Number(document.body.dataset.fmModalCount ?? 1) - 1;
			e <= 0 ? (document.body.style.overflow = document.body.dataset.fmModalOverflow ?? "", delete document.body.dataset.fmModalCount, delete document.body.dataset.fmModalOverflow) : document.body.dataset.fmModalCount = String(e);
		}, P = !1;
		return k(() => u.modelValue, async (e) => {
			e ? (C = document.activeElement, M(), P = !0, d("open"), await f(), (T().find((e) => !e.classList.contains("fm-modal__close")) ?? _.value)?.focus()) : P && (N(), P = !1, C?.focus(), C = null);
		}, { immediate: !0 }), h(() => {
			P && N();
		}), (r, u) => (v(), i(t, { to: "body" }, [l(n, {
			name: "fm-modal",
			onAfterLeave: u[0] ||= (e) => d("close")
		}, {
			default: A(() => [e.modelValue ? (v(), o("div", {
				key: 0,
				class: "fm-modal",
				onKeydown: j
			}, [s("div", {
				class: "fm-modal__backdrop",
				"aria-hidden": "true",
				onClick: S
			}), s("div", {
				ref_key: "panelRef",
				ref: _,
				class: p(["fm-modal__panel", `fm-modal__panel--${e.size}`]),
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": e.title || E(m).header ? E(g) : void 0,
				tabindex: "-1"
			}, [
				e.title || E(m).header || !e.hideClose ? (v(), o("header", rt, [s("div", {
					id: E(g),
					class: "fm-modal__title"
				}, [x(r.$slots, "header", {}, () => [c(w(e.title), 1)])], 8, it), e.hideClose ? a("", !0) : (v(), i(tt, {
					key: 0,
					class: "fm-modal__close",
					icon: "",
					size: "sm",
					variant: "ghost",
					color: "secondary",
					"aria-label": "닫기",
					onClick: b
				}, {
					default: A(() => [...u[1] ||= [c(" ✕ ", -1)]]),
					_: 1
				}))])) : a("", !0),
				s("div", at, [x(r.$slots, "default")]),
				E(m).footer ? (v(), o("footer", ot, [x(r.$slots, "footer", { close: b })])) : a("", !0)
			], 10, nt)], 32)) : a("", !0)]),
			_: 3
		})]));
	}
}), lt = {
	FmInput: G,
	FmSelect: De,
	FmRadio: X,
	FmCheckbox: We,
	FmButton: tt,
	FmModal: ct
}, ut = { install(e) {
	Object.entries(lt).forEach(([t, n]) => {
		e.component(t, n);
	});
} };
//#endregion
export { tt as FmButton, We as FmCheckbox, G as FmInput, ct as FmModal, X as FmRadio, De as FmSelect, lt as allComponents, ut as default };
