import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import config from '../app.config.ts';
import { assertNativeRelease } from './release-policy.ts';

const kind = process.argv[2];
if (!['apk', 'aab'].includes(kind)) throw new Error('Expected apk or aab');
const root = resolve(import.meta.dirname, '..');
if (!existsSync(resolve(root, 'android', 'gradlew.bat'))) throw new Error('Run npm run prebuild:android first');
const windows = process.platform === 'win32';
if (kind === 'apk' && !windows) throw new Error('Internal signing is configured for this Windows development account.');
const native = spawnSync(windows ? 'npx.cmd' : 'npx', ['expo', 'prebuild', '--platform', 'android', '--no-clean', '--no-install'], { cwd: root, stdio: 'inherit', shell: windows });
if (native.error) throw native.error;
if (native.status !== 0) process.exit(native.status ?? 1);
assertNativeRelease(readFileSync(resolve(root, 'android/app/build.gradle'), 'utf8'), { applicationId: config.android.package, version: config.version, versionCode: config.android.versionCode });
const result = kind === 'apk'
  ? spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'RemoteSigned', '-File', resolve(root, 'scripts', 'build-internal.ps1')], { cwd: root, stdio: 'inherit' })
  : spawnSync(windows ? 'gradlew.bat' : './gradlew', ['app:bundleRelease', '--console=plain'], { cwd: resolve(root, 'android'), stdio: 'inherit', shell: windows });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
if (kind === 'apk') {
  const verified = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'RemoteSigned', '-File', resolve(root, 'scripts/verify-apk.ps1'), '-ApplicationId', config.android.package, '-Version', config.version, '-VersionCode', String(config.android.versionCode)], { cwd: root, stdio: 'inherit' });
  if (verified.error) throw verified.error;
  process.exitCode = verified.status ?? 1;
}
