module.exports = {
    project: {
      ios: {},
      android: {},
    },
    assets: ['./src/assets/fonts/'],
    dependencies: {
      '@react-native-firebase/app': {
        platforms: {
          android: {
            packageImportPath: 'import io.invertase.firebase.app.ReactNativeFirebaseAppPackage;',
            packageInstance: 'new io.invertase.firebase.app.ReactNativeFirebaseAppPackage()',
          },
        },
      },
    },
  };