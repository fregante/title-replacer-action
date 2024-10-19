import {mkdirSync} from 'node:fs';
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
			pattern: 'fix',
		});
		expect(result).toEqual({
			pattern: ['fix'],
			trimPunctuation: ':',
		});
	});

	it('accepts empty or false trimPunctuation', () => {
		const vFalse = processInputs({
			trimPunctuation: ':',
			pattern: 'fix',
		});
		expect(vFalse).toEqual({
			pattern: ['fix'],
			trimPunctuation: ':',
		});

		const vEmpty = processInputs({
			trimPunctuation: '',
			pattern: 'fix',
		});
		expect(vEmpty).toEqual({
			pattern: ['fix'],
			trimPunctuation: '',
		});

		const vUndefined = processInputs({
			trimPunctuation: undefined,
			pattern: 'fix',
		});
		expect(vUndefined).toEqual({
			pattern: ['fix'],
			trimPunctuation: '',
		});
	});

	it('throws when patternPath doesn\'t exist', () => {
		expect(() => processInputs({
			patternPath: 'fixtures/doesnotexist',
		})).toThrow('ENOENT: no such file or directory, stat \'fixtures/doesnotexist\'');
	});

	it('throws when patternPath is an empty file', () => {
		expect(() => processInputs({
			patternPath: 'fixtures/empty-file',
		})).toThrow('The file is empty: fixtures/empty-file');
	});

	it('throws when patternPath is an empty directory', () => {
		mkdirSync('fixtures/empty-directory', {recursive: true});
		expect(() => processInputs({
			patternPath: 'fixtures/empty-directory',
		})).toThrow('The directory is empty: fixtures/empty-directory');
	});
});
