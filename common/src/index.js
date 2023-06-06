import React, { createContext } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage, ref as refStorage } from "firebase/storage";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  OAuthProvider,
} from "firebase/auth/react-native";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import store from "./store/store";

import {
  fetchUser,
  mainSignUp,
  mobileSignIn,
  facebookSignIn,
  appleSignIn,
  signOut,
  updateProfile,
  clearLoginError,
  updatePushToken,
  updateProfileImage,
  requestPhoneOtpDevice,
  deleteUser,
  validateReferer,
  checkUserExists,
  monitorProfileChanges,
  fetchProfile,
  walletSignIn,
} from "./actions/authactions";
import { addBooking, clearBooking } from "./actions/bookingactions";
import {
  fetchBookings,
  updateBooking,
  cancelBooking,
  updateBookingImage,
} from "./actions/bookinglistactions";
import {
  fetchCancelReasons,
  editCancellationReason,
} from "./actions/cancelreasonactions";
import { fetchCarTypes, editCarType } from "./actions/cartypeactions";
import { getEstimate, clearEstimate } from "./actions/estimateactions";
import { fetchDriverEarnings } from "./actions/driverearningaction";
import { fetchEarningsReport } from "./actions/earningreportsaction";
import {
  fetchUserNotifications,
  fetchNotifications,
  editNotifications,
  sendNotification,
} from "./actions/notificationactions";
import { fetchPromos, editPromo } from "./actions/promoactions";
import {
  addUser,
  fetchUsers,
  fetchUsersOnce,
  fetchDrivers,
  editUser,
} from "./actions/usersactions";
import {
  fetchSettings,
  editSettings,
  clearSettingsViewError,
} from "./actions/settingsactions";
import {
  fetchPaymentMethods,
  addToWallet,
  updateWalletBalance,
  clearMessage,
} from "./actions/paymentactions";
import {
  updateTripPickup,
  updateTripDrop,
  updateTripCar,
  updatSelPointType,
  clearTripPoints,
} from "./actions/tripactions";
import { fetchTasks, acceptTask, cancelTask } from "./actions/taskactions";
import {
  fetchBookingLocations,
  stopLocationFetch,
} from "./actions/locationactions";
import {
  fetchChatMessages,
  sendMessage,
  stopFetchMessages,
} from "./actions/chatactions";
import { fetchWithdraws, completeWithdraw } from "./actions/withdrawactions";
import { confirmDeliveryByApp, createNewPOT } from "./actions/web3actions";

import { MinutesPassed, GetDateString } from "./other/DateFunctions";
import {
  fetchPlacesAutocomplete,
  fetchCoordsfromPlace,
  fetchAddressfromCoords,
  getDistanceMatrix,
  getDirectionsApi,
} from "./other/GoogleAPIFunctions";
import { GetDistance, GetTripDistance } from "./other/GeoFunctions";
import { countries } from "./other/GetCountries";
import { fetchLanguages, editLanguage } from "./actions/languageactions";
import { RequestPushMsg } from "./other/NotificationFunctions";
import {
  equalTo,
  getDatabase,
  orderByChild,
  push,
  query,
  ref,
  set,
} from "firebase/database";

const FirebaseContext = createContext(null);

