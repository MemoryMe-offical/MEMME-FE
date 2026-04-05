#!/usr/bin/env node
/**
 * Android 16 workaround: adb streaming install is broken on Android 16.
 * This script builds the APK and installs via push+pm install instead.
 */
const { execSync, spawn } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const androidDir = path.join(projectRoot, 'android');
const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

// 1. Build APK
console.log('\nBuilding APK...');
run('.\\gradlew.bat app:assembleDebug -PreactNativeDevServerPort=8081', { cwd: androidDir });

// 3. ADB reverse for Metro
console.log('\nSetting up ADB reverse...');
run('adb reverse tcp:8081 tcp:8081');

// 4. Push APK to device
console.log('\nPushing APK to device...');
run(`adb push "${apkPath}" /data/local/tmp/app-debug.apk`);

// 4. Install from device storage
console.log('\nInstalling APK...');
run('adb shell pm install -r /data/local/tmp/app-debug.apk');

// 5. Launch app
console.log('\nLaunching app...');
run('adb shell am start -n com.memme/.MainActivity');

console.log('\nApp launched! Now run Metro in a separate terminal:');
console.log('  npx react-native start');
