const { createMetroConfiguration } = require("expo-yarn-workspaces");
const config = createMetroConfiguration(__dirname);

config.resolver.extraNodeModules = {
  // ...config.resolver.extraNodeModules,
  // node_libs_react_native: require.resolve("node-libs-react-native"),
  stream: require.resolve("stream-browserify"),
  // http: require.resolve("stream-http"),
  // https: require.resolve("https-browserify"),
  // os: require.resolve("os-browserify/browser"),
  extraNodeModules: require("expo-crypto-polyfills"),
  randombytes: require.resolve("react-native-randombytes"),
};

// config.resolver.assetExts.push("cjs");

module.exports = config;
