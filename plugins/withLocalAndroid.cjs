const { withAppBuildGradle } = require('expo/config-plugins');

// Release artifacts are unsigned until the owner supplies release signing.
// Never silently inherit the generated template's debug identity.
module.exports = function withLocalAndroid(config) {
  return withAppBuildGradle(config, (result) => {
    const marker = '// Nerd Fit: release signing is configured by the owner, never debug.';
    if (!result.modResults.contents.includes(marker)) {
      result.modResults.contents += `\n${marker}\nandroid.buildTypes.release.signingConfig = null\n`;
    }
    const signingMarker = '// Nerd Fit stable internal testing identity';
    if (!result.modResults.contents.includes(signingMarker)) {
      result.modResults.contents += `
${signingMarker}
def nerdFitInternalKey = System.getenv('NERDFIT_INTERNAL_KEYSTORE')
def nerdFitInternalPassword = System.getenv('NERDFIT_STORE_PASSWORD')
if (nerdFitInternalKey && nerdFitInternalPassword) {
    android.signingConfigs.create('nerdFitInternal') {
        storeFile file(nerdFitInternalKey)
        storePassword nerdFitInternalPassword
        keyAlias 'nerd-fit-internal'
        keyPassword nerdFitInternalPassword
    }
    android.buildTypes.release.signingConfig = android.signingConfigs.nerdFitInternal
}
android.buildTypes.release.debuggable = false
`;
    }
    return result;
  });
};
