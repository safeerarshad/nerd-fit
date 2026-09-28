import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const cases = [
  { key: false, password: false, published: false, allowed: true, create: true },
  { key: true, password: true, published: true, allowed: true, create: false },
  { key: true, password: false, published: false, allowed: false },
  { key: false, password: true, published: false, allowed: false },
  { key: false, password: false, published: true, allowed: false },
];
for (const item of cases) test(`signing identity key=${item.key} password=${item.password} previouslyRecorded=${item.published}`, { skip: process.platform !== 'win32' }, () => {
  const command = `. './scripts/signing-policy.ps1'; $ErrorActionPreference='Stop'; Assert-SigningPair -KeyExists $${item.key} -PasswordExists $${item.password} -PublishedIdentityExists $${item.published}`;
  const result = spawnSync('powershell.exe', ['-NoProfile','-ExecutionPolicy','RemoteSigned','-Command',command], { encoding:'utf8' });
  assert.equal(result.error, undefined);
  assert.equal(result.status === 0, item.allowed, result.stderr);
  if (item.allowed) assert.equal(result.stdout.trim(), item.create ? 'True' : 'False');
  else assert.match(result.stderr, /Signing credential/);
});
