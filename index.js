import fs from 'node:fs';
import process from 'node:process';
import {basename} from 'node:path';
import {
	getInput, getBooleanInput, debug, info, setFailed, setOutput,
} from '@actions/core';
import {Octokit} from '@octokit/action';
import {formatTitle, parsePattern} from './format-title.js';

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH));

function getInputs() {
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
	debug(`Received pattern: ${pattern}`);
	debug(`Received pattern-path: ${patternPath}`);
	debug(`Received replacement: ${replacement}`);
	debug(`Received trim-punctuation: ${trimPunctuation}`);
	debug(`Uppercase first letter: ${uppercaseFirstLetter}`);
	debug(`Dry run: ${dryRun}`);
	return {
		pattern, patternPath, replacement, trimPunctuation, uppercaseFirstLetter, dryRun,
	};
}

async function run() {
	if (!['issues', 'pull_request', 'pull_request_target'].includes(process.env.GITHUB_EVENT_NAME)) {
		throw new Error('Only `issues` and `pull_request` events are supported. Received: ' + process.env.GITHUB_EVENT_NAME);
	}

	if (!['opened', 'edited'].includes(event.action)) {
		throw new Error(`Only types \`opened\` and \`edited\` events are supported. Received: ${process.env.GITHUB_EVENT_NAME}.${event.action}`);
	}

	const conversation = event.issue || event.pull_request;
	const inputs = getInputs();

	if (inputs.pattern) {
		inputs.pattern = parsePattern(inputs.pattern);
	} else if (inputs.patternPath) {
		const stats = fs.statSync(inputs.patternPath);
		if (stats.isDirectory()) {
			inputs.patterns = fs.readdirSync(inputs.patternPath)
				.map(file => basename(file).split('.')[0]);
		} else if (stats.isFile()) {
			inputs.pattern = parsePattern(fs.readFileSync(inputs.patternPath, 'utf8'));
		} else {
			throw new Error(`Invalid pattern path: ${inputs.pattern}`);
		}
	}

	debug(`Parsed patterns: ${inputs.pattern}`);

	switch (inputs.trimPunctuation) {
		case 'false': {
			inputs.trimPunctuation = '';
			break;
		}

		case 'true': {
			inputs.trimPunctuation = '[]{}()<>-:`\'"';
			break;
		}

		default:
	}

	const newTitle = formatTitle(conversation.title, inputs);

	if (conversation.title === newTitle) {
		info('No title changes needed');
		setOutput('changed', false);
		setOutput('newTitle', conversation.title);
		return;
	}

	info(`Original title: "${conversation.title}"`);
	info(`Formatted title: "${newTitle}"`);

	setOutput('changed', true);
	setOutput('newTitle', newTitle);

	if (inputs.dryRun) {
		info('Dry run: No changes applied');
		return;
	}

	const octokit = new Octokit();
	const issue_number = conversation.number;
	const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
	await octokit.issues.update({
		owner, repo, issue_number, title: newTitle,
	});

	info('Title updated successfully');
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run().catch(error => {
	setFailed(error.message);
});
