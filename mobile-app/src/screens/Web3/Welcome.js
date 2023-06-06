import AsyncStorage from "@react-native-async-storage/async-storage";
import "@walletconnect/react-native-compat";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { FirebaseContext, store } from "common/src";
import Constants, { AppOwnership } from "expo-constants";
import * as Linking from "expo-linking";
import i18n from "i18n-js";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Alert,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, Icon, Image } from "react-native-elements";
import "react-native-get-random-values";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../common/theme";
import Web3Auth, {
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from "@web3auth/react-native-sdk";
import * as WebBrowser from "expo-web-browser";

const resolvedRedirectUrl =
  Constants.appOwnership == AppOwnership.Expo ||
  Constants.appOwnership == AppOwnership.Guest
    ? Linking.createURL("boiapp", {})
    : Linking.createURL("boiapp", { scheme: scheme });

const clientId =
  "BHfljXu1a2K3_4YjSJC5T_kpY0Pl5-7jmR36JXD7hEWpqe-HkRhHr4neH-kpMX84YmJSDxr0tiIwF_iy2N9jtdo";

import RPC from "../../etherRPC";
import { ConnectionMode } from "../../types/types";

export default function Welcome(props) {
  const { api } = useContext(FirebaseContext);
  const { clearLoginError, walletSignIn, checkUserExists } = api;
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t } = i18n;
  const [isRTL, setIsRTL] = useState();
  const { width, height } = useWindowDimensions();
  const [langSelection, setLangSelection] = useState();
  const pageActive = useRef(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [connectByWc, setConnectByWc] = useState(false);
  const [connectByW3A, setConnectByW3A] = useState(false);
  const [connectionMode, setConnectionMode] = useState("");

  /* Web3Auth */
  const [walletAddress, setWalletAddress] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [web3Auth, setWeb3Auth] = useState(null);

  const login = async (signInVia) => {
    try {
      const web3auth = new Web3Auth(WebBrowser, {
        clientId,
        network: OPENLOGIN_NETWORK.TESTNET, // or other networks
        whiteLabel: {
          name: "Boi App",
          defaultLanguage: "es",
          dark: true,
          theme: {
            primary: colors.BLUE,
          },
        },
      });
      setWeb3Auth(web3auth);
      const info = await web3auth.login({
        loginProvider: signInVia,
        redirectUrl: resolvedRedirectUrl,
      });
      setUserInfo([info.userInfo, info.privKey]);
      const walletAddress = await getAccounts(info.privKey);
      setWalletAddress(walletAddress);
      setConnectByW3A(true);
      setConnectionMode(ConnectionMode.WEB3AUTH);
    } catch (e) {
      console.log("error", e);
    }
  };

  const getAccounts = async (key) => {
    const address = await RPC.getAccounts(key);
    return address;
  };

  useEffect(() => {
    AsyncStorage.getItem("lang", (err, result) => {
      if (result) {
        const langLocale = JSON.parse(result)["langLocale"];
        setIsRTL(langLocale == "he" || langLocale == "ar");
        setLangSelection(langLocale);
      } else {
        setIsRTL(
          i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0
        );
        setLangSelection(i18n.locale);
      }
    });
  }, []);

  /* WalletConnect */
  const connector = useWalletConnect();
  const connectWallet = useCallback(async () => {
    await connector.connect().then((res) => {
      setConnectByWc(true);
      setWalletAddress(res.accounts[0]);
      setConnectionMode(ConnectionMode.WALLETCONNECT);
    });
    try {
      if (!connectByWc || !connector.connected) {
        return await connector.createSession({ chainId: 80001 });
      }
    } catch (e) {
      console.log("catch", e);
    }
    return;
  }, [connector]);

  const handleRegister = () => {
    props.navigation.navigate("Register", {
      walletAddress,
      connectByWc,
      connectByW3A,
      userInfo: userInfo !== "" ? userInfo : null,
    });
  };

  const handleSignOut = async () => {
    if (connector.connected && connectByWc) {
      await connector.killSession().then(() => {
        setConnectByWc(false);
      });
    }
    if (connectByW3A) {
      web3Auth.logout();
      setConnectByW3A(false);
    }
    setUserExists(false);
  };

  const handleSignIn = async () => {
    if (auth.token !== null && walletAddress !== null) {
      setLoading(true);
      pageActive.current = true;
      await dispatch(api.fetchUser(auth.token, connectionMode));
    } else {
      Alert.alert(t("alert"), t("otp_blank_error"));
      setLoading(false);
    }
  };

  const handleCheckUserExists = useCallback(async () => {
    if (
      (connectByW3A && walletAddress !== "") ||
      (connectByWc && walletAddress !== "")
    ) {
      const walletId = {
        wallet: walletAddress,
      };
      setLoading(true);
      checkUserExists(walletId)
        .then(async (res) => {
          if (res.user?.uid) {
            setUserExists(true);
            await walletSignIn(walletAddress)
              .then(async (res) => {
                if (res.token) {
                  store.dispatch({
                    type: "SAVE_TOKEN",
                    payload: res.token,
                  });
                }
              })
              .catch((err) => console.log("err 190", err));
          } else if (res.error?.code === "auth/user-not-found") {
            setLoading(false);
          }
        })
        .catch((err) => console.log("err 195", err));
    }
  }, [connectByW3A, connectByWc, walletAddress]);

  useEffect(() => {
    handleCheckUserExists();
  }, [connectByW3A, connectByWc, walletAddress, handleCheckUserExists]);

  useEffect(() => {
    if (connector.connected && !connectByWc) {
      setConnectByWc(true);
      setWalletAddress(connector.accounts[0]);
    }
  }, [connector.connected, connector.accounts, connectByWc]);

  useEffect(() => {
    if (auth.token) {
      setLoading(false);
      setUserExists(true);
    }
    if (auth.info && pageActive.current) {
      pageActive.current = false;
      setLoading(false);
    }
    if (
      auth.error &&
      auth.error.msg &&
      pageActive.current &&
      auth.error.msg.message !== t("not_logged_in")
    ) {
      pageActive.current = false;
      if (auth.error.msg.message === t("require_approval")) {
        Alert.alert(t("alert"), t("require_approval"));
      } else {
        Alert.alert(t("alert"), t("login_error"));
      }
      dispatch(clearLoginError());
      setLoading(false);
    }
  }, [auth.info, auth.error, auth.error.msg, auth.token, userExists]);

  const ErrorTest = () => {
    throw new Error("I crashed!");
  };

  const unloggedInView = (
    <View style={styles.buttonAreaWC}>
      {!connectByWc && !connector.connected && (
        <Button
          title="Wallet"
          type="outline"
          buttonStyle={{
            gap: 10,
            flexDirection: "row",
            backgroundColor: "#ffffff",
            borderRadius: 10,
            padding: 10,
            width: 310,
            height: 50,
            justifyContent: "center",
            textAlign: "center",
          }}
          titleStyle={styles.buttonTitle}
          onPress={connectWallet}
          loading={false}
        />
      )}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          width: width,
          gap: 10,
          maxHeight: 112,
        }}
      >
        <TouchableOpacity
          onPress={() => login(LOGIN_PROVIDER.GOOGLE)}
          style={[
            styles.button,
            {
              width: 150,
            },
          ]}
        >
          <View style={styles.viewIcon}>
            <Icon
              name="google"
              type="font-awesome"
              color={colors.BLUE}
              size={20}
              containerStyle={styles.iconStyle}
            />
          </View>
          <Text style={styles.buttonTitle}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => login(LOGIN_PROVIDER.LINKEDIN)}
          style={[
            styles.button,
            {
              width: 150,
            },
          ]}
        >
          <View style={styles.viewIcon}>
            <Icon
              name="twitter"
              type="font-awesome"
              color={colors.BLUE}
              size={20}
              containerStyle={styles.iconStyle}
            />
          </View>
          <Text style={styles.buttonTitle}>Twitter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => login(LOGIN_PROVIDER.FACEBOOK)}
          style={[
            styles.button,
            {
              width: 150,
            },
          ]}
        >
          <View style={styles.viewIcon}>
            <Icon
              name="facebook"
              type="font-awesome"
              color={colors.BLUE}
              size={20}
              containerStyle={styles.iconStyle}
            />
          </View>
          <Text style={styles.buttonTitle}>Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => login(LOGIN_PROVIDER.APPLE)}
          style={[
            styles.button,
            {
              width: 150,
            },
          ]}
        >
          <View style={styles.viewIcon}>
            <Icon
              name="apple"
              type="font-awesome"
              color={colors.BLUE}
              size={20}
              containerStyle={styles.iconStyle}
            />
          </View>
          <Text style={styles.buttonTitle}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const loggedInView = (
    <View style={styles.buttonAreaConnect}>
      {userExists && (
        <Button
          title="Acceder"
          type="outline"
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={handleSignIn}
          loading={loading}
        />
      )}
      {(connectByWc && connector.connected) ||
        (connectByW3A && !userExists && (
          <Button
            title={t("sign_up")}
            type="outline"
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
            onPress={handleRegister}
            loading={loading}
          />
        ))}
      {connector.connected && (
        <Button
          title={t("disconnect")}
          type="outline"
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={handleSignOut}
          loading={false}
        />
      )}
      {connectByW3A && (
        <Button
          title={t("disconnect")}
          type="outline"
          buttonStyle={styles.button}
          titleStyle={styles.buttonTitle}
          onPress={handleSignOut}
          loading={false}
        />
      )}
    </View>
  );

  return (
    <ImageBackground
      source={require("../../../assets/images/background02.png")}
      style={{
        flex: 1,
        width: width,
        marginTop: -15,
        height: height + 30,
        justifyContent: "center",
        alignItems: "center",
        resizeMode: "cover",
        backgroundColor: colors.BLUE,
      }}
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{t("Welcome")}</Text>
        <Text style={styles.subtitle}>{t("description_welcome")}</Text>
        <Image
          source={require("../../../assets/images/navMap.png")}
          style={{ width: 400, height: 400 }}
        ></Image>
        {!connectByW3A && !connectByWc ? unloggedInView : loggedInView}
        <Button
          title="Necesitas ayuda?"
          type="clear"
          onPress={ErrorTest}
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
    display: "flex",
    gap: 10,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTitle: {
    color: colors.BLUE,
    fontSize: 20,
    fontWeight: "bold",
  },
  buttonSecondary: {
    color: "rgb(255, 255, 255)",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonAreaConnect: {
    gap: 10,
  },
  buttonAreaWC: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    minHeight: 175,
    gap: 10,
  },
  title: {
    // className="text-center text-white text-4xl"
    color: "rgb(255, 255, 255)",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    /* className="text-center text-white text-lg" */
    color: "rgb(255, 255, 255)",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  viewIcon: {
    width: 24,
    height: 24,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  iconStyle: {
    justifyContent: "center",
    alignItems: "center",
  },
});
