import { DrawerActions } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import i18n from "i18n-js";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Header, Icon, Input } from "react-native-elements";
import { TouchableOpacity } from "react-native-gesture-handler";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { colors } from "../common/theme";
var { height, width } = Dimensions.get("window");
import { ConnectionMode } from "../types/types";

import RPC from "../etherRPC";

const ModalWithdrawTokens = (props) => {
  const { modalWithdrawVisible, setModalWithdrawVisible, walletBalance, pkey } =
    props;
  const [amount, setAmount] = useState("0");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const doWithdraw = () => {
    if (amount == "" || withdrawAddress == "") {
      ToastAndroid.show("Por favor, rellene todos los campos", 2000);
      return;
    }
    if (parseFloat(amount) > parseFloat(walletBalance[0])) {
      ToastAndroid.show("No tienes suficientes fondos", 2000);
      return;
    }
    setLoadingWithdraw(true);
    RPC.sendTransaction(pkey, withdrawAddress, amount)
      .then((result) => {
        if (result) {
          ToastAndroid.show("Transacción enviada", ToastAndroid.SHORT);
          setModalWithdrawVisible(!modalWithdrawVisible);
          setLoadingWithdraw(false);
          setAmount("0");
          setWithdrawAddress("");
        } else {
          ToastAndroid.show("Error al enviar transacción", ToastAndroid.SHORT);
          setModalWithdrawVisible(!modalWithdrawVisible);
          setLoadingWithdraw(false);
          setAmount("0");
          setWithdrawAddress("");
        }
      })
      .catch((error) => {
        ToastAndroid.show("Error al enviar transacción", ToastAndroid.SHORT);
        setModalWithdrawVisible(!modalWithdrawVisible);
        setLoadingWithdraw(false);
        setAmount("0");
        setWithdrawAddress("");
      });
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalWithdrawVisible}
    >
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
                  setModalWithdrawVisible(!modalWithdrawVisible);
                }}
              />
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Retirar USDT</Text>
              {/* Saldo */}
              <View style={styles.modalBalanceContainer}>
                <Text style={styles.labelStyle}>Saldo:</Text>
                <Text style={styles.labelStyle}>{walletBalance[0]} USDT</Text>
              </View>
              {/*  Inputs  */}
              <View style={styles.inputsContainer}>
                <View style={styles.inputAndLabelContainer}>
                  <Text style={styles.labelStyle}>Cantidad:</Text>
                  <Input
                    style={styles.inputStyle}
                    onChangeText={(text) => {
                      setAmount(text);
                    }}
                    value={amount}
                    keyboardType="numeric"
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholderTextColor={colors.BLUE}
                    inputStyle={styles.inputTextStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    key={1}
                  />
                </View>
                <View
                  style={[
                    styles.inputAndLabelContainer,
                    {
                      gap: 4,
                    },
                  ]}
                >
                  <Text style={styles.labelStyle}>Dirección:</Text>
                  <Input
                    style={styles.inputStyle}
                    onChangeText={(text) => setWithdrawAddress(text)}
                    inputContainerStyle={styles.inputContainerStyle}
                    value={withdrawAddress}
                    keyboardType="default"
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholderTextColor={colors.BLUE}
                    inputStyle={styles.inputTextStyle}
                    key={2}
                  />
                </View>
              </View>
              <View style={styles.modalBalanceContainer}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Total:</Text>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {amount} USDT
                </Text>
              </View>
              <Button
                title="Retirar"
                loading={loadingWithdraw}
                loadingProps={{ size: 10 }}
                titleStyle={styles.buttonTitleStyle}
                onPress={doWithdraw}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainer}
                icon={{
                  name: "cash-fast",
                  type: "material-community",
                  size: 28,
                  color: colors.WHITE,
                }}
                iconRight
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default function WalletDetails(props) {
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const providers = useSelector((state) => state.paymentmethods.providers);
  const walletAddress = auth.info?.profile?.wallet;
  const [profile, setProfile] = useState();
  const connectionMode = auth ? auth.info?.connectionMode : null;
  const [walletBalance, setWalletBalance] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedWalletAddress, setCopiedWalletAddress] = useState("");
  const [modalWithdrawVisible, setModalWithdrawVisible] = useState(false);
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
  }, [walletAddress, modalWithdrawVisible]);

  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  useEffect(() => {
    if (auth.info && auth.info?.profile) {
      setProfile(auth.info.profile);
    } else {
      setProfile(null);
    }
  }, [auth.info]);

  const refetchBalance = () => {
    getBalance().then((balance) => {
      setWalletBalance(balance);
    });
  };

  const doReacharge = () => {
    setModalVisible(true);
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
    ConnectionMode.WEB3AUTH === connectionMode &&
    (auth.info.profile.usertype == "driver" ||
      (auth.info.profile.usertype == "rider" &&
        settings &&
        settings.RiderWithDraw)) ? (
      <TouchableOpacity
        onPress={() => {
          setModalWithdrawVisible(true);
        }}
      >
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
                  <QRCode value={walletAddress ? walletAddress : ""} />
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ textAlign: "center", fontSize: 18 }}>
                    {t("wallet_ballance")}
                  </Text>
                  {/* Refetch */}
                  <Button
                    onPress={refetchBalance}
                    icon={{
                      name: "refresh",
                      type: "material",
                      size: 20,
                      color: colors.BALANCE_GREEN,
                    }}
                    buttonStyle={{
                      backgroundColor: colors.TRANSPARENT,
                      borderRadius: 50,
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                    }}
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
                    {settings.symbol}
                    {walletBalance[0] !== undefined
                      ? parseFloat(walletBalance[0]).toFixed(settings.decimal)
                      : "0"}
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
      <ModalWithdrawTokens
        modalWithdrawVisible={modalWithdrawVisible}
        setModalWithdrawVisible={setModalWithdrawVisible}
        walletAddress={walletAddress}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        pkey={auth.info?.profile?.pkey}
      />
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
    width: 350,
    backgroundColor: "white",
    justifyContent: "center",
    alignContent: "center",
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
  modalBalanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  modalContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputsContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  inputAndLabelContainer: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 10,
  },
  inputStyle: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputContainerStyle: {
    width: 200,
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
  labelStyle: { fontSize: 20, fontWeight: "bold" },
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
  buttonContainer: {
    height: 50,
    alignItems: "center",
    backgroundColor: colors.ORANGE,
    borderRadius: 15,
  },
  buttonStyle: {
    height: 50,
    width: 150,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "auto",
    backgroundColor: colors.ORANGE,
  },
  buttonTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 18,
    elevation: 2,
  },
});
