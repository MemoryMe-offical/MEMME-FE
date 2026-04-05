#!/usr/bin/env node
/**
 * Release build - JS bundle is included in the APK, no Metro needed.
 */
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

console.log('Building Release APK...');
run('.\\gradlew.bat app:assembleRelease', { cwd: androidDir });

console.log('\nPushing APK to device...');
run(`adb push "${apkPath}" /data/local/tmp/app-release.apk`);

console.log('\nInstalling APK...');
run('adb shell pm install -r /data/local/tmp/app-release.apk');

console.log('\nLaunching app...');
run('adb shell am start -n com.memme/.MainActivity');

console.log('\nDone! Release app is running (no Metro needed).');
