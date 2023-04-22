import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { TouchableOpacity as OldTouch } from "react-native";
import { colors } from "../common/theme";
import i18n from "i18n-js";
import { Input } from "react-native-elements";

export default function DeliveryModal(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const {
    settings,
    estimate,
    bookingModalStatus,
    onPressCancel,
    bookNow,
    instructionData,
    setInstructionData,
  } = props;

  return (
    <Modal animationType="fade" transparent={true} visible={bookingModalStatus}>
      <View style={styles.centeredView}>
        <KeyboardAvoidingView behavior={"position"}>
          <View style={styles.modalView}>
            <View style={styles.textInputContainerStyle}>
              <Input
                editable={true}
                underlineColorAndroid={colors.TRANSPARENT}
                placeholder={t("deliveryPerson")}
                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                value={instructionData.deliveryPerson}
                keyboardType={"email-address"}
                inputStyle={[
                  styles.inputTextStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
                onChangeText={(text) => {
                  setInstructionData({
                    ...instructionData,
                    deliveryPerson: text,
                  });
                }}
                inputContainerStyle={styles.inputContainerStyle}
                containerStyle={styles.textInputStyle}
              />
            </View>
            <View style={styles.textInputContainerStyle}>
              <Input
                editable={true}
                underlineColorAndroid={colors.TRANSPARENT}
                placeholder={t("deliveryPersonPhone")}
                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                value={instructionData.deliveryPersonPhone}
                keyboardType={"number-pad"}
                inputStyle={[
                  styles.inputTextStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
                onChangeText={(text) => {
                  setInstructionData({
                    ...instructionData,
                    deliveryPersonPhone: text,
                  });
                }}
                inputContainerStyle={styles.inputContainerStyle}
                containerStyle={styles.textInputStyle}
              />
            </View>
            <View style={styles.textInputContainerStyle}>
              <Input
                editable={true}
                underlineColorAndroid={colors.TRANSPARENT}
                placeholder={t("pickUpInstructions")}
                placeholderTextColor={colors.DRIVER_TRIPS_TEXT}
                value={instructionData.pickUpInstructions}
                keyboardType={"email-address"}
                inputStyle={[
                  styles.inputTextStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
                onChangeText={(text) => {
                  setInstructionData({
                    ...instructionData,
                    pickUpInstructions: text,
                  });
                }}
                inputContainerStyle={styles.inputContainerStyle}
                containerStyle={styles.textInputStyle}
              />
            </View>
            <View style={styles.textInputContainerStyle}>
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
            </View>
            {estimate && (
              <View style={styles.rateViewStyle}>
                {settings.swipe_symbol === false ? (
                  <Text style={styles.rateViewTextStyle}>
                    {settings.symbol}
                    {estimate.estimateFare > 0
                      ? parseFloat(estimate.estimateFare).toFixed(
                          settings.decimal
                        )
                      : 0}
                  </Text>
                ) : (
                  <Text style={styles.rateViewTextStyle}>
                    {estimate.estimateFare > 0
                      ? parseFloat(estimate.estimateFare).toFixed(
                          settings.decimal
                        )
                      : 0}
                    {settings.symbol}
                  </Text>
                )}
              </View>
            )}
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignSelf: "center",
                height: 40,
              }}
            >
              <OldTouch
                loading={false}
                onPress={onPressCancel}
                style={[
                  styles.modalButtonStyle,
                  [isRTL ? { marginLeft: 5 } : { marginRight: 5 }],
                ]}
              >
                <Text style={styles.modalButtonTextStyle}>{t("cancel")}</Text>
              </OldTouch>
              <OldTouch
                loading={false}
                onPress={bookNow}
                style={[
                  styles.modalButtonStyle,
                  [
                    isRTL
                      ? { marginRight: 5, backgroundColor: colors.START_TRIP }
                      : { marginLeft: 5, backgroundColor: colors.START_TRIP },
                  ],
                ]}
              >
                <Text style={styles.modalButtonTextStyle}>{t("confirm")}</Text>
              </OldTouch>
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
    padding: 35,
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
  textInputContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
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
});
