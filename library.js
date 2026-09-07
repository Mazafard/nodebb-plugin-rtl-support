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

const rtlRegex = /[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}]/u;

const plugin = {};

plugin.isRTL = function (text) {
	if (!text || typeof text !== 'string') {
		return false;
	}
	return rtlRegex.test(text);
};

plugin.processHtml = function (html) {
	if (!html || typeof html !== 'string' || !plugin.isRTL(html)) {
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
			const text = $el.text().trim();
			if (plugin.isRTL(text)) {
				$el.attr('dir', 'rtl');
			}
		});

		// 2. Process parent lists (ol, ul)
		$('ol, ul').each((_, el) => {
			const $list = $(el);
			const childLis = $list.children('li');
			if (childLis.length === 0) {
				return;
			}
			const rtlLis = childLis.filter((_, li) => $(li).attr('dir') === 'rtl' || $(li).find('[dir="rtl"]').length > 0);
			if (rtlLis.length > 0) {
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
