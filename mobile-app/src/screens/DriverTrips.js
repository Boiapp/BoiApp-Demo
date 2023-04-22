import { API_KEY } from "@env";
import { useDrawerStatus } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useWalletConnect } from "@walletconnect/react-native-dapp";
import { FirebaseContext } from "common/src";
import { ethers } from "ethers";
import i18n from "i18n-js";
import moment from "moment/min/moment-with-locales";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Header } from "react-native-elements";
import MapView, {
  MapMarker,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from "react-native-maps";
import StarRating from "react-native-star-rating";
import { useDispatch, useSelector } from "react-redux";
import POT from "../../artifacts/contracts/POT.sol/POT.json";
import carImageIcon from "../../assets/images/car.png";
import { mapStyle } from "../../config/mapStyle";
import { colors } from "../common/theme";
import { AnimatedMapView } from "react-native-maps/lib/MapView";

var { width, height } = Dimensions.get("window");

export default function DriverTrips(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const { acceptTask, cancelTask, updateProfile } = api;
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.taskdata.tasks);
  const settings = useSelector((state) => state.settingsdata.settings);
  const auth = useSelector((state) => state.auth);
  const bookinglistdata = useSelector((state) => state.bookinglistdata);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [region, setRegion] = useState(null);
  const gps = useSelector((state) => state.gpsdata);
  const latitudeDelta = 0.0922;
  const longitudeDelta = 0.0421;
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const isDrawerOpen = useDrawerStatus();
  const [pgsErr, setGpsErr] = useState(false);
  const connector = useWalletConnect();
  const [contractLoading, setContractLoading] = useState(false);

  useEffect(() => {
    if (bookinglistdata.bookings) {
      setActiveBookings(
        bookinglistdata.bookings.filter(
          (booking) =>
            booking.status == "ACCEPTED" ||
            booking.status == "ARRIVED" ||
            booking.status == "STARTED" ||
            booking.status == "REACHED"
        )
      );
    }
  }, [bookinglistdata.bookings]);

  const DriverPOT = async (address) => {
    setContractLoading(true);
    if (connector.chainId !== 80001) {
      try {
        await connector.sendCustomRequest({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13881" }],
        });
      } catch (err) {
        try {
          await connector.sendCustomRequest({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13881",
                chainName: "MUMBAI",
                rpcUrls: ["https://rpc-mumbai.matic.today"],
              },
            ],
          });
        } catch (err) {
          console.log("err", err);
        }
      }
    }
    const driverAddress = connector.accounts[0];
    let alchemy = new ethers.providers.AlchemyProvider("maticmum", API_KEY);
    const ifacePOT = new ethers.utils.Interface(POT.abi);
    const startRide = ifacePOT.encodeFunctionData("startRideByDriver", [
      driverAddress,
    ]);
    const nonceDriver = await alchemy.getTransactionCount(driverAddress);
    const txPOT = {
      from: `${driverAddress}`,
      to: `${address}`,
      data: startRide,
      nonce: nonceDriver,
      chainId: 80001,
    };
    try {
      await connector.sendTransaction(txPOT).then(async (res) => {
        await alchemy
          .waitForTransaction(res, 1)
          .then((res) => {
            setContractLoading(false);
            return { res: "success" };
          })
          .catch((err) => {
            setContractLoading(false);
            console.log("err", err);
          });
      });
    } catch (err) {
      console.log("err", err);
      setContractLoading(false);
      return { err: err };
    }
    setContractLoading(false);
    return { res: "success" };
  };

  /* Deploy Contract */
  const onPressAccept = async (item) => {
    let wallet_balance = parseFloat(auth.info?.profile.walletBalance);
    if (!settings.negativeBalance && wallet_balance <= 0) {
      if (appcat == "delivery" && item.prepaid && item.payment_mode == "card") {
        dispatch(acceptTask(auth.info, item));
        setSelectedItem(null);
        setModalVisible(null);
        setTimeout(() => {
          props.navigation.navigate("BookedCab", { bookingId: item.id });
        }, 3000);
      } else {
        Alert.alert(t("alert"), t("wallet_balance_zero"));
      }
    } else if (
      !settings.negativeBalance &&
      wallet_balance > 0 &&
      wallet_balance < item.convenience_fees
    ) {
      if (appcat == "delivery" && item.prepaid && item.payment_mode == "card") {
        dispatch(acceptTask(auth.info, item));
        setSelectedItem(null);
        setModalVisible(null);
        setTimeout(() => {
          props.navigation.navigate("BookedCab", { bookingId: item.id });
        }, 3000);
      } else {
        Alert.alert(t("alert"), t("wallet_balance_low"));
      }
    } else {
      let res = await DriverPOT(item.addressContract);
      if (res.err !== undefined) {
        return;
      }
      dispatch(acceptTask(auth.info, item));
      setSelectedItem(null);
      setModalVisible(null);
      setTimeout(() => {
        props.navigation.navigate("BookedCab", { bookingId: item.id });
      }, 3000);
    }
  };

  const onPressIgnore = (id) => {
    dispatch(cancelTask(id));
    setSelectedItem(null);
    setModalVisible(null);
  };

  const goToBooking = (id) => {
    props.navigation.navigate("BookedCab", { bookingId: id });
  };

  const onChangeFunction = () => {
    let res = !auth.info?.profile.driverActiveStatus;
    dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
  };

  useEffect(() => {
    if (gps.location) {
      if (gps.location.lat && gps.location.lng) {
        setGpsErr(false);
        setRegion({
          latitude: gps.location.lat,
          longitude: gps.location.lng,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
          heading: gps.location.heading,
        });
      }
    }
  }, [gps.location]);

  useEffect(() => {
    if (gps.error) {
      setGpsErr(true);
    }
  }, [gps.error]);

  useEffect(() => {
    if (
      auth.info &&
      auth.info?.profile &&
      auth.info?.profile.approved &&
      !auth.info?.profile.driverActiveStatus &&
      isDrawerOpen != "open"
    ) {
      Alert.alert(
        t("you_are_offline"),
        t("go_online_to_accepting_jobs"),
        [
          {
            text: t("no"),
            onPress: () => {},
            style: "cancel",
          },
          {
            text: t("yes"),
            onPress: () => {
              dispatch(updateProfile(auth.info, { driverActiveStatus: true }));
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, []);

  const rCom = () => {
    return (
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
        {/* <Text
          style={{
            color: colors.WHITE,
            fontWeight: "bold",
            marginRight: Platform.OS == "ios" ? 10 : 0,
            marginTop: 8,
          }}
        >
          {t("on_duty")}
        </Text> */}
        <Switch
          value={
            auth.info &&
            auth.info?.profile &&
            auth.info?.profile.driverActiveStatus
          }
          disabled={!auth.info?.profile.approved}
          onValueChange={onChangeFunction}
          style={{ marginTop: Platform.OS == "android" ? -6 : 0 }}
          trackColor={{
            false: auth.info?.profile.approved ? "#f67873" : "#c4c4c4",
            true: "#81b0ff",
          }}
          thumbColor={
            auth.info?.profile.driverActiveStatus ? "#ffffff" : "#f4f3f4"
          }
        />
      </View>
    );
  };
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

  return (
    <View style={styles.mainViewStyle}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL ? rCom : lCom}
        rightComponent={isRTL ? lCom : rCom}
        centerComponent={
          <Text style={styles.headerTitleStyle}>{t("task_list")}</Text>
        }
        containerStyle={styles.headerStyle}
        innerContainerStyles={styles.headerInnerStyle}
      />
      <FlatList
        data={
          auth.info &&
          auth.info?.profile &&
          auth.info?.profile.driverActiveStatus
            ? auth.info?.profile.queue
              ? activeBookings
              : tasks
            : []
        }
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          auth.info &&
          auth.info?.profile &&
          auth.info?.profile.approved &&
          auth.info?.profile.driverActiveStatus ? (
            <View style={{ height: height, width: width }}>
              {region ? (
                <MapView
                  region={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                  }}
                  customMapStyle={mapStyle[0]}
                  provider={PROVIDER_GOOGLE}
                  style={{
                    height: height - (Platform.OS == "android" ? 15 : 60),
                    width: width,
                  }}
                >
                  <MapMarker
                    coordinate={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                    }}
                    pinColor={colors.HEADER}
                  >
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          alignItems: "center",
                          backgroundColor: "#fff",
                          opacity: 0.8,
                          borderColor: "#000",
                          borderWidth: 1,
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingHorizontal: 5,
                          marginBottom: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "bold",
                            color: colors.BUTTON_BLUE,
                          }}
                        >
                          {t("where_are_you")}
                        </Text>
                        <Text
                          style={{
                            fontWeight: "bold",
                            color: colors.BUTTON_BLUE,
                          }}
                        >
                          {t("rider_not_here")}
                        </Text>
                      </View>
                      <Image
                        source={carImageIcon}
                        style={{
                          height: 40,
                          width: 25,
                          resizeMode: "contain",
                        }}
                      />
                    </View>
                  </MapMarker>
                </MapView>
              ) : gps.error ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("location_permission_error")}</Text>
                </View>
              ) : !auth.info?.profile.approved ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: 320,
                    marginHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 30,
                      lineHeight: 36,
                    }}
                  >
                    Tu cuenta no ha sido aprobada por el administrador. Por
                    favor espere la confirmación de tus datos.
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("loading")}</Text>
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                height: height,
                width: width,
              }}
            >
              {region ? (
                <MapView
                  region={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                  }}
                  customMapStyle={mapStyle[1]}
                  provider={PROVIDER_GOOGLE}
                  style={{
                    height: height - (Platform.OS == "android" ? 15 : 60),
                    width: width,
                    opacity: 0.5,
                  }}
                >
                  <View
                    style={{
                      height: height - (Platform.OS == "android" ? 15 : 60),
                      width: width,
                      backgroundColor: "gray",
                      opacity: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                    }}
                  ></View>
                </MapView>
              ) : gps.error ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("location_permission_error")}</Text>
                </View>
              ) : !auth.info?.profile.approved ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: 320,
                    marginHorizontal: 20,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 30,
                      lineHeight: 36,
                    }}
                  >
                    Tu cuenta no ha sido aprobada por el administrador. Por
                    favor espere la confirmación de tus datos.
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("loading")}</Text>
                </View>
              )}
            </View>
          )
        }
        renderItem={({ item, index }) => {
          return (
            <View style={styles.listItemView}>
              <View
                style={[
                  styles.mapcontainer,
                  activeBookings && activeBookings.length >= 1
                    ? { height: height - 500 }
                    : null,
                ]}
              >
                <MapView
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  initialRegion={{
                    latitude: item.pickup.lat,
                    longitude: item.pickup.lng,
                    latitudeDelta:
                      activeBookings && activeBookings.length >= 1
                        ? 0.0922
                        : 0.0822,
                    longitudeDelta:
                      activeBookings && activeBookings.length >= 1
                        ? 0.0421
                        : 0.0321,
                  }}
                >
                  <MapMarker
                    coordinate={{
                      latitude: item.pickup.lat,
                      longitude: item.pickup.lng,
                    }}
                    title={item.pickup.add}
                    description={t("pickup_location")}
                    pinColor={colors.BLUE}
                  />

                  <MapMarker
                    coordinate={{
                      latitude: item.drop.lat,
                      longitude: item.drop.lng,
                    }}
                    title={item.drop.add}
                    description={t("drop_location")}
                    pinColor={colors.PINK}
                  />
                  {item.waypoints && item.waypoints.length > 0
                    ? item.waypoints.map((point, index) => {
                        return (
                          <MapMarker
                            coordinate={{
                              latitude: point.lat,
                              longitude: point.lng,
                            }}
                            pinColor={colors.PINK}
                            title={point.add}
                            key={index}
                          ></MapMarker>
                        );
                      })
                    : null}
                  {item.coords ? (
                    <Polyline
                      coordinates={item.coords}
                      strokeWidth={4}
                      strokeColor={colors.INDICATOR_BLUE}
                      lineDashPattern={[1]}
                    />
                  ) : null}
                </MapView>
              </View>

              <View style={styles.mapDetails}>
                <View style={styles.dateView}>
                  <Text style={styles.listDate}>
                    {moment(item.tripdate).format("lll")}
                  </Text>
                </View>
                <View style={styles.rateViewStyle}>
                  {settings.swipe_symbol === false ? (
                    <Text style={styles.rateViewTextStyle}>
                      {settings.symbol}
                      {item
                        ? item.estimate > 0
                          ? parseFloat(item.estimate).toFixed(settings.decimal)
                          : 0
                        : null}
                    </Text>
                  ) : (
                    <Text style={styles.rateViewTextStyle}>
                      {item
                        ? item.estimate > 0
                          ? parseFloat(item.estimate).toFixed(settings.decimal)
                          : 0
                        : null}
                      {settings.symbol}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.estimateView,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                  ]}
                >
                  <Text style={styles.listEstimate}>
                    {item.estimateDistance
                      ? parseFloat(item.estimateDistance).toFixed(
                          settings.decimal
                        )
                      : 0}{" "}
                    {settings.convert_to_mile ? t("mile") : t("km")}
                  </Text>
                  <Text style={styles.listEstimate}>
                    {item.estimateTime
                      ? parseFloat(item.estimateTime / 60).toFixed(0)
                      : 0}{" "}
                    {t("mins")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.addressViewStyle,
                    isRTL ? { paddingRight: 10 } : { paddingLeft: 10 },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.greenDot}></View>
                    <Text
                      style={[
                        styles.addressViewTextStyle,
                        isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {item.pickup.add}
                    </Text>
                  </View>
                  {item.waypoints && item.waypoints.length > 0
                    ? item.waypoints.map((point, index) => {
                        return (
                          <View
                            key={"key" + index}
                            style={{
                              flexDirection: isRTL ? "row-reverse" : "row",
                              alignItems: "center",
                            }}
                          >
                            <View style={styles.redDot}></View>
                            <Text
                              style={[
                                styles.addressViewTextStyle,
                                isRTL
                                  ? { marginRight: 10 }
                                  : { marginLeft: 10 },
                                { textAlign: isRTL ? "right" : "left" },
                              ]}
                            >
                              {point.add}
                            </Text>
                          </View>
                        );
                      })
                    : null}
                  <View
                    style={{
                      flexDirection: isRTL ? "row-reverse" : "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.redDot}></View>
                    <Text
                      style={[
                        styles.addressViewTextStyle,
                        isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {item.drop.add}
                    </Text>
                  </View>
                </View>
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("parcel_type")} -{" "}
                    </Text>
                    <Text style={styles.textContent}>
                      {item && item.parcelTypeSelected
                        ? item.parcelTypeSelected.description
                        : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>{t("options")} - </Text>
                    <Text style={styles.textContent}>
                      {item && item.optionSelected
                        ? item.optionSelected.description
                        : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("pickUpInstructions")} -{" "}
                    </Text>
                    <Text style={styles.textContent}>
                      {item ? item.pickUpInstructions : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("deliveryInstructions")} -{" "}
                    </Text>
                    <Text style={styles.textContent}>
                      {item ? item.deliveryInstructions : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("payment_mode")} -{" "}
                    </Text>
                    <Text style={styles.textContent}>
                      {item.booking_type_admin ? "Cash" : item.payment_mode}
                    </Text>
                  </View>
                ) : null}
                {activeBookings && activeBookings.length >= 1 ? (
                  <View style={styles.detailsBtnView}>
                    <View style={{ flex: 1 }}>
                      <Button
                        onPress={() => {
                          goToBooking(item.id);
                        }}
                        title={t("go_to_booking")}
                        titleStyle={styles.titleStyles}
                        buttonStyle={{
                          backgroundColor: colors.DRIVER_TRIPS_BUTTON,
                          width: 180,
                          height: 50,
                          padding: 2,
                          borderColor: colors.TRANSPARENT,
                          borderWidth: 0,
                          borderRadius: 5,
                        }}
                        containerStyle={{
                          flex: 1,
                          alignSelf: "center",
                          paddingRight: 14,
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.detailsBtnView,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Button
                        onPress={() => {
                          setModalVisible(true);
                          setSelectedItem(item);
                        }}
                        title={t("ignore_text")}
                        titleStyle={styles.titleStyles}
                        buttonStyle={styles.myButtonStyle}
                        containerStyle={{
                          flex: 1,
                          alignSelf: isRTL ? "flex-start" : "flex-end",
                          paddingRight: isRTL ? 0 : 14,
                          paddingLeft: isRTL ? 14 : 0,
                        }}
                      />
                    </View>
                    <View style={styles.viewFlex1}>
                      <Button
                        title={t("accept")}
                        titleStyle={styles.titleStyles}
                        onPress={() => {
                          onPressAccept(item);
                        }}
                        loading={false}
                        buttonStyle={{
                          backgroundColor: colors.BLUE,
                          width: height / 6,
                          padding: 2,
                          borderColor: colors.TRANSPARENT,
                          borderWidth: 0,
                          borderRadius: 5,
                        }}
                        containerStyle={{
                          flex: 1,
                          alignSelf: isRTL ? "flex-end" : "flex-start",
                          paddingRight: isRTL ? 14 : 0,
                          paddingLeft: isRTL ? 0 : 14,
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          left: 20,
          borderRadius: 30,
          height: 60,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "flex-start",
          zIndex: 100,
          flexDirection: "row",
        }}
      >
        <Image
          source={
            auth.info?.profile.profileImage == null
              ? require("../../assets/images/profilePic.png")
              : { uri: auth.info?.profile.profileImage }
          }
          style={{ width: 50, height: 50, marginLeft: 5, borderRadius: 50 }}
        />
        <View
          style={{
            marginLeft: 10,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Text style={{ color: colors.BLUE, fontWeight: "bold" }}>
            {auth.info?.profile.firstName + " " + auth.info?.profile.lastName}
          </Text>

          <StarRating
            disabled={false}
            maxStars={5}
            starSize={15}
            fullStar={"ios-star"}
            halfStar={"ios-star-half"}
            emptyStar={"ios-star-outline"}
            iconSet={"Ionicons"}
            fullStarColor={colors.STAR}
            emptyStarColor={colors.STAR}
            halfStarColor={colors.STAR}
            rating={
              auth.info?.profile && auth.info?.profile.ratings
                ? parseFloat(auth.info?.profile.ratings.userrating)
                : 0
            }
          />
        </View>
      </View>
      <View style={styles.modalPage}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert(t("modal_close"));
          }}
        >
          <View style={styles.modalMain}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeading}>
                <Text style={styles.alertStyle}>{t("alert_text")}</Text>
              </View>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 16 }}>{t("ignore_job_title")}</Text>
              </View>
              <View
                style={[
                  styles.modalFooter,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <TouchableHighlight
                  style={
                    isRTL
                      ? [styles.btnStyle]
                      : [styles.btnStyle, styles.clickText]
                  }
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setSelectedItem(null);
                  }}
                >
                  <Text style={styles.cancelTextStyle}>{t("cancel")}</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={
                    isRTL
                      ? [styles.btnStyle, styles.clickText]
                      : [styles.btnStyle]
                  }
                  onPress={() => {
                    onPressIgnore(selectedItem.id);
                  }}
                >
                  <Text style={styles.okStyle}>{t("ok")}</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

//Screen Styling
const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
  },
  headerInnerStyle: {
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    marginTop: 3,
  },
  mapcontainer: {
    flex: 1.5,
    width: width,
    height: 200,
    borderWidth: 7,
    borderColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  mapDetails: {
    backgroundColor: colors.WHITE,
    flex: 1,
    flexDirection: "column",
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: colors.TRANSPARENT,
    borderStyle: "solid",
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: colors.TRANSPARENT,
    borderRightColor: colors.TRANSPARENT,
    borderBottomColor: colors.BOX_BG,
    transform: [{ rotate: "180deg" }],
  },
  signInTextStyle: {
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    color: colors.WHITE,
  },
  listItemView: {
    flex: 1,
    width: "100%",
    // height: 350,
    marginBottom: 10,
    flexDirection: "column",
  },
  dateView: {
    flex: 1.1,
  },
  listDate: {
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 10,
    color: colors.BLACK,
    flex: 1,
    alignSelf: "center",
  },
  estimateView: {
    flex: 1.1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  listEstimate: {
    fontSize: 20,
    color: colors.DRIVER_TRIPS_TEXT,
  },
  addressViewStyle: {
    flex: 2,
  },
  no_driver_style: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 18,
  },
  addressViewTextStyle: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
    //marginLeft: 15,
    lineHeight: 24,
    flexWrap: "wrap",
  },
  greenDot: {
    backgroundColor: colors.BLUE,
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  redDot: {
    backgroundColor: colors.PINK,
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  detailsBtnView: {
    flex: 2,
    justifyContent: "space-between",
    width: width,
    marginTop: 20,
    marginBottom: 20,
  },

  modalPage: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMain: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
    flex: 1,
    maxHeight: 180,
  },
  modalHeading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    borderTopColor: colors.FOOTERTOP,
    borderTopWidth: 1,
    width: "100%",
  },
  btnStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainViewStyle: {
    flex: 1,
    //marginTop: StatusBar.currentHeight
  },
  myButtonStyle: {
    backgroundColor: colors.PINK,
    width: height / 6,
    padding: 2,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    borderRadius: 5,
  },
  alertStyle: {
    fontWeight: "bold",
    fontSize: 18,
    width: "100%",
    textAlign: "center",
  },
  cancelTextStyle: {
    color: colors.INDICATOR_BLUE,
    fontSize: 18,
    fontWeight: "bold",
    width: "100%",
    textAlign: "center",
  },
  okStyle: {
    color: colors.INDICATOR_BLUE,
    fontSize: 18,
    fontWeight: "bold",
  },
  viewFlex1: {
    flex: 1,
  },
  clickText: {
    borderRightColor: colors.DRIVER_TRIPS_TEXT,
    borderRightWidth: 1,
  },
  titleStyles: {
    width: "100%",
    alignSelf: "center",
  },
  rateViewStyle: {
    alignItems: "center",
    flex: 2,
    marginTop: 10,
    marginBottom: 10,
  },
  rateViewTextStyle: {
    fontSize: 50,
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    textAlign: "center",
  },
  textContainerStyle: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 35,
    marginRight: 35,
    marginTop: 10,
  },
  textContainerStyle2: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 35,
    marginRight: 35,
    marginTop: 10,
  },
  textHeading: {
    fontWeight: "bold",
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
  },
  textContent: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
    marginLeft: 3,
  },
  textContent2: {
    marginTop: 4,
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
  },
});
