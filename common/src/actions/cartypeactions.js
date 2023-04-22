import {
  FETCH_CAR_TYPES,
  FETCH_CAR_TYPES_SUCCESS,
  FETCH_CAR_TYPES_FAILED,
  EDIT_CAR_TYPE,
} from "../store/types";
import store from "../store/store";
import { onValue, push, remove, set } from "firebase/database";

export const fetchCarTypes = () => (dispatch) => (firebase) => {
  const { carTypesRef } = firebase;

  dispatch({
    type: FETCH_CAR_TYPES,
    payload: null,
  });
  onValue(carTypesRef, (snapshot) => {
    if (snapshot.val()) {
      let data = snapshot.val();
      const arr = Object.keys(data).map((i) => {
        data[i].id = i;
        return data[i];
      });
      dispatch({
        type: FETCH_CAR_TYPES_SUCCESS,
        payload: arr,
      });
    } else {
      dispatch({
        type: FETCH_CAR_TYPES_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_cars,
      });
    }
  });
};

export const editCarType = (cartype, method) => (dispatch) => (firebase) => {
  const { carTypesRef, carTypesEditRef } = firebase;
  dispatch({
    type: EDIT_CAR_TYPE,
    payload: { method, cartype },
  });
  if (method === "Add") {
    push(carTypesRef, cartype);
  } else if (method === "Delete") {
    remove(carTypesEditRef(cartype.id));
  } else {
    set(carTypesEditRef(cartype.id), cartype);
  }
};
