import {
  FETCH_BOOKING_LOCATION,
  FETCH_BOOKING_LOCATION_SUCCESS,
  FETCH_BOOKING_LOCATION_FAILED,
  STOP_LOCATION_FETCH,
} from "../store/types";
import store from "../store/store";
import { limitToLast, off, onValue, query } from "firebase/database";

export const fetchBookingLocations =
  (bookingId) => (dispatch) => (firebase) => {
    const { trackingRef } = firebase;

    dispatch({
      type: FETCH_BOOKING_LOCATION,
      payload: bookingId,
    });

    const queryTrackingRef = query(trackingRef(bookingId), limitToLast(1));

    onValue(queryTrackingRef, (snapshot) => {
      if (snapshot.val()) {
        let data = snapshot.val();
        const locations = Object.keys(data).map((i) => {
          return data[i];
        });
        if (locations.length == 1) {
          dispatch({
            type: FETCH_BOOKING_LOCATION_SUCCESS,
            payload: locations[0],
          });
        } else {
          dispatch({
            type: FETCH_BOOKING_LOCATION_FAILED,
            payload:
              store.getState().languagedata.defaultLanguage
                .location_fetch_error,
          });
        }
      } else {
        dispatch({
          type: FETCH_BOOKING_LOCATION_FAILED,
          payload:
            store.getState().languagedata.defaultLanguage.location_fetch_error,
        });
      }
    });
  };

export const stopLocationFetch = (bookingId) => (dispatch) => (firebase) => {
  const { trackingRef } = firebase;

  dispatch({
    type: STOP_LOCATION_FETCH,
    payload: bookingId,
  });
  off(trackingRef(bookingId));
};
