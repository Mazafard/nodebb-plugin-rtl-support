'use strict';

/* global $, window */

(function () {
	const rtlCharRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
	const strongCharRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}]/u;

	function isRTL(text) {
		if (!text || typeof text !== 'string') {
			return false;
		}
		if (!rtlCharRegex.test(text)) {
			return false;
		}

		// 1. First strong directional character (Unicode BiDi rule)
		for (const char of text) {
			if (strongCharRegex.test(char)) {
				if (rtlCharRegex.test(char)) {
					return true;
				}
				break; // First strong character is LTR
			}
		}

		// 2. Fallback: If text starts with an LTR token (e.g. brand name), check character ratio
		const rtlMatches = text.match(/[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/gu);
		const ltrMatches = text.match(/[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}]/gu);
		const rtlCount = rtlMatches ? rtlMatches.length : 0;
		const ltrCount = ltrMatches ? ltrMatches.length : 0;

		return rtlCount > ltrCount;
	}

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
			if (isRTL(text)) {
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
			const rtlLis = childLis.filter(function () {
				return $(this).attr('dir') === 'rtl';
			});

			if (rtlLis.length > (childLis.length / 2)) {
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
			if (isRTL(text)) {
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
			if (val && isRTL(val)) {
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
