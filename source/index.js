import fs from 'node:fs';
import process from 'node:process';
import {
	endGroup,
	info,
	setOutput,
	startGroup,
} from '@actions/core';
import {Octokit} from '@octokit/action';
import {formatTitle} from './format-title.js';
import {getInputs, processInputs} from './inputs.js';
import {shouldRun} from './run-memory.js';

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH));

function readEnv() {
	if (!['issues', 'pull_request', 'pull_request_target'].includes(process.env.GITHUB_EVENT_NAME)) {
		throw new Error('Only `issues`, `pull_request`, and `pull_request_target` events are supported. Received: ' + process.env.GITHUB_EVENT_NAME);
	}

	if (!['opened', 'edited'].includes(event.action)) {
		throw new Error(`Only types \`opened\` and \`edited\` events are supported. Received: ${process.env.GITHUB_EVENT_NAME}.${event.action}`);
	}

	const conversation = event.issue ?? event.pull_request;
	return {
		title: conversation.title,
		number: conversation.number,
		inputs: getInputs(),
	};
}

async function run() {
	const {title, number, inputs} = readEnv();
	const processedInputs = processInputs(inputs);
	startGroup('Inputs');
	info(JSON.stringify({inputs, processedInputs}, null, 2));
	endGroup();

	if (inputs.allowOverride && !await shouldRun(
		'title-replacer',
		JSON.stringify({inputs}).replaceAll(/[^a-z\d]/g, ''),
		1000 * 60 * 5, // At most once every 5 minutes
	)) {
		info('Skipping due to allow-override');
		return;
	}

	const newTitle = formatTitle(title, processedInputs);
	const changeNeeded = title !== newTitle;
	setOutput('title', newTitle);
	setOutput('changed', changeNeeded);

	info(`Title: "${newTitle}"`);

	if (title === newTitle) {
		info('No title changes needed');
		return;
	}

	info(`New title: "${newTitle}"`);

	if (inputs.dryRun) {
		info('Dry run: No changes applied');
		return;
	}

	const octokit = new Octokit();
	const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
	await octokit.issues.update({
		owner, repo, issue_number: number, title: newTitle,
	});

	info('Title updated successfully');
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run();
