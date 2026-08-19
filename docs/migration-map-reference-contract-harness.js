'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = '/home/ubuntu/novasocial';
const migrationMapPath = path.join(repo, 'MIGRATION_MAP.md');
const migrationMap = fs.readFileSync(migrationMapPath, 'utf8');
const refs = [...new Set([...migrationMap.matchAll(/`(docs\/[^`]+)`/g)].map(match => match[1]))].sort();
const missing = refs.filter(ref => !fs.existsSync(path.join(repo, ref)));

assert(refs.length >= 120, 'migration map must retain the published documentation index');
assert.deepStrictEqual(missing, [], 'every documented docs path must exist');
assert(migrationMap.includes('Branch2-only safety checkpoint'), 'latest Branch2 safety checkpoint must be recorded');
assert(migrationMap.includes('Extracted-file hygiene checkpoint'), 'latest hygiene checkpoint must be recorded');
assert(migrationMap.includes('Stylesheet-reference audit checkpoint'), 'stylesheet checkpoint must be recorded');
assert(migrationMap.includes('Module-script reference audit checkpoint'), 'module reference checkpoint must be recorded');
assert(migrationMap.includes('Inline-handler surface audit checkpoint'), 'inline handler checkpoint must be recorded');

console.log('MIGRATION_MAP_REFERENCE_HARNESS=PASS');
console.log(`DOC_REFERENCES=${refs.length}`);
console.log('MISSING_REFERENCES=0');
