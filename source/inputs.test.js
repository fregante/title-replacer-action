import {describe, it, expect} from 'vitest';
import {processInputs} from './inputs.js';

const filesystemPattern = ['durian', 'marang', 'rambutan'];

describe('processInputs', () => {
	it('parses a single pattern', () => {
		const result = processInputs({
			pattern: 'fix',
		});
		expect(result).toEqual({
			pattern: ['fix'],
			trimPunctuation: '',
		});
	});

	it('parses a comma-separed pattern', () => {
		const result = processInputs({
			pattern: 'fix, feat, bug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimPunctuation: '',
		});
	});

	it('parses a line-separed pattern', () => {
		const result = processInputs({
			pattern: 'fix\nfeat\nbug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimPunctuation: '',
		});
	});

	it('deduplicates patterns', () => {
		const result = processInputs({
			pattern: 'fix, fix, fix',
		});
		expect(result).toEqual({
			pattern: ['fix'],
			trimPunctuation: '',
		});
	});

	it('ignores empty patterns', () => {
		const result = processInputs({
			pattern: 'fix,, feat, bug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimPunctuation: '',
		});
	});

	it('loads a comma-separed patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/comma.txt',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimPunctuation: '',
		});
	});

	it('loads a line-separed patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/linebreak',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimPunctuation: '',
		});
	});

	it('loads a directory patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/directory',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimPunctuation: '',
		});
	});

	it('accepts trimPunctuation', () => {
		const result = processInputs({
			trimPunctuation: ':',
		});
		expect(result).toEqual({
			pattern: [],
			trimPunctuation: ':',
		});
	});

	it('accepts empty or false trimPunctuation', () => {
		const vFalse = processInputs({
			trimPunctuation: ':',
		});
		expect(vFalse).toEqual({
			pattern: [],
			trimPunctuation: ':',
		});

		const vEmpty = processInputs({
			trimPunctuation: '',
		});
		expect(vEmpty).toEqual({
			pattern: [],
			trimPunctuation: '',
		});

		const vUndefined = processInputs({
			trimPunctuation: undefined,
		});
		expect(vUndefined).toEqual({
			pattern: [],
			trimPunctuation: '',
		});
	});
});
