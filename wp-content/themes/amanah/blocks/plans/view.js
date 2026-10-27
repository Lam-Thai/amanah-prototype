/**
 * Plan picker (ported from reference/sample.js, script 3 "plans").
 * Data comes from data-plans; the 3D rack (window.Rack3D, handle amanah-rack3d) starts when the
 * section nears the viewport and only if WebGL works, otherwise the sample's 2D rack is drawn.
 * ?plan=<id> (and optional &qty=<n>) in the page URL preselects a plan.
 */
(function () {
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var CHECK = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
	var LOCK = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
	var OTH = [[0, 2], [3, 1], [5, 4], [10, 1], [20, 3], [24, 2], [27, 1], [30, 4], [35, 2], [38, 1], [40, 2]], MINE = 12;

	function esc(s) {
		return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
			return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
		});
	}
	function money(n) { return '$' + Number(n).toLocaleString('en-CA'); }
	function price(p, n) {
		var pr = p.pricing || {};
		if (pr.mode === 'perUnit') { return money(pr.amount * n); }
		if (pr.mode === 'fixed') { return money(pr.amount); }
		return pr.label || 'Quoted';
	}
	function unit(p, n) {
		var pr = p.pricing || {};
		if (pr.mode === 'perUnit') { return n > 1 ? 'CAD / month, ' + n + ' ' + ((p.step && p.step.unitWord) || 'U') + ' at ' + money(pr.amount) + ' each' : 'CAD / month'; }
		if (pr.mode === 'fixed') { return pr.unit || 'CAD / month'; }
		return pr.unit || '';
	}
	function fmt(p, n) { return n + ' ' + (p.step.unitWord || ''); }
	// Rack3D knows five scenes by name; map other plan ids by their shape.
	function mode3d(p) {
		if (['shared', 'quarter', 'half', 'full', 'suite'].indexOf(p.id) > -1) { return p.id; }
		if (p.suite) { return 'suite'; }
		return { 4: 'quarter', 2: 'half', 1: 'full' }[p.comps] || 'shared';
	}
	function U(n) { return 'calc(var(--u) * ' + n + ')'; }

	function init(root) {
		var box = root.querySelector('.plans[data-plans]');
		if (!box || box.dataset.plansInit) { return; }
		box.dataset.plansInit = '1';

		var PLANS;
		try { PLANS = JSON.parse(box.dataset.plans); } catch (e) { return; }
		if (!PLANS || !PLANS.length) { return; }

		var $ = function (s) { return box.querySelector(s); };
		var tabs = $('.plans__tabs'), btns = [].slice.call(tabs.querySelectorAll('[role="tab"]'));
		var panel = $('.plan'), media = $('.plan__media'), rk = $('.rkstage'), cap = $('.rkcap');
		var stepper = $('.stepper'), minus = stepper.querySelector('[data-step="-1"]'), plus = stepper.querySelector('[data-step="1"]');
		var contact = box.dataset.contactUrl || '';
		var cur = 0, val = {}, last = {}, openT, R3 = null;
		PLANS.forEach(function (p) {
			if (p.step) { val[p.id] = p.step.start != null ? p.step.start : p.step.min; }
			if (!p.step && !p.suite) { p.comps = p.comps || 1; p.open = p.open || 0; }
		});

		/* 2D rack (fallback when there is no WebGL) */
		function cab(inner, tg) {
			var n = '';
			[42, 36, 30, 24, 18, 12, 6, 1].forEach(function (k) { n += '<b style="top:' + U(42 - k) + '">' + k + '</b>'; });
			return '<div class="rk"><div class="rk__cap"><span></span><i></i></div><div class="rk__body"><div class="rk__rail">' + n + '</div><div class="rk__bay">' + inner + '</div><div class="rk__rail"></div>' + tg + '</div><div class="rk__base"><i></i><i></i></div></div>';
		}
		function tag(top, h, t, sm) { return '<div class="rk__tag" style="top:' + U(top) + ';height:' + U(h) + '">' + t + '<small>' + esc(sm) + '</small></div>'; }
		function drawShared(n) {
			var used = {}, h = '';
			OTH.forEach(function (o) {
				for (var k = 0; k < o[1]; k++) { used[o[0] + k] = 1; }
				h += '<div class="srv" style="top:calc(' + U(o[0]) + ' + 1px);height:calc(' + U(o[1]) + ' - 2px)"><i></i><i></i></div>';
			});
			var prev = last.shared || 0;
			for (var k = 0; k < n; k++) {
				used[MINE + k] = 1;
				h += '<div class="srv mine' + (k >= prev ? ' in' : '') + '" style="top:calc(' + U(MINE + k) + ' + 1px);height:calc(' + U(1) + ' - 2px);animation-delay:' + ((k - prev) * 90) + 'ms"><i></i><i></i></div>';
			}
			for (var i = 0; i < 42; i++) { if (!used[i]) { h += '<div class="blank" style="top:calc(' + U(i) + ' + 1px);height:calc(' + U(1) + ' - 2px)"></div>'; } }
			last.shared = n;
			rk.innerHTML = cab(h, tag(MINE, n, 'Yours', n + ' U of 42 U'));
			cap.innerHTML = '<b>' + n + ' U</b> in a shared cabinet, ' + (n > 1 ? 'U' + (42 - MINE - n + 1) + ' to U' + (42 - MINE) : 'U' + (42 - MINE));
			rk.setAttribute('aria-label', 'Shared 42 U cabinet with your ' + n + ' U highlighted among other customers\' servers');
		}
		function drawComps(p) {
			var h = '', sz = 42 / p.comps;
			for (var c = 0; c < p.comps; c++) {
				var mine = c === p.open;
				h += '<div class="comp' + (mine ? ' mine' : '') + '" style="top:' + U(c * sz) + ';height:' + U(sz) + '">' + (mine ? '<div class="comp__in"><b>Your ' + esc(p.word) + '</b>' + esc(p.size) + ', empty and ready</div>' : '') + '<div class="door">' + (mine ? '' : '<span>' + LOCK + 'In use</span>') + '</div></div>';
			}
			rk.innerHTML = cab(h, tag(p.open * sz, sz, 'Yours', p.size + (p.comps > 1 ? ', own door' : ', whole cabinet')));
			cap.innerHTML = p.comps > 1 ? '<b>Section ' + (p.open + 1) + ' of ' + p.comps + '</b>, keyed to you alone' : '<b>42 U</b> dedicated cabinet, locked to you';
			rk.setAttribute('aria-label', p.comps > 1 ? 'A 42 U cabinet split into ' + p.comps + ' locked sections, with your ' + p.size + ' section open and empty' : 'A 42 U cabinet with its door open, empty and ready for your gear');
			clearTimeout(openT);
			openT = setTimeout(function () { var m = rk.querySelector('.comp.mine'); if (m) { m.classList.add('open'); } }, reduce ? 0 : 380);
		}
		function drawSuite(n) {
			var prev = last.suite || 0, top = Math.ceil(n / 2);
			var r = function (a, b) { var s = ''; for (var k = a; k < b; k++) { s += '<i class="rt' + (prev && k >= prev ? ' in' : '') + '"></i>'; } return s; };
			rk.innerHTML = '<div class="suite"><div class="cage"><span class="cage__tag">Your cage<small>' + n + ' racks</small></span><div class="cage__row">' + r(0, top) + '</div><div class="cage__aisle">Cold aisle</div><div class="cage__row">' + r(top, n) + '</div><span class="cage__gate"></span><span class="cage__reader"></span></div></div>';
			last.suite = n;
			cap.innerHTML = '<b>' + n + ' racks</b> in your own cage, card access at the gate';
			rk.setAttribute('aria-label', 'Top-down plan of a private cage holding ' + n + ' racks facing a cold aisle');
		}

		function quoteUrl(p, v) {
			try {
				var u = new URL(contact, window.location.href);
				u.searchParams.set('plan', p.id);
				if (p.step) { u.searchParams.set('qty', v); } else { u.searchParams.delete('qty'); }
				u.hash = 'quote';
				return u.href;
			} catch (e) { return contact; }
		}

		function render() {
			var p = PLANS[cur], v = val[p.id];
			$('.plan__name').textContent = p.name || '';
			$('.plan__who').textContent = p.who || '';
			$('.plan__price b').textContent = price(p, v);
			$('.plan__price span').textContent = unit(p, v);
			$('.badge').textContent = p.badge || '';
			$('.plan__list').innerHTML = (p.list || []).map(function (t) { return '<li>' + CHECK + esc(t) + '</li>'; }).join('');
			stepper.hidden = !p.step;
			if (p.step) {
				stepper.querySelector('p').textContent = p.step.label || '';
				stepper.querySelector('output').textContent = fmt(p, v);
				minus.disabled = v <= p.step.min;
				plus.disabled = v >= p.step.max;
				minus.setAttribute('aria-label', 'Remove one ' + (p.step.one || ''));
				plus.setAttribute('aria-label', 'Add one ' + (p.step.one || ''));
			}
			var cta = $('.plan__quote');
			if (cta) { cta.href = quoteUrl(p, v); }
			if (btns[cur]) { panel.setAttribute('aria-labelledby', btns[cur].id); }
			if (p.step && !p.suite && !p.comps) { drawShared(v); } else if (p.suite) { drawSuite(v); } else { drawComps(p); }
			if (R3) { R3.set(mode3d(p), v); }
		}

		function show(i) {
			cur = i; last = {};
			btns.forEach(function (b, j) { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
			render();
		}
		function bump(d) {
			var p = PLANS[cur];
			if (!p.step) { return; }
			var v = val[p.id] + d;
			if (v < p.step.min || v > p.step.max) { return; }
			val[p.id] = v;
			render();
		}

		btns.forEach(function (b, i) {
			b.addEventListener('click', function () { show(i); });
			b.addEventListener('keydown', function (e) {
				var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, n = -1;
				if (d) { n = (i + d + btns.length) % btns.length; } else if (e.key === 'Home') { n = 0; } else if (e.key === 'End') { n = btns.length - 1; }
				if (n > -1) { e.preventDefault(); show(n); btns[n].focus(); }
			});
		});
		minus.addEventListener('click', function () { bump(-1); });
		plus.addEventListener('click', function () { bump(1); });

		/* 3D rack: WebGL check, lazy start near the viewport */
		try {
			var tc = document.createElement('canvas');
			if (window.Rack3D && 'IntersectionObserver' in window && (tc.getContext('webgl2') || tc.getContext('webgl'))) {
				media.classList.add('is3d');
				var lab = media.querySelector('.r3lab');
				var r3io = new IntersectionObserver(function (es) {
					if (!es[0].isIntersecting) { return; }
					r3io.disconnect();
					try {
						R3 = new window.Rack3D(media.querySelector('.r3'));
						R3.onLabel = function (l) {
							lab.innerHTML = (l.up ? '' : '<span class="ln"></span>') + '<span class="cd"><b>' + esc(l.t === 'Yours' ? 'Your space' : l.t) + '</b><small>' + esc(l.s) + '</small></span>';
							lab.classList.toggle('up', !!l.up);
						};
						R3.onPos = function (x, y) {
							var W = lab.parentNode.clientWidth, w = lab.offsetWidth || 0;
							lab.style.left = Math.max(8, Math.min(x, W - w - 8)) + 'px';
							lab.style.top = y + 'px';
						};
						var p = PLANS[cur];
						R3.set(mode3d(p), val[p.id]);
					} catch (e) {
						R3 = null;
						media.classList.remove('is3d');
					}
				}, { rootMargin: '900px 0px' });
				r3io.observe(media);
			}
		} catch (e) { R3 = null; }

		/* initial plan: ?plan=<id>&qty=<n> from the page URL, else the first */
		var start = 0;
		try {
			var q = new URLSearchParams(window.location.search), want = q.get('plan');
			PLANS.forEach(function (p, i) { if (want && p.id === want) { start = i; } });
			var sp = PLANS[start], qty = parseInt(q.get('qty'), 10);
			if (want && sp.step && qty >= sp.step.min && qty <= sp.step.max) { val[sp.id] = qty; }
		} catch (e) { start = 0; }
		show(start);
	}

	document.querySelectorAll('.wp-block-amanah-plans').forEach(init);
})();
