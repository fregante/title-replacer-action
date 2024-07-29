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
	const trimPunctuation = getInput('trim-punctuation');
	const uppercaseFirstLetter = getBooleanInput('uppercase-first-letter');
	const dryRun = getBooleanInput('dry-run');
	const allowOverride = getBooleanInput('allow-override');
	return {
		pattern, patternPath, replacement, trimPunctuation, uppercaseFirstLetter, dryRun, allowOverride,
	};
}

export function processInputs({
	pattern, patternPath, trimPunctuation, ...inputs
}) {
	if (pattern) {
		pattern = parsePattern(pattern);
	} else if (patternPath) {
		const stats = fs.statSync(patternPath);
		if (stats.isDirectory()) {
			pattern = fs.readdirSync(patternPath)
				.map(file => path.basename(file).split('.')[0]);
		} else if (stats.isFile()) {
			pattern = parsePattern(fs.readFileSync(patternPath, 'utf8'));
		} else {
			throw new Error(`Invalid pattern path: ${pattern}`);
		}
	}

	switch (trimPunctuation) {
		case undefined:
		case false: {
			trimPunctuation = '';
			break;
		}

		case true: {
			trimPunctuation = '[]{}()<>-:`\'"';
			break;
		}

		default:
	}

	// Deduplicate
	pattern = [...new Set(pattern)];

	return {
		...inputs,
		pattern,
		trimPunctuation,
	};
}
