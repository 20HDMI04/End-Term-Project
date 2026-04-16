const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.transformer.babelTransformerPath =
	require.resolve("react-native-svg-transformer");

config.resolver.assetExts = config.resolver.assetExts.filter(
	(ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

config.resolver.nodeModulesPaths = [
	path.resolve(projectRoot, "node_modules"),
	path.resolve(workspaceRoot, "node_modules"),
];

config.watchFolders = [workspaceRoot];

config.projectRoot = projectRoot;

module.exports = config;
