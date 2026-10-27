/**
 * Story: the step crossing the middle of the viewport becomes active and switches the sticky
 * image, progress bar and caption. Ported from the sample (sample.js, script 3, "story").
 */
(function () {
	if (!('IntersectionObserver' in window)) { return; }

	function init(root) {
		if (root.amanahStory) { return; }
		root.amanahStory = true;
		var steps = [].slice.call(root.querySelectorAll('.step'));
		var imgs = [].slice.call(root.querySelectorAll('.story__media img'));
		var bars = [].slice.call(root.querySelectorAll('.story__media .bars i'));
		var cap = root.querySelector('.story__cap');
		if (!steps.length) { return; }

		function show(i) {
			steps.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
			imgs.forEach(function (im) { im.classList.toggle('is-on', +im.dataset.i === i); });
			bars.forEach(function (b, j) { b.classList.toggle('is-on', j === i); });
			if (cap) { cap.textContent = steps[i].dataset.cap || ''; }
		}

		var so = new IntersectionObserver(function (es) {
			es.forEach(function (e) {
				if (e.isIntersecting) { show(steps.indexOf(e.target)); }
			});
		}, { rootMargin: '-45% 0px -45% 0px' });
		steps.forEach(function (s) { so.observe(s); });
	}

	document.querySelectorAll('.wp-block-amanah-story').forEach(init);
})();
