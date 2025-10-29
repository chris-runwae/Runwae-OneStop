// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);

// Explicitly merge the transformer for NativeWind
module.exports = withNativeWind({
  ...defaultConfig,
  transformer: {
    ...defaultConfig.transformer,
    // required by NativeWind
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
}, { input: './global.css' });
