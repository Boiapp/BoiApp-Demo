import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from "react-native";
import Background from "./Background";
import { Icon, Button, Header, Input } from "react-native-elements";
import { colors } from "../common/theme";
var { height } = Dimensions.get("window");
import i18n from "i18n-js";
import RadioForm from "react-native-simple-radio-button";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import ActionSheet from "react-native-actions-sheet";
import { FirebaseContext } from "common/src";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import IconEntypo from "react-native-vector-icons/Entypo";

export default function RegistrationWeb3(props) {
  const connector = useWalletConnect();
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const { api, appcat } = useContext(FirebaseContext);
  const { countries } = api;
  const [state, setState] = useState({
    usertype: "rider",
    firstName: "",
    lastName: "",
    email: "",
    wallet: "",
    profileImage: null,
    referralId: "",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    carType: props.cars && props.cars.length > 0 ? props.cars[0].value : "",
    bankAccount: "",
    bankCode: "",
    bankName: "",
    licenseImage: null,
    other_info: "",
  });

  const [role, setRole] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImageProfile, setCapturedImageProfile] = useState(null);
  const [idProfileImg, setIdProfileImg] = useState(false);
  const [idLicenseImg, setIdLicenseImg] = useState(false);
  const [countryCode, setCountryCode] = useState();
  const [mobileWithoutCountry, setMobileWithoutCountry] = useState("");
  const settings = useSelector((state) => state.settingsdata.settings);
  const actionSheetRef = useRef(null);

  const radio_props = [
    { label: t("rider"), value: 0 },
    { label: t("driver"), value: 1 },
  ];

  const killSession = React.useCallback(() => {
    connector.killSession();
    props.onPressBack();
  }, [connector]);

  const formatCountries = () => {
    let arr = [];
    for (let i = 0; i < countries.length; i++) {
      let txt = countries[i].label + " (+" + countries[i].phone + ")";
      arr.push({ label: txt, value: txt, key: txt });
    }
    return arr;
  };

  useEffect(() => {
    if (settings) {
      for (let i = 0; i < countries.length; i++) {
        if (countries[i].label == settings.country) {
          setCountryCode(settings.country + " (+" + countries[i].phone + ")");
        }
      }
    }
  }, [settings]);

  useEffect(() => {
    if (state.wallet === "" && connector.connected) {
      setState({ ...state, wallet: connector.accounts[0] });
    }
  }, [connector]);

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible(true);
  };

  const uploadImage = () => {
    return (
      <ActionSheet ref={actionSheetRef}>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            borderColor: colors.WALLET_PRIMARY,
            borderBottomWidth: 1,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            _pickImage("CAMERA", ImagePicker.launchCameraAsync);
          }}
        >
          <Text style={{ color: colors.BLUE, fontWeight: "bold" }}>
            {t("camera")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            borderBottomWidth: 1,
            borderColor: colors.WALLET_PRIMARY,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            _pickImage("MEDIA", ImagePicker.launchImageLibraryAsync);
          }}
        >
          <Text style={{ color: colors.BLUE, fontWeight: "bold" }}>
            {t("medialibrary")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            actionSheetRef.current?.setModalVisible(false);
          }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>Cancel</Text>
        </TouchableOpacity>
      </ActionSheet>
    );
  };

  const handleProfileImg = () => {
    setIdLicenseImg(false);
    setIdProfileImg(true);
    showActionSheet();
  };

  const handleLicenseImg = () => {
    setIdLicenseImg(true);
    setIdProfileImg(false);
    showActionSheet();
  };

  const _pickImage = async (permissionType, res) => {
    var pickFrom = res;
    let permisions;
    if (permissionType == "CAMERA") {
      permisions = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    const { status } = permisions;

    if (status == "granted") {
      let result = idLicenseImg
        ? await pickFrom({
            allowsEditing: true,
            aspect: [4, 3],
            base64: true,
          })
        : await pickFrom({
            allowsEditing: true,
            aspect: [4, 4],
            base64: true,
          });

      actionSheetRef.current?.setModalVisible(false);
      if (!result.cancelled) {
        let data = "data:image/jpeg;base64," + result.base64;
        if (idLicenseImg) {
          setCapturedImage(result.uri);
        } else {
          setCapturedImageProfile(result.uri);
        }
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            Alert.alert(t("alert"), t("image_upload_error"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", Platform.OS == "ios" ? data : result.uri, true);
          xhr.send(null);
        });
        if (blob && idLicenseImg) {
          setState({ ...state, licenseImage: blob });
        } else if (blob && idProfileImg) {
          setState({ ...state, profileImage: result.uri });
        }
      }
    } else {
      Alert.alert(t("alert"), t("camera_permission_error"));
    }
  };

  //upload cancel
  const cancelPhotoProfile = () => {
    setCapturedImageProfile(null);
    setState({ ...state, profileImage: null });
  };
  const cancelPhoto = () => {
    setCapturedImage(null);
    setState({ ...state, licenseImage: null });
  };

  const setUserType = (value) => {
    if (value == 0) {
      setState({ ...state, usertype: "rider" });
    } else {
      setState({ ...state, usertype: "driver" });
    }
  };

  // const validateMobile = () => {
  //   let mobileValid = true;
  //   if (mobileWithoutCountry.length < 6) {
  //     mobileValid = false;
  //     Alert.alert(t("alert"), t("mobile_no_blank_error"));
  //   }
  //   return mobileValid;
  // };

  //register button press for validation
  const onPressRegister = () => {
    const { onPressRegister } = props;
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(state.email)) {
      if (state.usertype == "driver" && state.licenseImage == null) {
        Alert.alert(t("alert"), t("proper_input_licenseimage"));
      } else {
        if (
          (state.usertype == "driver" && state.vehicleNumber.length > 1) ||
          state.usertype == "rider"
        ) {
          if (
            /\S/.test(state.firstName) &&
            state.firstName.length > 0 &&
            /\S/.test(state.lastName) &&
            state.lastName.length > 0
          ) {
            const userData = { ...state };
            if (userData.usertype == "rider") delete userData.carType;
            onPressRegister(userData);
          } else {
            Alert.alert(t("alert"), t("proper_input_name"));
          }
        } else {
          Alert.alert(t("alert"), t("proper_input_vehicleno"));
        }
      }
    } else {
      Alert.alert(t("alert"), t("proper_email"));
    }
  };

  const upDateCountry = (text) => {
    setCountryCode(text);
    let extNum = text.split("(")[1].split(")")[0];
    let formattedNum = mobileWithoutCountry.replace(/ /g, "");
    formattedNum = extNum + formattedNum.replace(/-/g, "");
    setState({ ...state, mobile: formattedNum });
  };

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.WHITE,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: props.onPressBack,
  };
  const rCom = {
    icon: "ios-arrow-forward",
    type: "ionicon",
    color: colors.WHITE,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: props.onPressBack,
  };

  return (
    <Background>
      <Header
        placement="right"
        backgroundColor={colors.TRANSPARENT}
        leftComponent={isRTL ? null : lCom}
        rightComponent={isRTL ? rCom : null}
        containerStyle={styles.headerContainerStyle}
        innerContainerStyles={styles.headerInnerContainer}
      />
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {uploadImage()}
          <View className="flex">
            <Text className="font-bold text-center text-3xl text-white mb-5">
              {t("createdProfile")}
            </Text>
          </View>
          <View style={styles.form} className="bg-white">
            <View style={styles.containerStyle}>
              {/* Profile Picture */}
              <Text style={styles.headerStyle}>{t("profile_picture")}</Text>
              {capturedImageProfile !== null ? (
                <View style={styles.imagePosition}>
                  <TouchableOpacity
                    style={styles.photoClick}
                    onPress={cancelPhotoProfile}
                  >
                    <Image
                      source={require("../../assets/images/cross.png")}
                      resizeMode={"contain"}
                      className="w-7 h-7"
                    />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: capturedImageProfile }}
                    style={styles.photoProfile}
                    resizeMode={"cover"}
                    className="w-32 h-32 rounded-full align-center flex-col justify-center mb-6 mt-2"
                  />
                </View>
              ) : (
                <View style={styles.imageFixStyle}>
                  <TouchableOpacity
                    style={styles.editClick}
                    onPress={handleProfileImg}
                  >
                    <Icon
                      name="edit"
                      type="font-awesome"
                      color={colors.BLUE}
                      size={24}
                      containerStyle={styles.iconContainer}
                    />
                  </TouchableOpacity>
                  <Image
                    source={require("../../assets/images/profilePic.png")}
                    resizeMode={"contain"}
                    style={styles.imageStyle}
                    className="w-32 h-32 rounded-full align-center flex-col justify-center mb-6 mt-2"
                  />
                </View>
              )}

              {/* Wallet */}
              <Text style={styles.headerStyle}>{t("your_wallet")}</Text>
              <View style={styles.textInputContainerStyle}>
                <Text
                  style={styles.textInputStyle}
                  className="px-5 py-2 rounded-full bg-gray-200 max-w-[76%] mb-7 h-10"
                >
                  {state.wallet.slice(0, 15) + "..." + state.wallet.slice(-14)}
                </Text>
              </View>
              {/* First Name */}
              <Text style={styles.headerStyle}>{t("firstname")}</Text>
              <View
                style={[
                  styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("first_name_placeholder")}
                  placeholderTextColor={colors.BLUE}
                  value={state.firstName}
                  keyboardType={"email-address"}
                  inputStyle={styles.inputTextStyle}
                  onChangeText={(text) => {
                    setState({ ...state, firstName: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                />
              </View>
              {/* Last Name */}
              <Text style={styles.headerStyle}>{t("lastname")}</Text>
              <View
                style={[
                  styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("last_name_placeholder")}
                  placeholderTextColor={colors.BLUE}
                  value={state.lastName}
                  keyboardType={"email-address"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, lastName: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                />
              </View>
              {/* Email */}
              <Text style={styles.headerStyle}>{t("emailUpp")}</Text>
              <View
                style={[
                  styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Input
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("email_placeholder")}
                  placeholderTextColor={colors.BLUE}
                  value={state.email}
                  keyboardType={"email-address"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, email: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                />
              </View>
              {/* Select Client or Driver */}
              <Text style={styles.headerStyle}>{t("user_type")}</Text>
              <View
                style={[
                  styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <RadioForm
                  radio_props={radio_props}
                  initial={role}
                  formHorizontal={true}
                  labelHorizontal={true}
                  buttonColor={colors.BLUE}
                  labelColor={colors.BLUE}
                  // style={isRTL ? { marginRight: 20 } : { marginLeft: 20 }}
                  className="mx-auto"
                  labelStyle={isRTL ? { marginRight: 10 } : { marginRight: 10 }}
                  selectedButtonColor={colors.BLUE}
                  selectedLabelColor={colors.BLUE}
                  onPress={(value) => {
                    setRole(value);
                    setUserType(value);
                  }}
                />
              </View>
              {state.usertype == "driver" && (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    {
                      marginBottom: Platform.OS === "ios" ? 10 : 15,
                      flexDirection: "column",
                    },
                  ]}
                  className="flex items-center justify-center"
                >
                  <Text style={styles.headerStyle}>{t("typeofCar")}</Text>
                  {props.cars && (
                    <RNPickerSelect
                      placeholder={{}}
                      value={state.carType}
                      useNativeAndroidPickerStyle={false}
                      style={{
                        inputIOS: [styles.pickerStyle],
                        placeholder: {
                          color: "#6382FC",
                        },
                        inputAndroid: [styles.pickerStyle],
                      }}
                      onValueChange={(value) =>
                        setState({ ...state, carType: value })
                      }
                      items={props.cars}
                      Icon={() => {
                        return (
                          <Ionicons
                            style={{ top: 15, marginRight: isRTL ? "80%" : 0 }}
                            name="md-arrow-down"
                            size={24}
                            color="gray"
                          />
                        );
                      }}
                    />
                  )}
                </View>
              )}
              {state.usertype == "driver" && (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    { flexDirection: "column" },
                  ]}
                >
                  <Text style={styles.headerStyle}>{t("model")}</Text>
                  <Input
                    editable={true}
                    returnKeyType={"next"}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("vehicle_model_name")}
                    placeholderTextColor={colors.BLUE}
                    value={state.vehicleMake}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, vehicleMake: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                    className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                  />
                </View>
              )}
              {state.usertype == "driver" && (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    { flexDirection: "column" },
                  ]}
                >
                  <Text style={styles.headerStyle}>{t("vehicle_model")}</Text>
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("vehicle_model_no")}
                    placeholderTextColor={colors.BLUE}
                    value={state.vehicleModel}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, vehicleModel: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                    className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                  />
                </View>
              )}
              {state.usertype == "driver" && (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    { flexDirection: "column" },
                  ]}
                >
                  <Text style={styles.headerStyle}>
                    {t("vehicle_register_no")}
                  </Text>
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("vehicle_reg_no")}
                    placeholderTextColor={colors.BLUE}
                    value={state.vehicleNumber}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, vehicleNumber: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                    className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                  />
                </View>
              )}
              {state.usertype == "driver" && (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    { flexDirection: "column" },
                  ]}
                >
                  <Text style={styles.headerStyle}>{t("other")}</Text>
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("other_info")}
                    placeholderTextColor={colors.BLUE}
                    value={state.other_info}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, other_info: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                    className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                  />
                </View>
              )}
              {(state.usertype == "driver" && settings.bank_fields) ||
              (state.usertype == "rider" &&
                settings.bank_fields &&
                settings.RiderWithDraw) ? (
                <View
                  style={[
                    styles.textInputContainerStyle,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("bankName")}
                    placeholderTextColor={colors.BLUE}
                    value={state.bankName}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, bankName: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                    className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                  />
                </View>
              ) : null}
              {(state.usertype == "driver" && settings.bank_fields) ||
                (state.usertype == "rider" &&
                  settings.bank_fields &&
                  settings.RiderWithDraw && (
                    <View
                      style={[
                        styles.textInputContainerStyle,
                        { flexDirection: isRTL ? "row-reverse" : "row" },
                      ]}
                    >
                      <Input
                        editable={true}
                        underlineColorAndroid={colors.TRANSPARENT}
                        placeholder={t("bankCode")}
                        placeholderTextColor={colors.BLUE}
                        value={state.bankCode}
                        inputStyle={[
                          styles.inputTextStyle,
                          { textAlign: isRTL ? "right" : "left" },
                        ]}
                        onChangeText={(text) => {
                          setState({ ...state, bankCode: text });
                        }}
                        inputContainerStyle={styles.inputContainerStyle}
                        containerStyle={styles.textInputStyle}
                        className="bg-gray-200 rounded-full px-5 py-2 max-w-[76%] justify-center items-center mx-auto h-10"
                      />
                    </View>
                  ))}
              {(state.usertype == "driver" && settings.bank_fields) ||
                (state.usertype == "rider" &&
                  settings.bank_fields &&
                  settings.RiderWithDraw && (
                    <View
                      style={[
                        styles.textInputContainerStyle,
                        { flexDirection: isRTL ? "row-reverse" : "row" },
                      ]}
                    >
                      <Icon
                        name="numeric"
                        type={"material-community"}
                        color={colors.BLUE}
                        size={20}
                        containerStyle={styles.iconContainer}
                      />
                      <Input
                        editable={true}
                        underlineColorAndroid={colors.TRANSPARENT}
                        placeholder={t("bankAccount")}
                        placeholderTextColor={colors.BLUE}
                        value={state.bankAccount}
                        inputStyle={[
                          styles.inputTextStyle,
                          { textAlign: isRTL ? "right" : "left" },
                        ]}
                        onChangeText={(text) => {
                          setState({ ...state, bankAccount: text });
                        }}
                        inputContainerStyle={styles.inputContainerStyle}
                        containerStyle={styles.textInputStyle}
                      />
                    </View>
                  ))}
              {/* Id de Referencia */}
              {/* <View
                style={[
                  styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <Icon
                  name="lock"
                  type="font-awesome"
                  color={colors.BLUE}
                  size={24}
                  containerStyle={styles.iconContainer}
                />

                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("referral_id_placeholder")}
                  placeholderTextColor={colors.BLUE}
                  value={state.referralId}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, referralId: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View> */}
              {state.usertype == "driver" &&
                (capturedImage ? (
                  <View style={styles.imagePosition}>
                    <TouchableOpacity
                      style={styles.removeClick}
                      onPress={cancelPhoto}
                    >
                      <Image
                        source={require("../../assets/images/cross.png")}
                        resizeMode={"contain"}
                        className="w-10 h-10"
                      />
                    </TouchableOpacity>
                    <Image
                      source={{ uri: capturedImage }}
                      style={styles.photoResult}
                      resizeMode={"cover"}
                    />
                  </View>
                ) : (
                  <View style={styles.capturePhoto}>
                    <View>
                      {state.imageValid ? (
                        <Text style={styles.capturePhotoTitle}>
                          {t("upload_driving_license")}
                        </Text>
                      ) : (
                        <Text style={styles.errorPhotoTitle}>
                          {t("upload_driving_license")}
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.capturePicClick,
                        { flexDirection: isRTL ? "row-reverse" : "row" },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.flexView1}
                        onPress={handleLicenseImg}
                      >
                        <View>
                          <View style={styles.imageFixStyle}>
                            <Image
                              source={require("../../assets/images/camera.png")}
                              resizeMode={"contain"}
                              style={styles.imageStyle2}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.myView}>
                        <View style={styles.myView1} />
                      </View>
                      <View style={styles.myView2}>
                        <View style={styles.myView3}>
                          <Text style={styles.textStyle}>
                            {t("image_size_warning")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              <View style={styles.buttonContainer}>
                <Button
                  onPress={killSession}
                  title={t("disconnect")}
                  loading={props.loading}
                  titleStyle={[styles.buttonTitle, { color: colors.BLUE }]}
                  type="clear"
                  buttonStyle={[
                    styles.disconnectButton,
                    {
                      marginTop: state.usertype == "driver" ? 30 : 10,
                      marginRight: 5,
                    },
                  ]}
                />
                <Button
                  onPress={onPressRegister}
                  title={t("next")}
                  loading={props.loading}
                  titleStyle={styles.buttonTitle}
                  buttonStyle={[
                    styles.registerButton,
                    {
                      marginTop: state.usertype == "driver" ? 30 : 10,
                      marginLeft: 5,
                    },
                  ]}
                />
              </View>
              <View style={styles.gapView} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = {
  headerContainerStyle: {
    backgroundColor: colors.TRANSPARENT,
    borderBottomWidth: 0,
    marginTop: 0,
  },
  headerInnerContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
    borderBottomColor: colors.TRANSPARENT,
  },
  textInputStyle: {
    color: colors.BLUE,
  },
  iconContainer: {
    paddingBottom: 20,
    alignSelf: "center",
  },
  gapView: {
    height: 40,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 40,
  },
  disconnectButton: {
    backgroundColor: colors.TRANSPARENT,
    width: 180,
    height: 50,
    borderColor: colors.BLUE,
    borderWidth: 1,
    marginTop: 30,
    borderRadius: 15,
  },
  registerButton: {
    backgroundColor: colors.BLUE,
    width: 180,
    height: 50,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 15,
  },
  buttonTitle: {
    fontSize: 16,
  },
  pickerStyle: {
    color: colors.BLUE,
    width: 200,
    fontSize: 15,
    height: 40,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.BLUE,
    textAlign: "center",
  },
  inputTextStyle: {
    color: colors.BLUE,
    fontSize: 13,
  },
  errorMessageStyle: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 0,
  },
  containerStyle: {
    flexDirection: "column",
    marginTop: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  form: {
    flex: 1,
  },
  logo: {
    width: "95%",
    justifyContent: "flex-start",
    marginTop: 10,
    alignItems: "center",
  },
  scrollViewStyle: {
    height: height,
  },
  textInputContainerStyle: {
    alignItems: "center",
  },
  headerStyle: {
    fontSize: 18,
    color: colors.BLUE,
    textAlign: "center",
    flexDirection: "row",
    marginBottom: 2,
  },

  capturePhoto: {
    width: "80%",
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.BLUE,
    marginLeft: 20,
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
  },
  capturePhotoTitle: {
    color: colors.BLUE,
    fontSize: 14,
    textAlign: "center",
    paddingBottom: 15,
  },
  errorPhotoTitle: {
    color: colors.WHITE,
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 15,
  },
  photoResult: {
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
    width: "80%",
    height: height / 4,
  },
  photoProfile: {
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
  },
  imagePosition: {
    position: "relative",
  },
  photoClick: {
    paddingRight: 124,
    position: "absolute",
    zIndex: 1,
    marginTop: 15,
    alignSelf: "flex-end",
  },
  editClick: {
    paddingRight: 124,
    position: "absolute",
    zIndex: 1,
    bottom: 10,
    alignSelf: "flex-end",
  },
  removeClick: {
    paddingRight: 40,
    position: "absolute",
    zIndex: 1,
    marginTop: 18,
    alignSelf: "flex-end",
  },
  capturePicClick: {
    backgroundColor: colors.BLUE,
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
  },
  imageStyle: {
    width: 140,
    height: 140,
  },
  flexView1: {
    flex: 12,
  },
  imageFixStyle: {
    flex: 1,
    alignItems: "center",
  },
  imageStyle2: {
    width: 400,
    height: height / 15,
  },
  myView: {
    flex: 2,
    height: 50,
    width: 1,
    alignItems: "center",
  },
  myView1: {
    height: height / 18,
    width: 1.5,
    backgroundColor: colors.BORDER_TEXT,
    alignItems: "center",
    marginTop: 10,
  },
  myView2: {
    flex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  myView3: {
    flex: 2.2,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 13,
  },
};
