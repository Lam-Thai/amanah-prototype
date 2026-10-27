/**
 * Hero video: scroll-scrubbed footage (ported from reference/sample.js, script 4).
 * The video is played once at 3x to grab N frames into ImageBitmaps; scrolling then
 * paints the matching frame to the canvas and switches the three copy beats.
 * Reduced motion: no video, beat 3 shown. The rAF loop runs only while the hero is on screen.
 */
(function () {
	function init(w) {
		if (w.dataset.awInit) { return; }
		w.dataset.awInit = '1';

		var st = w.querySelector('.aw__st');
		var v = w.querySelector('.aw__v');
		var cv = w.querySelector('.aw__cv');
		var cue = w.querySelector('.aw__cue');
		var B = [].slice.call(w.querySelectorAll('.aw__beat'));
		if (!st || !v || !cv || !B.length) { return; }
		var last = B.length - 1;

		var red = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (red) {
			B.forEach(function (b, i) { b.classList.toggle('is-on', i === last); });
			if (cue) { cue.style.display = 'none'; }
			v.removeAttribute('src');
			return;
		}

		var cx = cv.getContext('2d');
		var por = !window.matchMedia('(min-aspect-ratio: 6/5)').matches;
		var src = por ? v.dataset.m : v.dataset.d;
		if (!src || !cx) { return; }
		v.src = src;

		var cur = 0, F = [], small = window.innerWidth < 700, N = small ? 72 : 110, FW = small ? 720 : 1440, drawn = -1;

		function size() {
			var r = Math.min(2, window.devicePixelRatio || 1);
			cv.width = Math.round(st.clientWidth * r);
			cv.height = Math.round(st.clientHeight * r);
			drawn = -1;
		}
		window.addEventListener('resize', size);
		size();

		function paint(b) {
			var cw = cv.width, ch = cv.height, s = Math.max(cw / b.width, ch / b.height), dw = b.width * s, dh = b.height * s;
			cx.drawImage(b, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
		}
		function seek(t) {
			return new Promise(function (r) { v.onseeked = function () { r(); }; v.currentTime = t; });
		}

		async function extract() {
			await new Promise(function (r) { if (v.readyState >= 2) { r(); } else { v.onloadeddata = r; } });
			var d = v.duration, FH = Math.round(FW * v.videoHeight / v.videoWidth), tc = document.createElement('canvas');
			tc.width = FW; tc.height = FH;
			var tx = tc.getContext('2d'), next = 0;
			function grab(i) {
				tx.drawImage(v, 0, 0, FW, FH);
				createImageBitmap(tc).then(function (b) {
					F[i] = b;
					if (i === 0) { st.classList.add('is-ready'); drawn = -1; start(); }
				});
			}
			// Fast path: play at 3x and grab frames as they are presented.
			if ('requestVideoFrameCallback' in v) {
				await new Promise(function (res) {
					function cb(now, md) {
						while (next < N && md.mediaTime >= d * next / N - 0.001) { grab(next); next++; }
						if (next >= N || v.ended) { return res(); }
						v.requestVideoFrameCallback(cb);
					}
					v.requestVideoFrameCallback(cb);
					v.onended = res;
					v.playbackRate = 3;
					v.play().catch(res);
				});
				v.pause();
			}
			// Fallback (and gap filling): seek to each missing frame.
			for (var i = 0; i < N; i++) {
				if (F[i]) { continue; }
				await seek((d - 0.06) * i / (N - 1));
				grab(i);
			}
		}
		extract().catch(function () {});

		function prog() {
			var r = w.getBoundingClientRect(), span = w.offsetHeight - window.innerHeight;
			return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
		}

		var vis = false, raf = 0;
		function tick() {
			raf = 0;
			if (!vis || document.hidden) { return; }
			raf = requestAnimationFrame(tick);
			cur += (prog() - cur) * 0.09;
			var idx = Math.round(cur * (N - 1)), k2 = idx;
			while (k2 > 0 && !F[k2]) { k2--; }
			if (F[k2] && k2 !== drawn) { paint(F[k2]); drawn = k2; }
			var k = cur < 0.3 ? 0 : cur < 0.68 ? 1 : 2;
			k = Math.min(k, last);
			B.forEach(function (b, i) { b.classList.toggle('is-on', i === k); });
			if (cue) { cue.style.opacity = cur > 0.03 ? 0 : ''; }
		}
		function start() {
			if (!raf && vis && !document.hidden) { raf = requestAnimationFrame(tick); }
		}

		new IntersectionObserver(function (e) { vis = e[0].isIntersecting; start(); }).observe(w);
		document.addEventListener('visibilitychange', start);
	}

	document.querySelectorAll('.wp-block-amanah-hero-video').forEach(init);
})();
