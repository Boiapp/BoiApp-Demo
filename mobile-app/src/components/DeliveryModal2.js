import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../common/theme";
import i18n from "i18n-js";
import { Button, Image } from "react-native-elements";
import { useWindowDimensions } from "react-native";

export default function DeliveryModal2(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const [token, setToken] = useState("USDT");
  const {
    settings,
    estimate,
    bookingModalStatus,
    onPressCancel,
    bookNow,
    profile,
    contractLoading,
    tripDrop,
    tripPickup,
    tripCar,
  } = props;

  return (
    <Modal animationType="fade" transparent={true} visible={bookingModalStatus}>
      <View style={styles.centeredView}>
        <KeyboardAvoidingView behavior={"position"}>
          <View style={styles.modalView}>
            <Text
              style={{
                color: colors.BLUE,
                fontWeight: "800",
                fontSize: 36,
                lineHeight: 40,
                marginHorizontal: 16,
              }}
            >
              Confirma tu viaje
            </Text>

            <View style={styles.textInputContainerStyle}>
              <View
                style={{
                  flexDirection: "row",
                  w: "100%",
                  paddingHorizontal: 64,
                  marginVertical: 8,
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.hbox1}>
                  <View style={styles.hbox1_1} />
                </View>
                <View style={styles.hbox2} />
                <View style={styles.hbox3}>
                  <View style={styles.hbox3_1} />
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <View
                  style={{
                    marginRight: 4,
                    flexShrink: 1,
                    width: 150,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 14,
                      fontWeight: "700",
                      color: "white",
                      textAlign: "center",
                    }}
                  >
                    {tripPickup?.add?.split(",")[0]}
                  </Text>
                  <Text
                    style={{
                      marginHorizontal: 20,
                      fontSize: 12,
                      lineHeight: 16,
                      fontWeight: "700",
                      color: colors.SLATE,
                      textAlign: "center",
                    }}
                  >
                    Ubicación
                  </Text>
                </View>
                <View
                  style={{
                    marginLeft: 10,
                    flexShrink: 1,
                    width: 150,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      lineHeight: 14,
                      color: colors.WHITE,
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    {tripDrop?.add?.split(",")[0]}
                  </Text>
                  <Text
                    style={{
                      marginHorizontal: 20,
                      fontSize: 12,
                      lineHeight: 16,
                      fontWeight: "700",
                      color: colors.SLATE,
                      textAlign: "center",
                    }}
                  >
                    Destino
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "center",
                  marginHorizontal: 85,
                  paddingVertical: 16,
                  width: 140,
                }}
              >
                <Text style={{ color: colors.SLATE, textAlign: "center" }}>
                  Pasajero
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    lineHeight: 28,
                    color: colors.LIGHT_SLATE,
                  }}
                >
                  {profile?.firstName + " " + profile?.lastName}
                </Text>
              </View>
            </View>
            {/* <View style={styles.textInputContainerStyle}>
              <Input
                editable={true}
                underlineColorAndroid={colors.TRANSPARENT}
                placeholder={t("deliveryInstructions")}
                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                value={instructionData.deliveryInstructions}
                keyboardType={"email-address"}
                inputStyle={[
                  styles.inputTextStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
                onChangeText={(text) => {
                  setInstructionData({
                    ...instructionData,
                    deliveryInstructions: text,
                  });
                }}
                inputContainerStyle={styles.inputContainerStyle}
                containerStyle={styles.textInputStyle}
              />
            </View> */}

            <View
              style={{
                marginTop: 8,
                flexDirection: "column",
                marginHorizontal: 95,
                height: 80,
              }}
            >
              <Text style={{ color: colors.BLUE, textAlign: "center" }}>
                {tripCar?.name}
              </Text>
              <View
                style={{
                  width: 120,
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#E2e8f0",
                  borderRadius: 9,
                }}
              >
                <Image
                  source={
                    tripCar?.image
                      ? { uri: tripCar?.image }
                      : require("../../assets/images/microBlackCar.png")
                  }
                  resizeMode="contain"
                  style={styles.cardItemImagePlace}
                />
              </View>
            </View>
            {estimate && (
              <View style={styles.rateViewStyle}>
                <View
                  style={{
                    flexDirection: "row",
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "#E2E8F0",
                    borderRadius: 8,
                    width: 120,
                    gap: 10,
                    marginVertical: 12,
                  }}
                >
                  <Image
                    source={require("../../assets/images/USDT.png")}
                    resizeMode="contain"
                    style={{ width: 40, marginVertical: 10 }}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      lineHeight: 28,
                      fontWeight: "700",
                      color: colors.SLATE,
                      marginVertical: 10,
                    }}
                  >
                    {settings.symbol}
                    {estimate.estimateFare > 0
                      ? parseFloat(estimate.estimateFare).toFixed(
                          settings.decimal
                        )
                      : 0}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignSelf: "center",
                height: 40,
              }}
            >
              <Button
                loading={false}
                onPress={onPressCancel}
                title={t("cancel")}
                buttonStyle={[
                  styles.modalButtonStyle,
                  [isRTL ? { marginLeft: 5 } : { marginRight: 5 }],
                ]}
                titleStyle={styles.modalButtonTextStyle}
              />
              {/* <Text style={styles.modalButtonTextStyle}></Text> */}
              <Button
                loading={contractLoading}
                onPress={bookNow}
                title={t("confirm")}
                buttonStyle={[
                  styles.modalButtonStyle,
                  [
                    isRTL
                      ? { marginRight: 5, backgroundColor: colors.BLUE }
                      : { marginLeft: 5, backgroundColor: colors.BLUE },
                  ],
                ]}
                titleStyle={styles.modalButtonTextStyle}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
  hbox1: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
  },
  hbox1_1: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: colors.BLUE,
    zIndex: 10,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  hbox2: {
    height: 2,
    width: 150,
    borderBottomColor: colors.WHITE,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    marginVertical: 6,
  },
  hbox3: {
    height: 16,
    width: 16,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
  },
  hbox3_1: {
    height: 8,
    width: 8,
    borderRadius: 8,
    backgroundColor: "#f77872",
    zIndex: 10,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  textInputContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: colors.BLUE,
    width: "100%",
    height: "auto",
    borderRadius: 9,
    marginTop: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.BACKGROUND_PRIMARY,
  },
  textInputStyle: {},
  modalButtonStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BUTTON_RIGHT,
    width: 100,
    height: 40,
    elevation: 0,
    borderRadius: 10,
  },
  modalButtonTextStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 18,
  },
  rateViewStyle: {
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 15,
  },
  rateViewTextStyle: {
    fontSize: 60,
    color: colors.BLUE,
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    textAlign: "center",
  },
  cardItemImagePlace: {
    width: 100,
    height: 60,
    borderRadius: 5,
  },
  pickerStyle: {
    marginVertical: 10,
    color: colors.BLUE,
    width: 130,
    fontSize: 24,
    height: 40,
    textAlign: "right",
    borderRadius: 10,
  },
});
