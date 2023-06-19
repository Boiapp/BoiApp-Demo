const { getDefaultConfig } = require("@expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve("stream-browserify"),
  crypto: require.resolve("crypto-browserify"),
  randombytes: require.resolve("react-native-randombytes"),
};

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "cjs",
  "mjs",
  "js",
  "json",
  "ts",
  "tsx",
  "jsx",
];

module.exports = config;
