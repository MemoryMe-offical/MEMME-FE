#!/usr/bin/env node
/**
 * Release build - JS bundle is included in the APK, no Metro needed.
 * Always clears Metro/Babel cache to ensure .env changes are reflected.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

// 1. Clear Metro/Babel cache so .env changes are always picked up
const cacheDir = path.join(projectRoot, 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  console.log('Clearing Metro/Babel cache...');
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('Cache cleared.\n');
}

// 2. Clean previous Gradle build output
console.log('Cleaning Gradle build...');
run('.\\gradlew.bat clean', { cwd: androidDir });

// 3. Build Release APK (Metro bundler runs with --reset-cache via extraPackagerArgs)
console.log('Building Release APK...');
run('.\\gradlew.bat app:assembleRelease', { cwd: androidDir });

console.log('\nPushing APK to device...');
run(`adb push "${apkPath}" /data/local/tmp/app-release.apk`);

console.log('\nInstalling APK...');
run('adb shell pm install -r /data/local/tmp/app-release.apk');

console.log('\nLaunching app...');
run('adb shell am start -n com.memme/.MainActivity');

console.log('\nDone! Release app is running (no Metro needed).');
