import React, { useContext, useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext } from "common/src";
import { Button, Image } from "react-native-elements";

export default function SignUpWallet(props) {
  return (
    <ImageBackground
      source={require("../../../assets/images/background02.png")}
      style={{
        flex: 1,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
        justifyContent: "center",
      }}
      className="bg-[#6382FC]"
    >
      <SafeAreaView style={styles.container}>
        <Text
          className="text-center text-white text-4xl"
          style={{ fontWeight: "700" }}
        >
          Welcome to BOI
        </Text>
        <Text className="text-center text-white text-lg">
          Travel and pay with cryptocurrencies
        </Text>
        <Image
          source={require("../../../assets/images/navMap.png")}
          style={{ width: 300, height: 400 }}
        ></Image>
        <Button
          title="Sign Up"
          type="outline"
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={() => {
            props.navigation.navigate("Register");
          }}
        />
        <Button
          title="Need help?"
          type="clear"
          titleStyle={styles.buttonSecondary}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    width: 200,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTitle: {
    color: "#6382FC",
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonSecondary: {
    color: "rgb(255, 255, 255)",
    fontSize: 16,
    fontWeight: "bold",
  },
});
