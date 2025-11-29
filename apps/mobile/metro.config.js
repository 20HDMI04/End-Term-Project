const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/**
 * Metro configuration for Expo + SVG transformer
 * This adapts the default Expo metro config to treat `.svg` as source
 * so `react-native-svg-transformer` can convert them to React components.
 */
const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const { assetExts, sourceExts } = config.resolver;

config.transformer = config.transformer || {};
config.transformer.babelTransformerPath = require.resolve(
	"react-native-svg-transformer"
);

config.resolver = config.resolver || {};
config.resolver.assetExts = assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...sourceExts, "svg"];

// Monorepo support
config.projectRoot = projectRoot;
config.watchFolders = [
	projectRoot,
	path.resolve(projectRoot, "../../node_modules"),
];

module.exports = config;
