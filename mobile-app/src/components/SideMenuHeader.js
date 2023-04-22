import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Icon } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from "i18n-js";
//make a compontent
const isRTL =
  i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

const SideMenuHeader = ({
  headerStyle,
  userPhoto,
  userName,
  userWallet,
  language,
  props,
}) => {
  const navigateToScreen = () => {
    props.navigation.navigate("Profile");
  };

  return (
    <View style={[styles.viewStyle, headerStyle]}>
      <TouchableOpacity style={styles.userImageView}>
        <Image
          source={
            userPhoto == null
              ? require("../../assets/images/profilePic.png")
              : { uri: userPhoto }
          }
          style={styles.imageStyle}
        />
      </TouchableOpacity>
      <View style={styles.headerTextStyle}>
        <Text style={styles.ProfileNameStyle}>
          {userName ? userName.toUpperCase() : ""}
        </Text>
        <TouchableOpacity style={styles.editClick} onPress={navigateToScreen}>
          <Icon
            name="edit"
            type="font-awesome"
            color={colors.WHITE}
            size={16}
            style={{ marginHorizontal: 8 }}
            // className="mx-2"
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.iconViewStyle,
          {
            flexDirection:
              language != null && language == "ar" ? "row-reverse" : "row",
          },
        ]}
      >
        <Text
          style={[
            styles.emailStyle,
            language != null && language == "ar"
              ? { marginRight: 4 }
              : { marginLeft: 4 },
          ]}
        >
          {userWallet
            ? userWallet.slice(0, 10) + "..." + userWallet.slice(-10)
            : ""}
        </Text>
        <Icon
          name="md-wallet"
          type="ionicon"
          color={colors.WHITE}
          size={16}
          style={{ marginHorizontal: 8 }}
          // className="mx-2"
        />
      </View>
    </View>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: colors.BLUE,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    paddingTop: Platform.OS == "ios" ? 20 : StatusBar.currentHeight,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 2,
    position: "relative",
    flexDirection: "column",
    borderTopRightRadius: 12,
  },
  textStyle: {
    fontSize: 20,
    color: colors.WHITE,
  },
  headerTextStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    flexDirection: "row",
  },
  iconStyle: {},
  userImageView: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ProfileNameStyle: {
    fontWeight: "bold",
    color: colors.WHITE,
    fontSize: 20,
  },
  iconViewStyle: {
    width: 220,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  emailStyle: {
    color: colors.WHITE,
    fontSize: 13,
    marginLeft: 4,
    textAlign: "center",
  },
  imageStyle: {
    width: 100,
    height: 100,
  },
};
//make the component available to other parts of the app
export default SideMenuHeader;
