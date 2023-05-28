import React from "react";
import { StyleSheet, ImageBackground, useWindowDimensions } from "react-native";

export default function Background(props) {
  const { width, height } = useWindowDimensions();
  return (
    <ImageBackground
      style={[
        styles.imgBackground,
        { width, height, backgroundColor: "#0069ff" },
      ]}
      resizeMode="cover"
      source={require("../../assets/images/background02.png")}
    >
      {props.children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imgBackground: {
    flex: 1,
  },
});
