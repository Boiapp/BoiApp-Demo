import {
  CONFIRM_DELIVERY_BY_DRIVER,
  CONFIRM_DELIVERY_BY_DRIVER_SUCCESS,
  CONFIRM_DELIVERY_BY_DRIVER_FAILED,
  CONFIRM_DELIVERY_BY_APP,
  CONFIRM_DELIVERY_BY_APP_SUCCESS,
  CONFIRM_DELIVERY_BY_APP_FAILED,
  CONFIRM_DELIVERY_BY_PASSENGER,
  CONFIRM_DELIVERY_BY_PASSENGER_SUCCESS,
  CONFIRM_DELIVERY_BY_PASSENGER_FAILED,
  CREATE_NEW_POT,
  CREATE_NEW_POT_SUCCESS,
  CREATE_NEW_POT_FAILED,
  PAYMENT_POT,
  PAYMENT_POT_SUCCESS,
  PAYMENT_POT_FAILED,
  START_RIDE_BY_DRIVER,
  START_RIDE_BY_DRIVER_SUCCESS,
  START_RIDE_BY_DRIVER_FAILED,
} from "../store/types";

export const createNewPOT =
  (passenger, value) => (dispatch) => async (firebase) => {
    const { config } = firebase;
    dispatch({
      type: CREATE_NEW_POT,
      payload: {
        passenger,
        value,
      },
    });

    const response = await fetch(
      `https://${config.project}.web.app/web3-create_new_pot`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          passenger: passenger,
          value: value,
        }),
      }
    );

    const json = await response.json();

    return json;
  };

export const confirmDeliveryByApp =
  (address) => (dispatch) => async (firebase) => {
    const { config } = firebase;

    const response = await fetch(
      `https://${config.project}.web.app/web3-confirm_by_app`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      }
    );

    const json = await response.json();

    console.log(json);

    dispatch({
      type: CONFIRM_DELIVERY_BY_APP_SUCCESS,
      payload: json,
      success: true,
    });

    return json;
  };

export const returnTokensToPassenger =
  (address) => (dispatch) => async (firebase) => {
    const { config } = firebase;

    const response = await fetch(
      `https://${config.project}.web.app/web3-withdraw_for_passenger`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
        }),
      }
    );

    const json = await response.json();

    return json;
  };
