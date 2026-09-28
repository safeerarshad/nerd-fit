export function assertNativeRelease(gradle: string, expected: { applicationId: string; version: string; versionCode: number }): void {
  const checks: [boolean, string][] = [
    [/applicationId\s+['"]([^'"]+)['"]/.exec(gradle)?.[1] === expected.applicationId, 'application ID'],
    [/versionName\s+['"]([^'"]+)['"]/.exec(gradle)?.[1] === expected.version, 'version'],
    [Number(/versionCode\s+(\d+)/.exec(gradle)?.[1]) === expected.versionCode, 'versionCode'],
    [gradle.includes('android.buildTypes.release.signingConfig = null') && gradle.includes('android.buildTypes.release.signingConfig = android.signingConfigs.nerdFitInternal'), 'internal signing'],
    [gradle.includes('android.buildTypes.release.debuggable = false'), 'debug disabled'],
    [/bundleCommand\s*=\s*['"]export:embed['"]/.test(gradle), 'bundled JavaScript'],
  ];
  const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
  if (failures.length) throw new Error(`Native release configuration mismatch: ${failures.join(', ')}. Regenerate native files.`);
}
