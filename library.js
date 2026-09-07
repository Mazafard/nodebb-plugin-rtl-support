'use strict';

function getCheerio() {
	if (typeof global.nodebb !== 'undefined' && typeof global.nodebb.require === 'function') {
		try {
			return global.nodebb.require('cheerio');
		} catch (e) {}
	}
	if (require.main && typeof require.main.require === 'function') {
		try {
			return require.main.require('cheerio');
		} catch (e) {}
	}
	try {
		return require('cheerio');
	} catch (e) {}
	try {
		return require('/usr/src/app/node_modules/cheerio');
	} catch (e) {}
	return null;
}

const cheerio = getCheerio();

const rtlCharRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}]/u;
const strongCharRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}]/u;

const plugin = {};

plugin.hasRTL = function (text) {
	if (!text || typeof text !== 'string') {
		return false;
	}
	return rtlCharRegex.test(text);
};

plugin.isRTL = function (text) {
	if (!text || typeof text !== 'string') {
		return false;
	}
	if (!rtlCharRegex.test(text)) {
		return false;
	}

	// 1. First strong directional character (Unicode BiDi P2/P3 rule)
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
};

plugin.processHtml = function (html) {
	if (!html || typeof html !== 'string' || !plugin.hasRTL(html)) {
		return html;
	}

	if (!cheerio) {
		return html;
	}

	try {
		const $ = cheerio.load(html, null, false);

		// 1. Process headings, blockquotes, and individual list items
		$('h1, h2, h3, h4, h5, h6, li, blockquote, p').each((_, el) => {
			const $el = $(el);
			if ($el.closest('pre, code').length) {
				return;
			}
			const text = $el.text().trim();
			if (plugin.isRTL(text)) {
				$el.attr('dir', 'rtl');
			}
		});

		// 2. Process parent lists (ol, ul) - only if majority of items are RTL
		$('ol, ul').each((_, el) => {
			const $list = $(el);
			const childLis = $list.children('li');
			if (childLis.length === 0) {
				return;
			}
			const rtlLis = childLis.filter((_, li) => $(li).attr('dir') === 'rtl');
			if (rtlLis.length > (childLis.length / 2)) {
				$list.attr('dir', 'rtl');
			}
		});

		return $.html();
	} catch (err) {
		return html;
	}
};

plugin.parsePost = async function (data) {
	if (data && data.postData && data.postData.content) {
		data.postData.content = plugin.processHtml(data.postData.content);
	}
	return data;
};

plugin.parseRaw = async function (content) {
	if (content && typeof content === 'string') {
		return plugin.processHtml(content);
	}
	return content;
};

module.exports = plugin;
