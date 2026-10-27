/**
 * Global behaviour on every page: sticky header, mobile drawer, scroll reveals.
 * Ported from the sample (reference/sample.js, script 3, "header" and "reveal").
 */
(function () {
	document.documentElement.classList.add('js');

	/* header + drawer */
	var hdr = document.getElementById('hdr');
	var drawer = document.getElementById('drawer');
	var mb = document.getElementById('menuBtn');
	if (hdr && drawer && mb) {
		var last = 0;
		var isOpen = function () { return drawer.classList.contains('is-open'); };
		var onScroll = function () {
			var y = window.scrollY;
			hdr.classList.toggle('is-solid', y > 40 || isOpen());
			hdr.classList.toggle('is-hidden', y > 700 && y > last && !isOpen());
			last = y;
		};
		var setOpen = function (o) {
			drawer.classList.toggle('is-open', o);
			mb.setAttribute('aria-expanded', o);
			mb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
			document.body.style.overflow = o ? 'hidden' : '';
			onScroll();
		};
		mb.addEventListener('click', function () {
			var o = !isOpen();
			setOpen(o);
			if (o) { drawer.querySelector('a').focus(); }
		});
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && isOpen()) { setOpen(false); mb.focus(); }
		});
		// Following an in-page link from the drawer closes it.
		drawer.addEventListener('click', function (e) { if (e.target.closest('a')) { setOpen(false); } });
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* reveal: [data-reveal] (block markup) or .reveal (core blocks, via className) fades up once in view */
	var items = document.querySelectorAll('[data-reveal], .reveal');
	if ('IntersectionObserver' in window) {
		var io = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
			});
		}, { rootMargin: '0px 0px -8% 0px' });
		items.forEach(function (el) { io.observe(el); });
	} else {
		items.forEach(function (el) { el.classList.add('is-in'); });
	}
})();
