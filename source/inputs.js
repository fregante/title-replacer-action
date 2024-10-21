import fs from 'node:fs';
import path from 'node:path';
import {
	getInput, getBooleanInput,
} from '@actions/core';
import {parsePattern} from './format-title.js';

export function getInputs() {
	const pattern = getInput('pattern');
	const patternPath = getInput('pattern-path');
	if (pattern && patternPath) {
		throw new Error('Both `pattern` and `pattern-path` inputs are provided. Only one is allowed.');
	}

	if (!pattern && !patternPath) {
		throw new Error('Neither `pattern` nor `pattern-path` inputs are provided. One is required.');
	}

	const replacement = getInput('replacement');
	const trimWrappers = getInput('trim-wrappers');
	const uppercaseFirstLetter = getBooleanInput('uppercase-first-letter');
	const dryRun = getBooleanInput('dry-run');
	const allowOverride = getBooleanInput('allow-override');
	return {
		pattern, patternPath, replacement, trimWrappers, uppercaseFirstLetter, dryRun, allowOverride,
	};
}

export function processInputs({
	pattern, patternPath, trimWrappers, ...inputs
}) {
	if (pattern) {
		pattern = parsePattern(pattern);
		if (pattern.length === 0) {
			throw new Error('No patterns found in `pattern`' + (patternPath ? ` or \`pattern-path: "${patternPath}"\`` : ''));
		}
	} else if (patternPath) {
		const stats = fs.statSync(patternPath);
		if (stats.isDirectory()) {
			pattern = fs.readdirSync(patternPath)
				.map(file => path.basename(file).split('.')[0]);

			if (pattern.length === 0) {
				throw new Error('The directory is empty: ' + patternPath);
			}
		} else if (stats.isFile()) {
			pattern = parsePattern(fs.readFileSync(patternPath, 'utf8'));

			if (pattern.length === 0) {
				throw new Error('The file is empty: ' + patternPath);
			}
		} else {
			throw new Error(`Invalid pattern path: ${patternPath}`);
		}
	}

	if (pattern instanceof RegExp && trimWrappers) {
		throw new Error('`trim-wrappers` can\'t be used when pattern is a regular expression. Remove the `trim-wrappers` input.');
	}

	switch (trimWrappers) {
		case '':
		case undefined:
		case false:
		case 'false': {
			trimWrappers = false;
			break;
		}

		case true:
		case 'true': {
			trimWrappers = '[]{}()<>`\'"';
			break;
		}

		default: {
			const invalid = /[a-z\d]+/i.exec(trimWrappers);
			if (invalid) {
				throw new Error('`trim-wrappers` contains unsupported word characters: ' + invalid);
			}
		}
	}

	// Deduplicate
	pattern = [...new Set(pattern)];

	return {
		...inputs,
		pattern,
		trimWrappers,
	};
}
