/**
 * Contact forms: Quote / Tour / Support tabs with hash routing, URL pre-fill and demo validation.
 *
 * - #quote, #tour, #support (on load, on hashchange, and on same-page links) open the matching tab;
 *   choosing a tab rewrites the hash with history.replaceState, so the page does not jump.
 * - ?plan=<id>&qty=<n> pre-fills the quote form and shows a "You picked" chip linking back to the plan
 *   picker (URLs come from data-colocation-url / data-gpu-url).
 * - Validation: native constraints read through the Constraint Validation API, messages written
 *   into each field's error line (aria-invalid + aria-describedby), an error summary (role=alert)
 *   and focus on the first invalid field. A valid submit swaps the form for a confirmation.
 *   Prototype: nothing is sent anywhere.
 */
(function () {
	var KEYS = ['quote', 'tour', 'support'];
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var CHECK = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	function pad(n) { return (n < 10 ? '0' : '') + n; }
	function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
	function parseDay(v) {
		var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
		return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
	}
	function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
	/* Scroll an element to the top (its scroll-margin keeps the tabs and header clear). */
	function scrollToEl(el, smooth) {
		var html = document.documentElement, prev = html.style.scrollBehavior;
		if (!smooth) { html.style.scrollBehavior = 'auto'; }
		el.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
		if (!smooth) { html.style.scrollBehavior = prev; }
	}

	function init(root) {
		if (root.dataset.cfInit) { return; }
		root.dataset.cfInit = '1';

		var tablist = root.querySelector('.cf__tabs');
		if (!tablist) { return; }
		var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
		var panels = tabs.map(function (t) { return root.querySelector('#' + t.getAttribute('aria-controls')); });
		var PLANS = [], byId = {};
		try { PLANS = JSON.parse(root.dataset.plans || '[]'); } catch (e) { PLANS = []; }
		PLANS.forEach(function (p) { byId[p.id] = p; });

		/* ---------- tabs ---------- */
		function setTabsH() { root.style.setProperty('--cf-tabs', tablist.offsetHeight + 'px'); }
		setTabsH();
		window.addEventListener('resize', setTabsH, { passive: true });

		function select(i, o) {
			o = o || {};
			tabs.forEach(function (t, j) {
				var on = j === i;
				t.setAttribute('aria-selected', on ? 'true' : 'false');
				t.tabIndex = on ? 0 : -1;
				panels[j].hidden = !on;
			});
			if (o.hash) {
				try { history.replaceState(history.state, '', '#' + panels[i].id); } catch (e) { /* file:// or sandbox */ }
			}
			if (o.focus) { tabs[i].focus({ preventScroll: !!o.scroll }); }
			if (o.scroll) { scrollToEl(panels[i], o.smooth && !reduce); }
		}
		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { select(i, { hash: true }); });
			t.addEventListener('keydown', function (e) {
				var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, n = -1;
				if (d) { n = (i + d + tabs.length) % tabs.length; } else if (e.key === 'Home') { n = 0; } else if (e.key === 'End') { n = tabs.length - 1; }
				if (n > -1) { e.preventDefault(); select(n, { hash: true, focus: true }); }
			});
		});
		function fromHash(hash) { return KEYS.indexOf(String(hash || '').replace(/^#/, '')); }
		window.addEventListener('hashchange', function () {
			var i = fromHash(window.location.hash);
			if (i > -1) { select(i, { focus: true, scroll: true, smooth: true }); }
		});
		// A link to the hash we are already on fires no hashchange: handle same-page links here.
		document.addEventListener('click', function (e) {
			var a = e.target.closest && e.target.closest('a[href*="#"]');
			if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) { return; }
			var i = fromHash(a.hash);
			if (i < 0 || a.origin !== window.location.origin || a.pathname !== window.location.pathname || a.search !== window.location.search) { return; }
			e.preventDefault();
			select(i, { hash: true, focus: true, scroll: true, smooth: true });
		});

		/* ---------- forms ---------- */
		var params;
		try { params = new URLSearchParams(window.location.search); } catch (e) { params = { get: function () { return null; } }; }
		[].forEach.call(root.querySelectorAll('.cf__form'), function (form) { initForm(form); });

		function initForm(form) {
			var kind = form.dataset.kind;
			var panel = form.closest('.cf__panel'), body = panel.querySelector('.cf__body'), done = panel.querySelector('.cf__done');
			var summary = form.querySelector('.cf__errors');
			var items = [];

			[].forEach.call(form.querySelectorAll('.cf__f'), function (box) {
				var err = box.querySelector('.cf__err');
				var group = box.hasAttribute('data-group');
				var controls = [].slice.call(box.querySelectorAll(group ? 'input' : 'input, select, textarea'));
				if (!err || !controls.length) { return; }
				items.push({ box: box, err: err, group: group, controls: controls, el: controls[0], meta: group ? box : controls[0] });
			});

			function message(it) {
				var el = it.el, d = it.meta.dataset;
				if (it.group) {
					return it.controls.some(function (c) { return c.checked; }) ? '' : (d.missing || 'Choose one');
				}
				var v = el.validity, val = String(el.value || '').trim();
				if (v.badInput) { return el.type === 'date' ? 'Enter a full date' : 'Enter a number'; }
				if (v.valueMissing || (el.required && !val)) { return d.missing || 'Fill in this field'; }
				if (v.typeMismatch || v.patternMismatch) { return d.bad || 'Check this field'; }
				if (el.type === 'date') {
					if (v.rangeUnderflow) { return 'Pick today or a later date'; }
					var day = parseDay(el.value);
					if (el.hasAttribute('data-weekday') && day && (day.getDay() === 0 || day.getDay() === 6)) { return 'Tours run Monday to Friday. Pick a weekday.'; }
					return '';
				}
				if (v.stepMismatch) { return el.name === 'kw' ? 'Round to the nearest 0.5 kW' : 'Enter a whole number'; }
				if (v.rangeUnderflow || v.rangeOverflow) { return d.range || ('Enter ' + el.min + ' to ' + el.max); }
				return '';
			}
			function describe(c, id, on) {
				var ids = (c.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
				if (on) { ids.unshift(id); }
				if (ids.length) { c.setAttribute('aria-describedby', ids.join(' ')); } else { c.removeAttribute('aria-describedby'); }
			}
			function setErr(it, msg) {
				it.err.textContent = msg;
				it.err.hidden = !msg;
				it.box.classList.toggle('is-invalid', !!msg);
				it.controls.forEach(function (c) {
					if (msg) { c.setAttribute('aria-invalid', 'true'); } else { c.removeAttribute('aria-invalid'); }
					describe(c, it.err.id, !!msg);
				});
				if (!msg) {
					var li = summary.querySelector('[data-for="' + it.el.id + '"]');
					if (li) { li.parentNode.removeChild(li); }
					if (!summary.querySelector('li')) { summary.innerHTML = ''; }
				}
			}
			function validate(it) { var m = message(it); setErr(it, m); return !m; }

			items.forEach(function (it) {
				var touch = function () {
					it.dirty = true;
					if (it.box.classList.contains('is-invalid')) { validate(it); }
				};
				it.controls.forEach(function (c) {
					c.addEventListener('input', touch);
					c.addEventListener('change', touch);
					c.addEventListener('blur', function () {
						if (!it.dirty && !form.dataset.tried) { return; }
						// Radio group: only judge it once focus has left the whole group.
						setTimeout(function () { if (it.controls.indexOf(document.activeElement) < 0) { validate(it); } }, 0);
					});
				});
			});

			summary.addEventListener('click', function (e) {
				var a = e.target.closest('a');
				if (!a) { return; }
				e.preventDefault();
				var el = form.querySelector('[id="' + a.getAttribute('href').slice(1) + '"]');
				if (el) { el.focus(); }
			});

			/* − / + steppers */
			[].forEach.call(form.querySelectorAll('[data-stepper]'), function (box) {
				var input = box.querySelector('input'), btns = box.querySelectorAll('[data-step]');
				input.cfSync = function () {
					var v = parseInt(input.value, 10);
					btns[0].setAttribute('aria-disabled', !isNaN(v) && v <= +input.min ? 'true' : 'false');
					btns[1].setAttribute('aria-disabled', !isNaN(v) && v >= +input.max ? 'true' : 'false');
				};
				[].forEach.call(btns, function (b) {
					b.addEventListener('click', function () {
						if (b.getAttribute('aria-disabled') === 'true') { return; }
						var v = parseInt(input.value, 10), d = +b.dataset.step;
						input.value = isNaN(v) ? input.min : clamp(v + d, +input.min, +input.max);
						input.dataset.touched = '1';
						input.dispatchEvent(new Event('input', { bubbles: true }));
					});
				});
				input.addEventListener('input', function () { input.dataset.touched = '1'; input.cfSync(); });
				input.cfSync();
			});

			/* quote: plan select drives the quantity field; URL pre-fill; "You picked" chip */
			var sel = form.querySelector('[data-plan]'), qty = form.elements.qty, chip = panel.querySelector('.cf__picked'), chipOn = false;
			function fmtQty(p, n) {
				if (p.id === 'shared') { return n + ' U'; }
				return n + ' ' + (n === 1 ? p.one : p.many);
			}
			function chipText(p, n) {
				if (p.id === 'quarter' || p.id === 'half' || p.id === 'full') { return p.label + (n > 1 ? ' × ' + n : ''); }
				if (p.id === 'unsure') { return p.label; }
				return p.label + ', ' + fmtQty(p, n);
			}
			function changeUrl(p, n) {
				try {
					if (p.id === 'gpu') { return new URL(root.dataset.gpuUrl, window.location.href).href; }
					var u = new URL(root.dataset.colocationUrl, window.location.href);
					if (p.id !== 'unsure') {
						u.searchParams.set('plan', p.id);
						if (p.id === 'shared' || p.id === 'suite') { u.searchParams.set('qty', n); }
					}
					u.hash = 'plans';
					return u.href;
				} catch (e) { return root.dataset.colocationUrl || ''; }
			}
			function updateChip() {
				if (!chip || !chipOn) { return; }
				var p = byId[sel.value], n = parseInt(qty.value, 10) || (p && p.min) || 1;
				chip.hidden = !p;
				if (!p) { return; }
				chip.querySelector('[data-picked]').textContent = chipText(p, n);
				var a = chip.querySelector('[data-picked-link]');
				a.href = changeUrl(p, n);
				a.textContent = p.id === 'unsure' ? 'Compare plans' : 'Change';
				a.setAttribute('aria-label', p.id === 'unsure' ? 'Compare plans' : 'Change plan: ' + chipText(p, n));
			}
			function applyPlan() {
				var p = byId[sel.value];
				var box = qty.closest('.cf__f');
				box.querySelector('[data-qty-label]').textContent = p ? p.qty : 'How many';
				box.querySelector('[data-qty-unit]').textContent = p ? p.unit : '';
				qty.min = p ? p.min : 1;
				qty.max = p ? p.max : 20;
				var v = parseInt(qty.value, 10);
				if (!qty.dataset.touched || isNaN(v)) { qty.value = qty.min; } else { qty.value = clamp(v, +qty.min, +qty.max); }
				qty.dataset.range = p ? 'Enter ' + p.min + ' to ' + p.max + (p.id === 'shared' ? ' U. ' + p.tip : '. Planning more? Tell us in the message.') : '';
				qty.cfSync();
				updateChip();
			}
			if (kind === 'quote' && sel && qty) {
				var want = byId[params.get('plan')];
				if (want) {
					[].forEach.call(sel.options, function (o) { o.defaultSelected = o.value === want.id; });
					var n = parseInt(params.get('qty'), 10);
					qty.defaultValue = isNaN(n) ? want.min : clamp(n, want.min, want.max);
					qty.dataset.touched = '1';
					chipOn = true;
				}
				sel.addEventListener('change', applyPlan);
				qty.addEventListener('input', updateChip);
				applyPlan();
			}

			/* tour: no dates in the past */
			var date = form.querySelector('input[type="date"]');
			if (date) { date.min = isoDay(new Date()); }

			form.addEventListener('submit', function (e) {
				e.preventDefault();
				form.dataset.tried = '1';
				var bad = items.filter(function (it) { return !validate(it); });
				if (bad.length) {
					summary.innerHTML = '<p><b>' + (bad.length === 1 ? 'One field needs a fix' : bad.length + ' fields need a fix') + '</b></p><ul>' +
						bad.map(function (it) {
							return '<li data-for="' + esc(it.el.id) + '"><a href="#' + esc(it.el.id) + '">' + esc(it.meta.dataset.short || '') + ': ' + esc(it.err.textContent) + '</a></li>';
						}).join('') + '</ul>';
					bad[0].el.focus();
					return;
				}
				summary.innerHTML = '';
				showDone();
			});

			function val(name) {
				var el = form.elements[name];
				return el ? String(el.value || '').trim() : '';
			}
			function showDone() {
				var name = val('name'), first = name.split(/\s+/)[0], email = val('email'), rows, steps, other;
				if (kind === 'quote') {
					var p = byId[val('plan')], n = parseInt(val('qty'), 10) || 1;
					rows = [
						['Plan', p ? (p.id === 'unsure' ? 'Not sure yet, about ' + fmtQty(p, n) : p.label + ', ' + fmtQty(p, n)) : ''],
						['Power per rack', val('kw') ? val('kw') + ' kW' : ''],
						['Move-in', val('timeline')],
						['Contact', name + (val('company') ? ', ' + val('company') : '')],
						['Phone', val('phone')],
						['Message', val('message')]
					];
					steps = [
						['Today', 'Sales reads your request and checks space and power in TOR1 and TOR2.'],
						['Within 1 business day', 'Your written quote arrives by email, priced to your power and network.'],
						['When you are ready', 'Tour the floor and sign. Cross connects go in within 1 to 2 business days.']
					];
					other = ['#tour', 'Book a tour'];
				} else {
					var day = parseDay(val('date')), people = parseInt(val('visitors'), 10) || 1;
					rows = [
						['Date', day ? day.toLocaleDateString('en-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''],
						['Time', val('time')],
						['Visitors', people + (people === 1 ? ' person' : ' people')],
						['Contact', name + (val('company') ? ', ' + val('company') : '')],
						['Note', val('note')]
					];
					steps = [
						['<mark class="verify">Within 1 business day</mark>', 'We confirm your date and time by email.'],
						['On the day', 'Check in at 151 Front Street West, Suite 341. <mark class="verify">Bring photo ID for every visitor.</mark>'],
						['After the tour', 'Ask for a written quote. It arrives within one business day.']
					];
					other = ['#quote', 'Get a quote'];
				}
				var title = kind === 'quote' ? 'Your quote request is in.' : 'Your tour request is in.';
				var lead = kind === 'quote'
					? 'Expect a written quote at <b>' + esc(email) + '</b> within one business day.'
					: 'We will confirm your visit at <b>' + esc(email) + '</b>.';
				done.innerHTML =
					'<p class="cf__done-k"><span class="cf__done-ok">' + CHECK + '</span>Request received</p>' +
					'<h3 tabindex="-1">Thanks, ' + esc(first) + '. ' + title + '</h3>' +
					'<p class="cf__done-lead">' + lead + '</p>' +
					'<div class="cf__done-grid">' +
						'<div><h4>What you sent</h4><dl class="cf__sum">' + rows.filter(function (r) { return r[1]; }).map(function (r) {
							var v = r[1].length > 180 ? r[1].slice(0, 177) + '…' : r[1];
							return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(v) + '</dd></div>';
						}).join('') + '<div><dt>Email</dt><dd>' + esc(email) + '</dd></div></dl></div>' +
						'<div><h4>What happens next</h4><ol class="cf__next">' + steps.map(function (s) {
							return '<li><p class="t">' + s[0] + '</p><p>' + s[1] + '</p></li>';
						}).join('') + '</ol></div>' +
					'</div>' +
					'<div class="cf__done-cta"><a class="btn btn--ink" href="' + other[0] + '">' + other[1] + '</a><button type="button" class="btn btn--line" data-again>Send another</button></div>' +
					'<p class="cf__proto">Prototype: nothing was sent. On the live site this request goes straight to the sales team.</p>';
				body.hidden = true;
				done.hidden = false;
				done.querySelector('h3').focus({ preventScroll: true });
				scrollToEl(panel, !reduce);
				done.querySelector('[data-again]').addEventListener('click', again);
			}
			function again() {
				form.reset();
				delete form.dataset.tried;
				summary.innerHTML = '';
				items.forEach(function (it) { it.dirty = false; setErr(it, ''); });
				[].forEach.call(form.querySelectorAll('[data-stepper] input'), function (i) { i.cfSync(); });
				if (kind === 'quote' && sel && qty) {
					if (!chipOn) { delete qty.dataset.touched; }
					applyPlan();
				}
				done.hidden = true;
				done.innerHTML = '';
				body.hidden = false;
				var firstField = form.querySelector('input, select, textarea');
				if (firstField) { firstField.focus({ preventScroll: true }); }
				scrollToEl(panel, !reduce);
			}
		}

		/* initial tab from the hash (the quote form is the default) */
		var start = fromHash(window.location.hash);
		select(start > -1 ? start : 0);
		if (start > -1) {
			window.requestAnimationFrame(function () { setTabsH(); scrollToEl(panels[start], false); });
		}
	}

	document.querySelectorAll('.wp-block-amanah-contact-forms').forEach(init);
})();
