function escapeRegExp(string) {
	return string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parsePattern(pattern) {
	if (pattern.startsWith('/') && pattern.endsWith('/')) {
		return new RegExp(pattern.slice(1, -1), 'g');
	}

	return pattern.split(/[\n,]+/)
		.map(p => p.trim())
		.filter(Boolean);
}

export function formatTitle(title, {pattern, replacement, trimPunctuation, uppercaseFirstLetter}) {
	let newTitle = title;
	const escapedPunctuation = escapeRegExp(trimPunctuation ?? '');

	if (pattern instanceof RegExp) {
		newTitle = newTitle.replace(pattern, (...arguments_) => {
			const match = arguments_[0];
			const groups = arguments_.slice(1, -2); // Exclude last two items (offset and string)
			let result = replacement;
			for (let i = 0; i <= groups.length; i++) {
				const value = i === 0 ? match : (groups[i - 1] || '');
				result = result.replaceAll(new RegExp('\\$' + i, 'g'), value);
			}

			return result;
		});
	} else {
		for (const keyword of pattern) {
			const regex = new RegExp(
				`(^|\\s)([${escapedPunctuation}]*)(${escapeRegExp(keyword)})([${escapedPunctuation}]*)(\\s|$)`,
				'gi',
			);
			newTitle = newTitle.replace(regex, (match, before, leadingPunct, keywordMatch, trailingPunct, after) => `${before}${replacement.replace('$0', keywordMatch)}${after}`);
		}
	}

	if (uppercaseFirstLetter) {
		newTitle = newTitle.charAt(0).toUpperCase() + newTitle.slice(1);
	}

	return newTitle;
}
