/**
 * Location spotlight: a pin or card zooms the aerial towards that place and dims the rest.
 * The first place is focused once the map is a third on screen and its image is decoded.
 * Ported from the sample (sample.js, script 3, "location spotlight").
 */
(function () {
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function init(root) {
		var map = root.querySelector('.loc__map');
		if (!map || root.amanahLoc) { return; }
		root.amanahLoc = true;
		var pan = map.querySelector('.loc__pan');
		var dim = map.querySelector('.loc__dim');
		var img = pan.querySelector('img');
		var lmk = map.querySelector('.lmark');
		var pins = [].slice.call(map.querySelectorAll('.lpin'));
		var items = [].slice.call(root.querySelectorAll('.lc button'));

		function go(k) {
			var pin = pins[k];
			if (!pin) { return; }
			var x = pin.dataset.fx + '%', y = pin.dataset.fy + '%', z = reduce ? 1 : +pin.dataset.z || 1, iz = (1 / z).toFixed(3);
			pan.style.setProperty('--ox', x);
			pan.style.setProperty('--oy', y);
			pan.style.setProperty('--z', z);
			pins.forEach(function (b) { b.style.setProperty('--iz', iz); });
			if (lmk) { lmk.style.setProperty('--iz', iz); }
			dim.style.setProperty('--sx', x);
			dim.style.setProperty('--sy', y);
			dim.style.setProperty('--sr', pin.dataset.r + '%');
			dim.style.setProperty('--dim', 1);
			pins.concat(items).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.k === k)); });
		}
		pins.concat(items).forEach(function (b) {
			b.addEventListener('click', function () { go(+b.dataset.k); });
		});

		// Fade the aerial in once decoded (the CSS hides it until .is-ready).
		var rdy, ready = new Promise(function (r) { rdy = r; });
		function mark() { map.classList.add('is-ready'); rdy(); }
		function decode() { return img.decode ? img.decode() : new Promise(function (r) { img.onload = r; }); }
		if (!img) { mark(); } else if (img.complete && img.naturalWidth) { decode().then(mark, mark); }

		if (!('IntersectionObserver' in window)) {
			if (img) { decode().then(mark, mark); }
			ready.then(function () { go(0); });
			return;
		}
		var pre = new IntersectionObserver(function (es) {
			if (es[0].isIntersecting) { pre.disconnect(); if (img) { decode().then(mark, mark); } }
		}, { rootMargin: '1200px 0px' });
		pre.observe(map);
		var once = new IntersectionObserver(function (es) {
			if (es[0].isIntersecting) {
				once.disconnect();
				ready.then(function () { requestAnimationFrame(function () { go(0); }); });
			}
		}, { threshold: 0.3 });
		once.observe(map);
	}

	document.querySelectorAll('.wp-block-amanah-location').forEach(init);
})();
