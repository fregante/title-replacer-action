import {describe, it, expect} from 'vitest';
import {formatTitle, parsePattern} from './format-title.js';

describe('parsePattern', () => {
	it('should parse comma-separated list', () => {
		const result = parsePattern('fix, feat, bug');
		expect(result).toEqual(['fix', 'feat', 'bug']);
	});

	it('should parse newline-separated list', () => {
		const result = parsePattern('fix\nfeat\nbug');
		expect(result).toEqual(['fix', 'feat', 'bug']);
	});

	it('should parse regular expression', () => {
		const result = parsePattern('/^(fix|feat|bug)/');
		expect(result).toBeInstanceOf(RegExp);
		expect(result.source).toBe('^(fix|feat|bug)');
	});

	it('should handle mixed separators and whitespace', () => {
		const result = parsePattern(' fix, feat\n bug , chore ');
		expect(result).toEqual(['fix', 'feat', 'bug', 'chore']);
	});
});

describe('formatTitle', () => {
	it('replaces a simple keyword', () => {
		const result = formatTitle('hello world', {
			pattern: ['hello'],
			replacement: 'hi',
		});
		expect(result).toBe('hi world');
	});

	it('handles multiple keywords', () => {
		const result = formatTitle('hello world, goodbye moon', {
			pattern: ['hello', 'goodbye'],
			replacement: '[$0]',
		});
		expect(result).toBe('[hello] world, [goodbye] moon');
	});

	it('ignores partial matches', () => {
		const result = formatTitle('hello world', {
			pattern: ['hell'],
			replacement: 'hi',
		});
		expect(result).toBe('hello world');
	});

	it('ignores partial matches with dashes', () => {
		const result = formatTitle('hello-world', {
			pattern: ['hello'],
			replacement: 'hi',
		});
		expect(result).toBe('hello-world');
	});

	it('trims wrappers', () => {
		const result = formatTitle('[hello] (world)', {
			pattern: ['hello', 'world'],
			replacement: '<$0>',
			wrappers: '[](),',
		});
		expect(result).toBe('<hello> <world>');
	});

	it('preserves whitespace', () => {
		const result = formatTitle('  hello   world  ', {
			pattern: ['hello', 'world'],
			replacement: '[$0]',
		});
		expect(result).toBe('  [hello]   [world]  ');
	});

	it('handles regex pattern', () => {
		const result = formatTitle('hello123 world456', {
			pattern: /[a-z]+\d+/,
			replacement: '[$0]',
		});
		expect(result).toBe('[hello123] world456');
	});

	it('uppercases first letter when specified', () => {
		const result = formatTitle('hello world', {
			pattern: ['hello'],
			replacement: 'hi',
			uppercaseFirstLetter: true,
		});
		expect(result).toBe('Hi world');
	});

	it('handles empty pattern', () => {
		const result = formatTitle('hello world', {
			pattern: [],
			replacement: 'hi',
		});
		expect(result).toBe('hello world');
	});

	it('is case insensitive for keyword patterns', () => {
		const result = formatTitle('HELLO world', {
			pattern: ['hello'],
			replacement: '[$0]',
		});
		expect(result).toBe('[HELLO] world');
	});

	it('respects case in replacement', () => {
		const result = formatTitle('hello WORLD', {
			pattern: ['hello', 'world'],
			replacement: '[$0]',
		});
		expect(result).toBe('[hello] [WORLD]');
	});

	it('handles regex pattern with global flag', () => {
		const result = formatTitle('test123test456', {
			pattern: /(test)(\d+)/g,
			replacement: '[$1]($2)',
		});
		expect(result).toBe('[test](123)[test](456)');
	});

	it('handles regex pattern with no groups', () => {
		const result = formatTitle('hello123 world456', {
			pattern: /[a-z]+\d+/,
			replacement: '[$0]',
		});
		expect(result).toBe('[hello123] world456');
	});

	it('handles regex pattern', () => {
		const result = formatTitle('hello123 world456', {
			pattern: /([a-z]+)(\d+)/,
			replacement: '[$1]($2)',
		});
		expect(result).toBe('[hello](123) world456');
	});

	it('handles regex pattern with global flag', () => {
		const result = formatTitle('test123test456', {
			pattern: /(test)(\d+)/g,
			replacement: '[$1]($2)',
		});
		expect(result).toBe('[test](123)[test](456)');
	});

	it('handles regex pattern with no groups', () => {
		const result = formatTitle('hello123 world456', {
			pattern: /[a-z]+\d+/,
			replacement: '[$0]',
		});
		expect(result).toBe('[hello123] world456');
	});

	it('handles regex pattern with multiple matches and groups', () => {
		const result = formatTitle('hello123 world456 foo789', {
			pattern: /([a-z]+)(\d+)/g,
			replacement: '[$1]($2)',
		});
		expect(result).toBe('[hello](123) [world](456) [foo](789)');
	});

	it('trims wrappers around keyword', () => {
		const result = formatTitle('[hello] world', {
			pattern: ['hello'],
			replacement: 'hi',
			wrappers: '[]',
		});
		expect(result).toBe('hi world');
	});

	it('ignores wrappers when a regex is provided', () => {
		const result = formatTitle('"hello" world', {
			pattern: /hello/,
			replacement: 'hi',
			wrappers: '""',
		});
		expect(result).toBe('"hi" world');
	});

	it('matches patterns with wrappers and it preserves them', () => {
		const result = formatTitle('"hello" world', {
			pattern: ['hello'],
			replacement: 'hi',
		});
		expect(result).toBe('"hi" world');
	});

	it('matches patterns with wrappers and it drops them', () => {
		const result = formatTitle('[hello] world', {
			pattern: ['hello'],
			replacement: '`$0`',
			wrappers: '[]',
		});
		expect(result).toBe('`hello` world');
	});

	it('ignores patterns followed by dashes', () => {
		const result = formatTitle('hello-world', {
			pattern: ['hello'],
			replacement: 'hi',
		});
		expect(result).toBe('hello-world');
	});

	it('preserves colons following patterns', () => {
		const result = formatTitle('hello: world', {
			pattern: ['hello'],
			replacement: 'hi',
		});
		expect(result).toBe('hi: world');
	});
});
