import {
  FETCH_TASKS,
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILED,
  ACCEPT_TASK,
  CANCEL_TASK,
} from "../store/types";
import store from "../store/store";
import { updateProfile } from "./authactions";
import { RequestPushMsg } from "../other/NotificationFunctions";
import { returnTokensToPassenger } from "./web3actions";
import { get, onValue, push, runTransaction } from "firebase/database";

export const fetchTasks = () => (dispatch) => (firebase) => {
  const { auth, tasksRef } = firebase;

  let uid = auth.currentUser.uid;
  dispatch({
    type: FETCH_TASKS,
    payload: null,
  });
  onValue(tasksRef(), (snapshot) => {
    if (snapshot.val()) {
      let data = snapshot.val();
      const arr = Object.keys(data)
        .filter(
          (i) => data[i].requestedDrivers && data[i].requestedDrivers[uid]
        )
        .map((i) => {
          data[i].id = i;
          return data[i];
        });
      dispatch({
        type: FETCH_TASKS_SUCCESS,
        payload: arr,
      });
    } else {
      dispatch({
        type: FETCH_TASKS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_tasks,
      });
    }
  });
};

export const acceptTask = (userAuthData, task) => (dispatch) => (firebase) => {
  const { trackingRef, singleUserRef, singleBookingRef } = firebase;

  let uid = userAuthData.uid;

  onValue(
    singleUserRef(uid),
    (snapshot) => {
      let profile = snapshot.val();

      userAuthData.profile = profile;

      runTransaction(singleBookingRef(task.id), (booking) => {
        if (booking && booking.requestedDrivers) {
          booking.driver = uid;
          booking.driver_image = profile.profileImage
            ? profile.profileImage
            : "";
          booking.driver_name = profile.firstName + " " + profile.lastName;
          // booking.driver_contact = profile.mobile;
          booking.driver_token = profile.pushToken;
          booking.vehicle_number = profile.vehicleNumber;
          booking.driverRating = profile.ratings
            ? profile.ratings.userrating
            : "0";
          booking.fleetadmin = profile.fleetadmin ? profile.fleetadmin : "";
          booking.status = "ACCEPTED";
          booking.requestedDrivers = null;
          return booking;
        }
      }).then(() => {
        get(singleBookingRef(task.id))
          .then((snapshot) => {
            if (!snapshot.exists()) {
              return;
            } else {
              let requestedDrivers =
                snapshot.val() && snapshot.val().requestedDrivers;
              let driverId = snapshot.val() && snapshot.val().driver;

              if (requestedDrivers == undefined && driverId === uid) {
                updateProfile(userAuthData, { queue: true })(dispatch)(
                  firebase
                );

                RequestPushMsg(task.customer_token, {
                  title:
                    store.getState().languagedata.defaultLanguage
                      .notification_title,
                  msg:
                    profile.firstName +
                    store.getState().languagedata.defaultLanguage
                      .accept_booking_request,
                  screen: "BookedCab",
                  params: { bookingId: task.id },
                })(firebase);

                push(trackingRef(task.id), {
                  at: new Date().getTime(),
                  status: "ACCEPTED",
                  lat: profile.location.lat,
                  lng: profile.location.lng,
                });

                dispatch({
                  type: ACCEPT_TASK,
                  payload: { task: task },
                });
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    {
      onlyOnce: true,
    }
  );
};

export const cancelTask = (bookingId) => (dispatch) => (firebase) => {
  const { auth, singleTaskRef, singleBookingRef, config } = firebase;

  let uid = auth.currentUser.uid;

  runTransaction(singleBookingRef(bookingId), (booking) => {
    if (booking && booking.requestedDrivers) {
      if (
        booking.requestedDrivers !== null &&
        Object.keys(booking.requestedDrivers).length === 1
      ) {
        booking.status = "CANCELLED";
        RequestPushMsg(booking.customer_token, {
          title:
            store.getState().languagedata.defaultLanguage.notification_title,
          msg:
            store.getState().languagedata.defaultLanguage.booking_cancelled +
            bookingId,
          screen: "BookedCab",
          params: { bookingId: bookingId },
        })(firebase);
        /* Devolver el pago al pasajero */
        try {
          let json = fetch(
            `https://${config.project}.web.app/web3-withdraw_for_passenger`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                address: booking.addressContract,
              }),
            }
          ).then((response) => (json = response.json()));

          if (json) {
            console.log("Tokens returned to passenger", json);
          } else {
            console.log("Tokens not returned to passenger");
          }
        } catch (error) {
          console.log(error);
        }
      }
      delete booking.requestedDrivers[uid];
      return booking;
    }
  }).then(() => {
    // singleTaskRef(uid, bookingId).remove();
    dispatch({
      type: CANCEL_TASK,
      payload: { uid: uid, bookingId: bookingId },
    });
  });
};
