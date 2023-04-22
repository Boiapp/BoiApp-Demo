import { child, onValue } from "firebase/database";
import {
  FETCH_WITHDRAWS,
  FETCH_WITHDRAWS_SUCCESS,
  FETCH_WITHDRAWS_FAILED,
  EDIT_WITHDRAWS,
} from "../store/types";

export const fetchWithdraws = () => (dispatch) => (firebase) => {
  const { withdrawRef } = firebase;

  dispatch({
    type: FETCH_WITHDRAWS,
    payload: null,
  });
  onValue(withdrawRef, (snapshot) => {
    if (snapshot.val()) {
      const data = snapshot.val();
      const arr = Object.keys(data).map((i) => {
        data[i].id = i;
        return data[i];
      });
      dispatch({
        type: FETCH_WITHDRAWS_SUCCESS,
        payload: arr.reverse(),
      });
    } else {
      dispatch({
        type: FETCH_WITHDRAWS_FAILED,
        payload: "No WITHDRAWS available.",
      });
    }
  });
};

export const completeWithdraw = (entry) => (dispatch) => (firebase) => {
  const { withdrawRef } = firebase;

  dispatch({
    type: EDIT_WITHDRAWS,
    payload: entry,
  });
  child(withdrawRef, entry.id).update({
    ...entry,
    processed: true,
    procesDate: new Date().toString(),
  });
};
