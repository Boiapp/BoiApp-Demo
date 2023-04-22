import "react-native-get-random-values";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  Alert,
  View,
  useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext, store } from "common/src";
import { Button, Image } from "react-native-elements";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import i18n from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../common/theme";
import "@walletconnect/react-native-compat";
import SignClient from "@walletconnect/sign-client";

export default function Welcome(props) {
  const { api, config } = useContext(FirebaseContext);
  const { clearLoginError, walletSignIn, checkUserExists } = api;
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t } = i18n;
  const [isRTL, setIsRTL] = useState();
  const { width, height } = useWindowDimensions();
  const [langSelection, setLangSelection] = useState();
  const languagedata = useSelector((state) => state.languagedata);
  const pageActive = useRef(false);
  const [loading, setLoading] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [connect, setConnect] = useState(false);
  const [signClient, setSignClient] = useState();

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

  async function createClient() {
    const client = await SignClient.init({
      projectId: "df2f9c8bbe8321067bc9228e7258375b",
      relayUrl: "wss://relay.walletconnect.com",
    });
    try {
      setSignClient(client);
    } catch (e) {
      console.log({ err: e });
    }
  }

  async function subscribeToEvents(client) {
    if (!client) {
      throw Error("No events to subscribe to b/c the client does not exist");
    }

    try {
      client.on("session_delete", () => {
        console.log("user disconnected the session from their wallet");
      });
    } catch (e) {
      console.log(e);
    }
  }

  //Login wallet
  const connector = useWalletConnect();
  let walletAddress = connector.connected ? connector.accounts[0] : null;
  const connectWallet = useCallback(async () => {
    await connector.connect().then((res) => {
      setConnect(true);
    });
    try {
      if (!connect || !connector.connected) {
        return await connector.createSession({ chainId: 80001 });
      }
    } catch (e) {
      console.log("catch", e);
    }
    return;
  }, [connector]);

  const handleRegister = () => {
    props.navigation.navigate("Register");
  };

  const handleSignOut = async () => {
    await connector.killSession().then((res) => {
      setConnect(false);
    });
  };

  const handleSignIn = async () => {
    if (auth.token !== null && walletAddress !== null) {
      setLoading(true);
      pageActive.current = true;
      await dispatch(api.fetchUser(auth.token));
    } else {
      Alert.alert(t("alert"), t("otp_blank_error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connect) {
      walletAddress = connector.accounts[0];
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
              .catch((err) => console.log("err", err));
          } else if (res.error?.code === "auth/user-not-found") {
            setLoading(false);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log("err", err);
        });
    }
  }, [connector.connected, connect, walletAddress]);

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
        {(!connect || !connector.connected) && (
          <Button
            title="Iniciar"
            type="outline"
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
            onPress={connectWallet}
            loading={false}
          />
        )}
        {connect && connector.connect && userExists && (
          <Button
            title="Acceder"
            type="outline"
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
            onPress={handleSignIn}
            loading={loading}
          />
        )}
        {connect && connector.connect && !auth.token && !userExists && (
          <Button
            title={t("sign_up")}
            type="outline"
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
            onPress={handleRegister}
            loading={loading}
          />
        )}
        {connect && connector.connect && (
          <Button
            title={t("disconnect")}
            type="outline"
            buttonStyle={styles.button}
            titleStyle={styles.buttonTitle}
            onPress={handleSignOut}
            loading={false}
          />
        )}
        <Button
          title="Necesitas ayuda?"
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
    marginBottom: 10,
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
});
