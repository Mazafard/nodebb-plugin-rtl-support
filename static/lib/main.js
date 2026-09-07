'use strict';

/* global $, window */

(function () {
	const rtlRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}]/u;

	// Apply RTL to post content and composer preview (handles markdown lists, headings, quotes, paragraphs)
	function applyPostRTL(container) {
		if (!container || !container.length) {
			return;
		}

		// 1. Post content elements, headings, paragraphs, quotes, list items
		container.find('h1, h2, h3, h4, h5, h6, li, blockquote, p').each(function () {
			const el = $(this);
			// Do not override code blocks
			if (el.closest('pre, code').length) {
				return;
			}
			const text = el.text().trim();
			if (rtlRegex.test(text)) {
				el.attr('dir', 'rtl');
			}
		});

		// 2. Parent markdown lists (ol, ul) ONLY inside post content or preview
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

	// Apply RTL ONLY to specific leaf text elements across forum UI (never to cards, rows, or layout containers)
	function applyUIRTL(container) {
		if (!container || !container.length) {
			return;
		}

		// Remove any accidental dir="rtl" on layout containers
		container.find('[component="categories/category"], [component="category/topic"], ul.categories, [component="categories/list"]').removeAttr('dir');

		// Target only leaf text elements
		container.find('[component="topic/title"], .topic-title, [component="category/topic"] [component="topic/header"] a, [component="categories/category"] h2 a, .category-info .description, [component="category/description"], [component="category/topic"] .teaser, [component="categories/category"] .teaser, [component="post/content"]').each(function () {
			const el = $(this);
			if (el.closest('.post-content, .composer-preview').length) {
				return; // Handled by applyPostRTL
			}
			const text = el.text().trim();
			if (rtlRegex.test(text)) {
				el.attr('dir', 'rtl');
			}
		});
	}

	function setupComposerRTL(composerEl) {
		if (!composerEl || !composerEl.length) {
			composerEl = $('.composer');
		}
		if (!composerEl.length) {
			return;
		}

		const titleInput = composerEl.find('input[component="composer/title"], .title');
		const contentTextarea = composerEl.find('textarea[component="composer/content"], textarea.write');

		function checkInputRTL(el) {
			const val = el.val();
			if (val && rtlRegex.test(val)) {
				el.attr('dir', 'rtl');
			} else if (!val || val.trim() === '') {
				el.removeAttr('dir');
			}
		}

		titleInput.off('input.rtlSupport').on('input.rtlSupport', function () {
			checkInputRTL($(this));
		});

		contentTextarea.off('input.rtlSupport').on('input.rtlSupport', function () {
			checkInputRTL($(this));
		});

		// Initial check
		checkInputRTL(titleInput);
		checkInputRTL(contentTextarea);
	}

	$(window).on('action:composer.loaded', function (ev, data) {
		const composerEl = data && data.composerEl ? $(data.composerEl) : $('.composer');
		setupComposerRTL(composerEl);
	});

	$(window).on('action:composer.preview', function (ev, data) {
		if (data && data.container) {
			applyPostRTL($(data.container));
		} else {
			applyPostRTL($('.composer-preview'));
		}
	});

	$(window).on('action:posts.loaded action:topic.loaded', function () {
		applyPostRTL($('.post-content'));
		applyUIRTL($('#content'));
	});

	$(window).on('action:ajaxify.end action:categories.loaded', function () {
		applyPostRTL($('.post-content'));
		applyUIRTL($('#content'));
		setupComposerRTL($('.composer'));
	});
})();
