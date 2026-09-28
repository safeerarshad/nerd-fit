import test from 'node:test';
import assert from 'node:assert/strict';
import { assertNativeRelease } from '../../../scripts/release-policy.ts';
const expected = { applicationId: 'dev.safeerarshad.nerdfit', version: '0.1.0', versionCode: 1 };
const valid = `applicationId 'dev.safeerarshad.nerdfit'
versionName "0.1.0"
versionCode 1
android.buildTypes.release.signingConfig = null
android.buildTypes.release.signingConfig = android.signingConfigs.nerdFitInternal
android.buildTypes.release.debuggable = false
bundleCommand = "export:embed"`;
test('native release matches requested identity and standalone safeguards', () => assert.doesNotThrow(() => assertNativeRelease(valid, expected)));
for (const [name, from, to] of [
  ['stale package', 'dev.safeerarshad.nerdfit', 'dev.nerdfit.preview'],
  ['stale version', '0.1.0', '0.0.9'],
  ['stale build', 'versionCode 1', 'versionCode 0'],
  ['debug identity', 'android.signingConfigs.nerdFitInternal', 'android.signingConfigs.debug'],
  ['debuggable', 'debuggable = false', 'debuggable = true'],
  ['no bundle', 'export:embed', 'start'],
]) test(`rejects ${name}`, () => assert.throws(() => assertNativeRelease(valid.replace(from!, to!), expected), /Native release/));