const FirebaseProvider = ({ config, appcat, children, AsyncStorage }) => {
  let firebase = {
    app: null,
    database: null,
    auth: null,
    storage: null,
  };

  const app = getApps().length === 0 ? initializeApp(config) : getApp();

  const auth = getAuth()
    ? getAuth()
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
  const database = getDatabase(app);
  const storage = getStorage(app);

  firebase = {
    app: app,
    config: config,
    appcat: appcat,
    database: database,
    auth: auth,
    storage: storage,
    authRef: auth,
    facebookProvider: new FacebookAuthProvider(), //Not used
    googleProvider: new GoogleAuthProvider(), //Not used
    appleProvider: new OAuthProvider("apple.com"), //Not used
    phoneProvider: new PhoneAuthProvider(), //Not used
    RecaptchaVerifier: RecaptchaVerifier,
    captchaGenerator: (element) => new RecaptchaVerifier(element),
    facebookCredential: (token) => FacebookAuthProvider.credential(token), //Not used
    googleCredential: (idToken) => GoogleAuthProvider.credential(idToken), //Not used
    mobileAuthCredential: (verificationId, code) =>
      PhoneAuthProvider.credential(verificationId, code), //Not used
    usersRef: ref(database, "users"),
    bookingRef: ref(database, "bookings"),
    cancelreasonRef: ref(database, "cancel_reason"),
    settingsRef: ref(database, "settings"),
    carTypesRef: ref(database, "cartypes"),
    carTypesEditRef: (id) => ref(database, "cartypes/" + id),
    promoRef: ref(database, "promos"),
    promoEditRef: (id) => ref(database, "promos/" + id),
    notifyRef: ref(database, "notifications/"),
    notifyEditRef: (id) => ref(database, "notifications/" + id),
    singleUserRef: (uid) => ref(database, "users/" + uid),
    profileImageRef: (uid) => refStorage(storage, `users/${uid}/profileImage`),
    bookingImageRef: (bookingId, imageType) =>
      refStorage(storage, `bookings/${bookingId}/${imageType}`),
    driverDocsRef: (uid, timestamp) =>
      refStorage(storage, `users/${uid}/driverDocuments/${timestamp}/`),
    singleBookingRef: (bookingKey) => ref(database, "bookings/" + bookingKey),
    requestedDriversRef: (bookingKey) =>
      ref(database, "bookings/" + bookingKey + "/requestedDrivers"),
    walletBalRef: (uid) => ref(database, "users/" + uid + "/walletBalance"),
    walletHistoryRef: (uid) => ref(database, "users/" + uid + "/walletHistory"),
    referralIdRef: (referralId) =>
      query(
        ref(database, "users"),
        orderByChild("referralId"),
        equalTo(referralId)
      ),
    trackingRef: (bookingId) => ref(database, "tracking/" + bookingId),
    tasksRef: () =>
      query(ref(database, "bookings"), orderByChild("status"), equalTo("NEW")),
    singleTaskRef: (uid, bookingId) =>
      ref(database, "bookings/" + bookingId + "/requestedDrivers/" + uid),
    bookingListRef: (uid, role) =>
      role == "rider"
        ? query(
            ref(database, "bookings"),
            orderByChild("customer"),
            equalTo(uid)
          )
        : role == "driver"
        ? query(ref(database, "bookings"), orderByChild("driver"), equalTo(uid))
        : role == "fleetadmin"
        ? query(
            ref(database, "bookings"),
            orderByChild("fleetadmin"),
            equalTo(uid)
          )
        : ref(database, "bookings"),
    chatRef: (bookingId) => ref(database, "chats/" + bookingId + "/messages"),
    withdrawRef: ref(database, "withdraws/"),
    languagesRef: ref(database, "languages"),
    languagesEditRef: (id) => ref(database, "languages/" + id),
    api: {
      MinutesPassed: MinutesPassed,
      GetDateString: GetDateString,

      fetchPlacesAutocomplete: (searchKeyword) =>
        fetchPlacesAutocomplete(searchKeyword)(firebase),
      fetchCoordsfromPlace: (place_id) =>
        fetchCoordsfromPlace(place_id)(firebase),
      fetchAddressfromCoords: (latlng) =>
        fetchAddressfromCoords(latlng)(firebase),
      getDistanceMatrix: (startLoc, destLoc) =>
        getDistanceMatrix(startLoc, destLoc)(firebase),
      getDirectionsApi: (startLoc, destLoc, waypoints) =>
        getDirectionsApi(startLoc, destLoc, waypoints)(firebase),

      RequestPushMsg: (token, data) => RequestPushMsg(token, data)(firebase),

      countries: countries,
      GetDistance: GetDistance,
      GetTripDistance: GetTripDistance,
      saveUserLocation: (uid, location) =>
        set(ref(database, "users/" + uid + "/location"), location),
      saveTracking: (bookingId, location) =>
        push(ref(database, "tracking/" + bookingId), location),

      saveUserNotification: (uid, notification) =>
        push(ref(database, "users/" + uid + "/notifications"), notification),

      fetchUserNotifications: () => (dispatch) =>
        fetchUserNotifications()(dispatch)(firebase),

      validateReferer: (referralId) => validateReferer(referralId)(firebase),
      checkUserExists: (regData) => checkUserExists(regData)(firebase),
      walletSignIn: (id) => walletSignIn(id)(firebase),

      fetchUser: (token, connectionMode) => (dispatch) =>
        fetchUser(token, connectionMode)(dispatch)(firebase),
      mobileSignIn: (verficationId, code) => (dispatch) =>
        mobileSignIn(verficationId, code)(dispatch)(firebase),
      facebookSignIn: (token) => (dispatch) =>
        facebookSignIn(token)(dispatch)(firebase),
      appleSignIn: (credentialData) => (dispatch) =>
        appleSignIn(credentialData)(dispatch)(firebase),
      mainSignUp: (data) => mainSignUp(data)(firebase),
      signOut: () => (dispatch) => signOut()(dispatch)(firebase),
      updateProfile: (userAuthData, updateData) => (dispatch) =>
        updateProfile(userAuthData, updateData)(dispatch)(firebase),
      fetchProfile: () => (dispatch) => fetchProfile()(dispatch)(firebase),
      monitorProfileChanges: () => (dispatch) =>
        monitorProfileChanges()(dispatch)(firebase),
      clearLoginError: () => (dispatch) =>
        clearLoginError()(dispatch)(firebase),
      addBooking: (bookingData) => (dispatch) =>
        addBooking(bookingData)(dispatch)(firebase),
      clearBooking: () => (dispatch) => clearBooking()(dispatch)(firebase),
      fetchBookings: (uid, role) => (dispatch) =>
        fetchBookings(uid, role)(dispatch)(firebase),
      updateBooking: (booking) => (dispatch) =>
        updateBooking(booking)(dispatch)(firebase),
      cancelBooking: (data) => (dispatch) =>
        cancelBooking(data)(dispatch)(firebase),
      fetchCancelReasons: () => (dispatch) =>
        fetchCancelReasons()(dispatch)(firebase),
      editCancellationReason: (reasons, method) => (dispatch) =>
        editCancellationReason(reasons, method)(dispatch)(firebase),
      fetchCarTypes: () => (dispatch) => fetchCarTypes()(dispatch)(firebase),
      editCarType: (data, method) => (dispatch) =>
        editCarType(data, method)(dispatch)(firebase),
      getEstimate: (bookingData) => (dispatch) =>
        getEstimate(bookingData)(dispatch)(firebase),
      clearEstimate: () => (dispatch) => clearEstimate()(dispatch)(firebase),
      fetchSettings: () => (dispatch) => fetchSettings()(dispatch)(firebase),
      editSettings: (settings) => (dispatch) =>
        editSettings(settings)(dispatch)(firebase),
      clearSettingsViewError: () => (dispatch) =>
        clearSettingsViewError()(dispatch)(firebase),
      fetchDriverEarnings: (uid, role) => (dispatch) =>
        fetchDriverEarnings(uid, role)(dispatch)(firebase),
      fetchEarningsReport: () => (dispatch) =>
        fetchEarningsReport()(dispatch)(firebase),
      fetchNotifications: () => (dispatch) =>
        fetchNotifications()(dispatch)(firebase),
      editNotifications: (notifications, method) => (dispatch) =>
        editNotifications(notifications, method)(dispatch)(firebase),
      sendNotification: (notification) => (dispatch) =>
        sendNotification(notification)(dispatch)(firebase),
      fetchPromos: () => (dispatch) => fetchPromos()(dispatch)(firebase),
      editPromo: (data, method) => (dispatch) =>
        editPromo(data, method)(dispatch)(firebase),
      fetchUsers: () => (dispatch) => fetchUsers()(dispatch)(firebase),
      fetchUsersOnce: () => (dispatch) => fetchUsersOnce()(dispatch)(firebase),
      fetchDrivers: () => (dispatch) => fetchDrivers()(dispatch)(firebase),
      addUser: (userdata) => (dispatch) =>
        addUser(userdata)(dispatch)(firebase),
      editUser: (id, user) => (dispatch) =>
        editUser(id, user)(dispatch)(firebase),
      updatePushToken: (userAuthData, token, platform) => (dispatch) =>
        updatePushToken(userAuthData, token, platform)(dispatch)(firebase),
      updateProfileImage: (userAuthData, imageBlob) => (dispatch) =>
        updateProfileImage(userAuthData, imageBlob)(dispatch)(firebase),
      requestPhoneOtpDevice: (phoneNumber, appVerifier) => (dispatch) =>
        requestPhoneOtpDevice(phoneNumber, appVerifier)(dispatch)(firebase),
      deleteUser: (uid) => (dispatch) => deleteUser(uid)(dispatch)(firebase),
      fetchPaymentMethods: () => (dispatch) =>
        fetchPaymentMethods()(dispatch)(firebase),
      addToWallet: (uid, amount) => (dispatch) =>
        addToWallet(uid, amount)(dispatch)(firebase),
      updateWalletBalance: (balance, details) => (dispatch) =>
        updateWalletBalance(balance, details)(dispatch)(firebase),
      clearMessage: () => (dispatch) => clearMessage()(dispatch)(firebase),
      updateTripPickup: (pickupAddress) => (dispatch) =>
        updateTripPickup(pickupAddress)(dispatch)(firebase),
      updateTripDrop: (dropAddress) => (dispatch) =>
        updateTripDrop(dropAddress)(dispatch)(firebase),
      updateTripCar: (selectedCar) => (dispatch) =>
        updateTripCar(selectedCar)(dispatch)(firebase),
      updatSelPointType: (selection) => (dispatch) =>
        updatSelPointType(selection)(dispatch)(firebase),
      clearTripPoints: () => (dispatch) =>
        clearTripPoints()(dispatch)(firebase),
      fetchTasks: () => (dispatch) => fetchTasks()(dispatch)(firebase),
      acceptTask: (userAuthData, task) => (dispatch) =>
        acceptTask(userAuthData, task)(dispatch)(firebase),
      cancelTask: (bookingId) => (dispatch) =>
        cancelTask(bookingId)(dispatch)(firebase),
      fetchBookingLocations: (bookingId) => (dispatch) =>
        fetchBookingLocations(bookingId)(dispatch)(firebase),
      stopLocationFetch: (bookingId) => (dispatch) =>
        stopLocationFetch(bookingId)(dispatch)(firebase),
      fetchChatMessages: (bookingId) => (dispatch) =>
        fetchChatMessages(bookingId)(dispatch)(firebase),
      sendMessage: (data) => (dispatch) =>
        sendMessage(data)(dispatch)(firebase),
      stopFetchMessages: (bookingId) => (dispatch) =>
        stopFetchMessages(bookingId)(dispatch)(firebase),
      fetchWithdraws: () => (dispatch) => fetchWithdraws()(dispatch)(firebase),
      completeWithdraw: (entry) => (dispatch) =>
        completeWithdraw(entry)(dispatch)(firebase),
      updateBookingImage: (booking, imageType, imageBlob) => (dispatch) =>
        updateBookingImage(booking, imageType, imageBlob)(dispatch)(firebase),
      editLanguage: (data, method) => (dispatch) =>
        editLanguage(data, method)(dispatch)(firebase),
      fetchLanguages: () => (dispatch) => fetchLanguages()(dispatch)(firebase),
      createNewPOT: (passenger, value) => (dispatch) =>
        createNewPOT(passenger, value)(dispatch)(firebase),
      confirmDeliveryByApp: (address) => (dispatch) =>
        confirmDeliveryByApp(address)(dispatch)(firebase),
    },
  };

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
};

export { FirebaseContext, FirebaseProvider, store };
