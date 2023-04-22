import React from "react";
import { SafeAreaView, View, Text, Image, ScrollView } from "react-native";

import { COLORS, FONTS, images } from "../../constants";
import { Button } from "../../components";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
export const MyWallet = ({ navigation }) => {
  const connector = useWalletConnect();

  const killSession = React.useCallback(() => {
    return connector.killSession();
  }, [connector]);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Text
          className="text-center text-white text-4xl"
          style={{ fontWeight: "700" }}
        >
          My Wallet
        </Text>
      </SafeAreaView>
      <ScrollView
        style={{
          backgroundColor: COLORS.backColar,
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          marginBottom: 100,
        }}
      >
        <View
          style={{
            marginTop: -100,
            marginHorizontal: "30%",
          }}
        >
          {/* <Image
            source={images.user_icon}
            resizeMode="center"
            style={{
              justifyContent: "center",
              alignSelf: "center",
            }}
          /> */}
          <Text
            className="text-center text-white text-4xl"
            style={{ fontWeight: "700" }}
          >
            Wallet Address
          </Text>

          <Text
            className="text-center text-white text-4xl"
            style={{ fontWeight: "700" }}
          >
            {connector.accounts}
          </Text>
        </View>
        <SafeAreaView>
          {connector.connected && (
            <Button
              title="Disconnect"
              type="outline"
              buttonStyle={styles.button}
              titleStyle={styles.buttonTitle}
              onPress={killSession}
            />
          )}
          {!killSession && navigation.navigate("Login")}
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

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
});
