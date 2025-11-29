const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration for Expo + SVG transformer
 * This adapts the default Expo metro config to treat `.svg` as source
 * so `react-native-svg-transformer` can convert them to React components.
 */
const config = getDefaultConfig(__dirname);

const { assetExts, sourceExts } = config.resolver;

config.transformer = config.transformer || {};
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver = config.resolver || {};
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...sourceExts, 'svg'];

module.exports = config;
