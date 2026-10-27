/**
 * amanah/colocation-compare: ties the comparison rows to the plan picker on the same page.
 * - "Choose" on a row selects that plan's tab in the picker and scrolls to it (no reload);
 *   without a picker the link's own ?plan=<id>#plans URL is followed.
 * - The row of the plan currently open in the picker is marked .is-on.
 */
(function () {
	'use strict';

	function tabFor(picker, id) {
		var tabs = picker ? picker.querySelectorAll('[role="tab"]') : [];
		for (var i = 0; i < tabs.length; i++) {
			if (tabs[i].id.slice(-('-tab-' + id).length) === '-tab-' + id) { return tabs[i]; }
		}
		return null;
	}

	function init(root) {
		var picker = document.querySelector('.wp-block-amanah-plans');
		var rows = root.querySelectorAll('tbody tr[data-plan]');
		var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		function mark() {
			var on = picker && picker.querySelector('[role="tab"][aria-selected="true"]');
			rows.forEach(function (r) {
				var id = r.getAttribute('data-plan');
				r.classList.toggle('is-on', !!(on && id && on.id.slice(-('-tab-' + id).length) === '-tab-' + id));
			});
		}

		root.querySelectorAll('a[data-plan]').forEach(function (a) {
			a.addEventListener('click', function (e) {
				var tab = tabFor(picker, a.getAttribute('data-plan'));
				if (!tab || e.metaKey || e.ctrlKey || e.shiftKey || e.button) { return; }
				e.preventDefault();
				tab.click();
				try { history.replaceState(null, '', a.href); } catch (err) { /* file:// or sandbox */ }
				picker.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
				tab.focus({ preventScroll: true });
			});
		});

		if (picker && 'MutationObserver' in window) {
			new MutationObserver(mark).observe(picker, { subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
		}
		mark();
	}

	document.querySelectorAll('.wp-block-amanah-colocation-compare').forEach(init);
})();
