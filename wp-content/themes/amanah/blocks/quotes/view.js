/**
 * Quote rail: previous/next scroll the list by one card. Ported from the sample
 * (sample.js, script 3, "quotes").
 */
(function () {
	var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function init(root) {
		var list = root.querySelector('.qrail__list');
		if (!list || root.amanahQuotes) { return; }
		root.amanahQuotes = true;
		root.querySelectorAll('.qrail__nav button').forEach(function (b) {
			b.addEventListener('click', function () {
				var c = list.querySelector('li');
				if (!c) { return; }
				var gap = parseFloat(getComputedStyle(list).columnGap) || 20;
				list.scrollBy({ left: (+b.dataset.dir || 1) * (c.offsetWidth + gap), behavior: reduce ? 'auto' : 'smooth' });
			});
		});
	}

	document.querySelectorAll('.wp-block-amanah-quotes').forEach(init);
})();
