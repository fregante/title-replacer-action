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
			trimWrappers: false,
		});
	});

	it('parses a comma-separed pattern', () => {
		const result = processInputs({
			pattern: 'fix, feat, bug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimWrappers: false,
		});
	});

	it('parses a line-separed pattern', () => {
		const result = processInputs({
			pattern: 'fix\nfeat\nbug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimWrappers: false,
		});
	});

	it('deduplicates patterns', () => {
		const result = processInputs({
			pattern: 'fix, fix, fix',
		});
		expect(result).toEqual({
			pattern: ['fix'],
			trimWrappers: false,
		});
	});

	it('ignores empty patterns', () => {
		const result = processInputs({
			pattern: 'fix,, feat, bug',
		});
		expect(result).toEqual({
			pattern: ['fix', 'feat', 'bug'],
			trimWrappers: false,
		});
	});

	it('loads a comma-separed patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/comma.txt',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimWrappers: false,
		});
	});

	it('loads a line-separed patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/linebreak',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimWrappers: false,
		});
	});

	it('loads a directory patternPath', () => {
		const result = processInputs({
			patternPath: 'fixtures/directory',
		});
		expect(result).toEqual({
			pattern: filesystemPattern,
			trimWrappers: false,
		});
	});

	it('accepts trimWrappers', () => {
		const result = processInputs({
			trimWrappers: ':',
			pattern: 'fix',
		});
		expect(result).toEqual({
			pattern: ['fix'],
			trimWrappers: ':',
		});
	});

	it('accepts empty or false trimWrappers', () => {
		const vFalse = processInputs({
			trimWrappers: false,
			pattern: 'fix',
		});
		expect(vFalse).toEqual({
			pattern: ['fix'],
			trimWrappers: false,
		});

		const vEmpty = processInputs({
			trimWrappers: '',
			pattern: 'fix',
		});
		expect(vEmpty).toEqual({
			pattern: ['fix'],
			trimWrappers: false,
		});

		const vUndefined = processInputs({
			trimWrappers: undefined,
			pattern: 'fix',
		});
		expect(vUndefined).toEqual({
			pattern: ['fix'],
			trimWrappers: false,
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

	it('throws when trimWrappers contains non-punctuation characters', () => {
		expect(() => processInputs({
			pattern: 'fix',
			trimWrappers: 'trua',
		})).toThrow('`trim-wrappers` contains unsupported word characters: trua');
		expect(() => processInputs({
			pattern: 'fix',
			trimWrappers: 'the',
		})).toThrow('`trim-wrappers` contains unsupported word characters: the');
	});
});
