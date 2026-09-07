'use strict';

/* global $, window */

(function () {
	const rtlRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}]/u;

	function applyRTL(container) {
		if (!container || !container.length) {
			return;
		}

		container.find('h1, h2, h3, h4, h5, h6, li, blockquote, p').each(function () {
			const el = $(this);
			const text = el.text().trim();
			if (rtlRegex.test(text)) {
				el.attr('dir', 'rtl');
			}
		});

		container.find('ol, ul').each(function () {
			const list = $(this);
			const childLis = list.children('li');
			if (!childLis.length) {
				return;
			}
			const hasRtl = childLis.filter(function () {
				return $(this).attr('dir') === 'rtl' || $(this).find('[dir="rtl"]').length > 0;
			}).length > 0;

			if (hasRtl) {
				list.attr('dir', 'rtl');
			}
		});
	}

	$(window).on('action:composer.preview', function (ev, data) {
		if (data && data.container) {
			applyRTL($(data.container));
		} else {
			applyRTL($('.composer-preview'));
		}
	});

	$(window).on('action:posts.loaded action:topic.loaded action:ajaxify.end', function () {
		applyRTL($('.post-content'));
	});
})();
