import React, { useState, useEffect, useContext } from "react";
import { RegistrationWeb3 } from "../../components";
import { StyleSheet, View, Alert, Text } from "react-native";
import { useSelector } from "react-redux";

import i18n from "i18n-js";
import { FirebaseContext, store } from "common/src";

export default function RegistrationScreen(props) {
  const { api } = useContext(FirebaseContext);
  const { mainSignUp, validateReferer, checkUserExists } = api;
  const [loading, setLoading] = useState(false);
  const cars = useSelector((state) => state.cartypes.cars);
  const [carTypes, setCarTypes] = useState(null);

  const { walletAddress, connectByWc, connectByW3A, userInfo } =
    props.route.params;

  const { t } = i18n;

  useEffect(() => {
    if (cars) {
      let arr = [];
      for (let i = 0; i < cars.length; i++) {
        arr.push({ label: cars[i].name, value: cars[i].name });
      }
      setCarTypes(arr);
    }
  }, [cars]);

  const clickRegister = async (regData) => {
    setLoading(true);
    checkUserExists(regData).then((res) => {
      if (res.user && res.user.uid) {
        setLoading(false);
        Alert.alert(t("alert"), t("user_exists"));
      } else if (
        res.error.message !==
        "There is no user record corresponding to the provided identifier."
      ) {
        setLoading(false);
        Alert.alert(t("alert"), t("email_or_mobile_issue"));
      } else {
        if (regData.referralId && regData.referralId.length > 0) {
          validateReferer(regData.referralId)
            .then((referralInfo) => {
              if (referralInfo.uid) {
                mainSignUp({
                  ...regData,
                  signupViaReferral: referralInfo.uid,
                }).then((res) => {
                  setLoading(false);
                  if (res.uid) {
                    Alert.alert(t("alert"), t("account_create_successfully"));
                    props.navigation.goBack();
                  } else {
                    Alert.alert(t("alert"), t("reg_error"));
                  }
                });
              } else {
                setLoading(false);
                Alert.alert(t("alert"), t("referer_not_found"));
              }
            })
            .catch((error) => {
              setLoading(false);
              Alert.alert(t("alert"), t("referer_not_found"));
            });
        } else {
          mainSignUp(regData).then((res) => {
            setLoading(false);
            store.dispatch({
              type: "SAVE_TOKEN",
              payload: res.token,
            });
            if ((res.uid && connectByWc) || (res.uid && connectByW3A)) {
              Alert.alert(t("alert"), t("account_create_successfully"));
              props.navigation.goBack();
            } else {
              Alert.alert(t("alert"), t("reg_error"));
            }
          });
        }
      }
    });
  };

  return (
    <View style={styles.containerView}>
      {carTypes ? (
        <RegistrationWeb3
          cars={carTypes}
          onPressRegister={(regData) => clickRegister(regData)}
          onPressBack={() => {
            props.navigation.goBack();
          }}
          loading={loading}
          walletAddress={walletAddress}
          connectByWc={connectByWc}
          connectByW3A={connectByW3A}
          userInfo={userInfo}
        ></RegistrationWeb3>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  containerView: { flex: 1 },
  textContainer: { textAlign: "center" },
});
