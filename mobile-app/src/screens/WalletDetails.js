import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Button,
  Pressable,
  Share,
  ToastAndroid,
} from "react-native";
import { Header, Icon } from "react-native-elements";
import { colors } from "../common/theme";
var { height, width } = Dimensions.get("window");
import i18n from "i18n-js";
import { useSelector } from "react-redux";
import { TouchableOpacity } from "react-native-gesture-handler";
import { DrawerActions } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-qr-code";

import RPC from "../etherRPC";

export default function WalletDetails(props) {
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const providers = useSelector((state) => state.paymentmethods.providers);
  const walletAddress = auth.info.profile.wallet;
  const [profile, setProfile] = useState();
  const [walletBalance, setWalletBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedWalletAddress, setCopiedWalletAddress] = useState("");
  const getBalance = useCallback(async () => {
    const balance = await RPC.getBalance(walletAddress);
    return balance;
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) {
      getBalance().then((balance) => {
        setWalletBalance(balance);
      });
    }
  }, [walletAddress]);

  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  useEffect(() => {
    if (auth.info && auth.info.profile) {
      setProfile(auth.info.profile);
    } else {
      setProfile(null);
    }
  }, [auth.info]);

  const doReacharge = () => {
    setModalVisible(true);
  };

  const doWithdraw = () => {
    if (
      !(profile.mobile && profile.mobile.length > 6) ||
      profile.email == " " ||
      profile.firstName == " " ||
      profile.lastName == " "
    ) {
      Alert.alert(t("alert"), t("profile_incomplete"));
      props.navigation.navigate("editUser");
    } else {
      if (parseFloat(auth.info.profile.walletBalance) > 0) {
        props.navigation.push("withdrawMoney", {
          userdata: { ...auth.info.profile, uid: auth.info.uid },
        });
      } else {
        Alert.alert(t("alert"), t("wallet_zero"));
      }
    }
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(walletAddress).then(() => {
      ToastAndroid.show("Copiado al portapapeles", ToastAndroid.SHORT);
    });
  };

  const onShareWallet = async () => {
    try {
      const result = await Share.share({
        message: walletAddress,
      });
      console.log(result);
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const walletBar = height / 4;

  const lCom = {
    icon: "md-menu",
    type: "ionicon",
    color: colors.WHITE,
    size: 30,
    component: TouchableWithoutFeedback,
    onPress: () => {
      props.navigation.dispatch(DrawerActions.toggleDrawer());
    },
  };
  const rCom =
    auth.info &&
    auth.info.profile &&
    (auth.info.profile.usertype == "driver" ||
      (auth.info.profile.usertype == "rider" &&
        settings &&
        settings.RiderWithDraw)) ? (
      <TouchableOpacity onPress={doWithdraw}>
        <Text style={{ color: colors.WHITE, marginTop: 5 }}>
          {t("withdraw")}
        </Text>
      </TouchableOpacity>
    ) : null;

  const ModalReceiveTokens = () => {
    return (
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={"position"}>
            <View style={styles.modalView}>
              {/* Close modal*/}
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  zIndex: 10,
                }}
              >
                <Icon
                  name="close"
                  type="material"
                  size={30}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  Recibir USDT
                </Text>
                <View
                  style={{
                    borderWidth: 10,
                    borderRadius: 30,
                    borderColor: colors.BLUE,
                    padding: 10,
                  }}
                >
                  <QRCode value={walletAddress} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    textAlign: "center",
                    width: 295,
                  }}
                >
                  {walletAddress}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <Pressable onPress={copyToClipboard} style={styles.button}>
                    <Text style={styles.text}>Copiar</Text>
                  </Pressable>
                  <Pressable onPress={onShareWallet} style={styles.button}>
                    <Text style={styles.text}>Compartir</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL ? rCom : lCom}
        rightComponent={isRTL ? lCom : rCom}
        centerComponent={
          <Text style={styles.headerTitleStyle}>{t("my_wallet_tile")}</Text>
        }
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={{ flex: 1, flexDirection: "column" }}>
        <View style={{ height: walletBar, marginBottom: 12 }}>
          <View>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-around",
                marginTop: 8,
              }}
            >
              <View
                style={{
                  height: walletBar - 50,
                  width: "48%",
                  backgroundColor: colors.BORDER_BACKGROUND,
                  borderRadius: 8,
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Text style={{ textAlign: "center", fontSize: 18 }}>
                  {t("wallet_ballance")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 25,
                      fontWeight: "500",
                      color: colors.BALANCE_GREEN,
                    }}
                  >
                    {settings.symbol}
                    {/* {auth.info && auth.info.profile
                      ? parseFloat(auth.info.profile.walletBalance).toFixed(
                          settings.decimal
                        )
                      : ""} */}
                    {walletBalance[0]}
                  </Text>
                  <Image
                    source={require("../../assets/images/USDT.png")}
                    resizeMode="contain"
                    style={{ width: 30 }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 25,
                      fontWeight: "500",
                      color: colors.BALANCE_GREEN,
                    }}
                  >
                    {/* {auth.info && auth.info.profile
                      ? parseFloat(auth.info.profile.walletBalance).toFixed(
                          settings.decimal
                        )
                      : ""} */}
                    {walletBalance[1]?.slice(0, 5)}
                  </Text>
                  <Image
                    source={require("../../assets/images/polygon-matic.png")}
                    style={{
                      width: 30,
                      height: 30,
                      alignItems: "center",
                      marginVertical: "auto",
                    }}
                  />
                </View>
              </View>
              {/* QR modal from wallet */}

              <TouchableWithoutFeedback onPress={doReacharge}>
                <View
                  style={{
                    height: walletBar - 50,
                    width: "48%",
                    backgroundColor: colors.BALANCE_GREEN,
                    borderRadius: 8,
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <Icon
                    name="add-circle"
                    type="MaterialIcons"
                    color={colors.WHITE}
                    size={45}
                    iconStyle={{ lineHeight: 48 }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 18,
                      color: colors.WHITE,
                    }}
                  >
                    {t("add_money")}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      </View>
      <ModalReceiveTokens />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BACKGROUND,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },

  textContainer: {
    textAlign: "center",
  },
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: 135,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: colors.BLUE,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
});
