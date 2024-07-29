import path from 'node:path';
import {writeFileSync, mkdirSync} from 'node:fs';
import * as cache from '@actions/cache';

export async function shouldRun(name, key, resetFrequency) {
	resetFrequency = String(Math.round(Date.now() / resetFrequency));
	const cachePath = `/tmp/run-memory/${name}`;
	const wasRunBefore = await cache.restoreCache([cachePath], `${resetFrequency}-${key}`, [], {
		lookupOnly: true,
	});

	if (wasRunBefore) {
		return false;
	}

	mkdirSync(path.dirname(cachePath), {recursive: true});
	writeFileSync(cachePath, '');

	await cache.saveCache([cachePath], resetFrequency);

	return true;
}
