import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { FirebaseContext } from "common/src";
import i18n from "i18n-js";
import React, { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../common/theme";
import SideMenuHeader from "./SideMenuHeader";
var { width } = Dimensions.get("window");

const ETHERSCAN_API_KEY = "G2A97FS9BAN2XE2PG57T72XATVVGGJK8CD";

export default function SideMenu(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const { updateProfile, signOut } = api;
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const { t } = i18n;
  const [ethBalance, setEthBalance] = useState(0);
  const [isLoadingEthBalance, setIsLoadingEthBalance] = useState(false);

  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const connector = useWalletConnect();

  const sideMenuList = [
    {
      name: t("book_your_ride_menu"),
      navigationName: "Map",
      icon: "home",
      type: "font-awesome",
    },
    {
      name: t("booking_request"),
      navigationName: "DriverTrips",
      icon: "home",
      type: "font-awesome",
    },
    {
      name: t("my_rides_menu"),
      navigationName: "RideList",
      icon: "location-sharp",
      type: "ionicon",
    },
    {
      name: t("incomeText"),
      navigationName: "MyEarning",
      icon: "md-wallet",
      type: "ionicon",
    },
    {
      name: t("my_wallet_menu"),
      icon: "account-balance-wallet",
      navigationName: "Wallet",
      type: "MaterialIcons",
    },
    // {
    //   name: t("profile_setting_menu"),
    //   navigationName: "Profile",
    //   icon: "ios-person-add",
    //   type: "ionicon",
    // },
    {
      name: t("convert_to_driver"),
      navigationName: "Convert",
      icon: "drive-eta",
      type: "material",
    },
    // {
    //   name: t("refer_earn"),
    //   navigationName: "Refer",
    //   icon: "cash",
    //   type: "ionicon",
    // },
    {
      name: t("emergency"),
      navigationName: "Emergency",
      icon: "ios-sad",
      type: "ionicon",
    },
    {
      name: t("push_notification_title"),
      navigationName: "Notifications",
      icon: "bell",
      type: "material-community",
    },
    // {
    //   name: t("about_us_menu"),
    //   navigationName: "About",
    //   icon: "info",
    //   type: "entypo",
    // },
    {
      name: t("logout"),
      icon: "sign-out",
      navigationName: "Logout",
      type: "font-awesome",
    },
  ];

  //navigation to screens from side menu
  const navigateToScreen = (route) => () => {
    props.navigation.navigate(route);
  };

  //sign out
  const logOff = () => {
    auth.info.profile && auth.info.profile.driverActiveStatus
      ? dispatch(updateProfile(auth.info, { driverActiveStatus: false }))
      : null;
    connector.killSession();
    dispatch(signOut());
  };

  const onPressCall = (phoneNumber) => {
    let call_link =
      Platform.OS == "android"
        ? "tel:" + phoneNumber
        : "telprompt:" + phoneNumber;
    Linking.canOpenURL(call_link)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(call_link);
        }
      })
      .catch((error) => console.log(error));
  };

  const convert = () => {
    Alert.alert(
      t("profile_updated"),
      t("profile_incomplete"),
      [
        {
          text: t("cancel"),
          onPress: () => {
            props.navigation.closeDrawer();
          },
          style: "cancel",
        },
        {
          text: t("yes"),
          onPress: () => {
            props.navigation.navigate("editUser");
            props.navigation.closeDrawer();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const language =
    auth.info && auth.info.profile && auth.info.profile.lang
      ? auth.info.profile.lang.langLocale
      : null;

  return (
    <View style={styles.mainViewStyle}>
      {auth.info && auth.info.profile ? (
        <SideMenuHeader
          headerStyle={styles.myHeader}
          userPhoto={auth.info.profile.profileImage}
          userWallet={auth.info.profile.wallet}
          userName={
            auth.info.profile.firstName + " " + auth.info.profile.lastName
          }
          language={language}
          props={props}
        ></SideMenuHeader>
      ) : null}
      <View style={styles.compViewStyle}>
        {!!settings && auth.info && auth.info.profile ? (
          <FlatList
            data={sideMenuList}
            keyExtractor={(item, index) => index.toString()}
            style={{
              marginTop: 20,
              width: "100%",
              padding: 5,
            }}
            bounces={false}
            renderItem={({ item, index }) => {
              if (
                auth.info.profile.usertype == "rider" &&
                (item.navigationName == "DriverTrips" ||
                  item.navigationName == "MyEarning")
              ) {
                return null;
              } else if (
                auth.info.profile.usertype == "driver" &&
                (item.navigationName == "Map" ||
                  item.navigationName == "Emergency")
              ) {
                return null;
              } else if (
                appcat == "delivery" &&
                item.navigationName == "Emergency"
              ) {
                return null;
              } else if (
                !(
                  auth.info.profile.usertype == "rider" ||
                  auth.info.profile.usertype == "driver"
                ) &&
                item.navigationName == "Refer"
              ) {
                return null;
              } else if (
                auth.info.profile.usertype == "driver" &&
                item.navigationName == "Convert"
              ) {
                return null;
              } else if (
                auth.info.profile.usertype == "rider" &&
                item.navigationName == "Convert" &&
                auth.info.profile.firstName == " "
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      convert();
                    }}
                    style={[
                      styles.menuItemView,
                      {
                        marginTop: index == sideMenuList.length - 1 ? 100 : 0,
                        flexDirection: isRTL ? "row-reverse" : "row",
                        marginHorizontal: 20,
                      },
                    ]}
                  >
                    <View style={styles.viewIcon}>
                      <Icon
                        name={item.icon}
                        type={item.type}
                        color={colors.BLUE}
                        size={20}
                        containerStyle={styles.iconStyle}
                      />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <View
                      style={[styles.vertialLine, { height: 20, top: 24 }]}
                    ></View>
                  </TouchableOpacity>
                );
              } else if (
                (auth.info.profile.usertype == "rider" ||
                  auth.info.profile.usertype == "driver") &&
                item.navigationName == "Refer"
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      settings.bonus > 0
                        ? Share.share({
                            message:
                              t("share_msg") +
                              settings.code +
                              " " +
                              settings.bonus +
                              ".\n" +
                              t("code_colon") +
                              auth.info.profile.referralId +
                              "\n" +
                              t("app_link") +
                              (Platform.OS == "ios"
                                ? settings.AppleStoreLink
                                : settings.PlayStoreLink),
                          })
                        : Share.share({
                            message:
                              t("share_msg_no_bonus") +
                              "\n" +
                              t("app_link") +
                              (Platform.OS == "ios"
                                ? settings.AppleStoreLink
                                : settings.PlayStoreLink),
                          });
                    }}
                    style={[
                      styles.menuItemView,
                      {
                        marginTop: index == sideMenuList.length - 1 ? 100 : 0,
                        flexDirection: isRTL ? "row-reverse" : "row",
                        marginHorizontal: 20,
                      },
                    ]}
                  >
                    <View style={styles.viewIcon}>
                      <Icon
                        name={item.icon}
                        type={item.type}
                        color={colors.BLUE}
                        size={20}
                        containerStyle={styles.iconStyle}
                      />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                  </TouchableOpacity>
                );
              } else if (
                (auth.info.profile.usertype == "admin" ||
                  auth.info.profile.usertype == "fleetadmin") &&
                item.navigationName == "Notifications"
              ) {
                return null;
              } else if (
                auth.info.profile.usertype == "rider" &&
                item.navigationName == "Emergency"
              ) {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        t("panic_text"),
                        t("panic_question"),
                        [
                          {
                            text: t("cancel"),
                            onPress: () => {},
                            style: "cancel",
                          },
                          {
                            text: t("ok"),
                            onPress: async () => {
                              onPressCall(settings.panic);
                            },
                          },
                        ],
                        { cancelable: false }
                      );
                    }}
                    style={[
                      styles.menuItemView,
                      {
                        marginTop: index == sideMenuList.length - 1 ? 100 : 0,
                        flexDirection: isRTL ? "row-reverse" : "row",
                        marginHorizontal: 20,
                      },
                    ]}
                  >
                    <View style={styles.viewIcon}>
                      <Icon
                        name={item.icon}
                        type={item.type}
                        color={colors.BLUE}
                        size={20}
                        containerStyle={styles.iconStyle}
                      />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                  </TouchableOpacity>
                );
              } else {
                return (
                  <TouchableOpacity
                    onPress={
                      item.name == t("logout")
                        ? () => logOff()
                        : navigateToScreen(item.navigationName)
                    }
                    style={[
                      styles.menuItemView,
                      {
                        marginTop: index == sideMenuList.length - 1 ? 100 : 0,
                        flexDirection: isRTL ? "row-reverse" : "row",
                        marginHorizontal: 20,
                      },
                    ]}
                  >
                    <View style={styles.viewIcon}>
                      <Icon
                        name={item.icon}
                        type={item.type}
                        color={colors.BLUE}
                        size={20}
                        containerStyle={styles.iconStyle}
                      />
                    </View>
                    <Text style={styles.menuName}>{item.name}</Text>
                  </TouchableOpacity>
                );
              }
            }}
          />
        ) : null}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  myHeader: {
    marginTop: 0,
  },
  balanceView: {
    shadowColor: "#0069ff",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16,
    elevation: 24,
    backgroundColor: "#0069ff",
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  vertialLine: {
    width: 1,
    backgroundColor: colors.MAP_TEXT,
    position: "absolute",
    left: 18,
    marginLeft: 5,
  },
  menuItemView: {
    marginBottom: 18,
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    width: "84%",
    paddingVertical: 10,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  viewIcon: {
    width: 24,
    height: 24,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  menuName: {
    color: colors.BLUE,
    fontWeight: "bold",
    paddingHorizontal: 10,
    fontSize: 18,
  },
  mainViewStyle: {
    backgroundColor: colors.BACKGROUND_PRIMARY,
    height: "100%",
    width: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  compViewStyle: {
    position: "relative",
    flex: 3,
    height: Dimensions.get("window").height,
  },
  iconStyle: {
    justifyContent: "center",
    alignItems: "center",
  },
});
