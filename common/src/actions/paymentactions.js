import {
  FETCH_PAYMENT_METHODS,
  FETCH_PAYMENT_METHODS_SUCCESS,
  FETCH_PAYMENT_METHODS_FAILED,
  UPDATE_WALLET_BALANCE,
  UPDATE_WALLET_BALANCE_SUCCESS,
  UPDATE_WALLET_BALANCE_FAILED,
  CLEAR_PAYMENT_MESSAGES,
  UPDATE_USER_PROFILE,
} from "../store/types";
import { RequestPushMsg } from "../other/NotificationFunctions";

import store from "../store/store";
import { push, set } from "firebase/database";

export const fetchPaymentMethods = () => (dispatch) => (firebase) => {
  const { config } = firebase;

  dispatch({
    type: FETCH_PAYMENT_METHODS,
    payload: null,
  });
  fetch(`https://${config.projectId}.web.app/get_providers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.length > 0) {
        dispatch({
          type: FETCH_PAYMENT_METHODS_SUCCESS,
          payload: responseJson,
        });
      } else {
        dispatch({
          type: FETCH_PAYMENT_METHODS_FAILED,
          payload:
            store.getState().languagedata.defaultLanguage.no_provider_found,
        });
      }
    })
    .catch((error) => {
      dispatch({
        type: FETCH_PAYMENT_METHODS_FAILED,
        payload:
          store.getState().languagedata.defaultLanguage.provider_fetch_error +
          ": " +
          error.toString(),
      });
    });
};

export const clearMessage = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_PAYMENT_MESSAGES,
    payload: null,
  });
};

export const addToWallet = (uid, amount) => (dispatch) => async (firebase) => {
  const { walletBalRef, walletHistoryRef, singleUserRef, settingsRef } =
    firebase;

  dispatch({
    type: UPDATE_WALLET_BALANCE,
    payload: null,
  });

  const settingsdata = await onValue(
    settingsRef,
    (snapshot) => {
      return snapshot.val();
    },
    {
      onlyOnce: true,
    }
  );
  const settings = settingsdata.val();

  onValue(
    singleUserRef(uid),
    (snapshot) => {
      if (snapshot.val()) {
        let walletBalance = parseFloat(snapshot.val().walletBalance);
        walletBalance = parseFloat(
          (parseFloat(walletBalance) + parseFloat(amount)).toFixed(
            settings.decimal
          )
        );
        let details = {
          type: "Credit",
          amount: parseFloat(amount),
          date: new Date().toString(),
          txRef: "AdminCredit",
        };
        set(walletBalRef(uid), walletBalance)
          .then(() => {
            push(walletHistoryRef(uid), details)
              .then(() => {
                dispatch({
                  type: UPDATE_WALLET_BALANCE_SUCCESS,
                  payload: null,
                });
              })
              .catch((error) => {
                dispatch({
                  type: UPDATE_WALLET_BALANCE_FAILED,
                  payload: error.code + ": " + error.message,
                });
              });
            RequestPushMsg(snapshot.val().pushToken, {
              title:
                store.getState().languagedata.defaultLanguage
                  .notification_title,
              msg: store.getState().languagedata.defaultLanguage.wallet_updated,
              screen: "Wallet",
            })(firebase);
          })
          .catch((error) => {
            dispatch({
              type: UPDATE_WALLET_BALANCE_FAILED,
              payload: error.code + ": " + error.message,
            });
          });
      }
    },
    {
      onlyOnce: true,
    }
  );
};

export const updateWalletBalance =
  (balance, details) => (dispatch) => async (firebase) => {
    const {
      walletBalRef,
      walletHistoryRef,
      auth,
      singleUserRef,
      withdrawRef,
      settingsRef,
    } = firebase;

    let uid = auth.currentUser.uid;
    dispatch({
      type: UPDATE_WALLET_BALANCE,
      payload: null,
    });

    const settingsdata = await onValue(
      settingsRef,
      (snapshot) => {
        return snapshot.val();
      },
      {
        onlyOnce: true,
      }
    );
    const settings = settingsdata.val();
    set(
      walletBalRef(uid),
      parseFloat(parseFloat(balance).toFixed(settings.decimal))
    )
      .then(() => {
        push(walletHistoryRef(uid), details)
          .then(() => {
            onValue(
              singleUserRef(uid),
              (snapshot) => {
                if (snapshot.val()) {
                  let profile = snapshot.val();
                  dispatch({
                    type: UPDATE_USER_PROFILE,
                    payload: profile,
                  });
                  dispatch({
                    type: UPDATE_WALLET_BALANCE_SUCCESS,
                    payload: null,
                  });

                  RequestPushMsg(snapshot.val().pushToken, {
                    title:
                      store.getState().languagedata.defaultLanguage
                        .notification_title,
                    msg: store.getState().languagedata.defaultLanguage
                      .wallet_updated,
                    screen: "Wallet",
                  })(firebase);

                  if (details.type == "Withdraw") {
                    push(withdrawRef, {
                      uid: uid,
                      name: profile.firstName + " " + profile.lastName,
                      amount: parseFloat(details.amount),
                      date: details.date,
                      bankName: profile.bankName ? profile.bankName : "",
                      bankCode: profile.bankCode ? profile.bankCode : "",
                      bankAccount: profile.bankAccount
                        ? profile.bankAccount
                        : "",
                      processed: false,
                    });
                  }
                }
              },
              {
                onlyOnce: true,
              }
            );
          })
          .catch((error) => {
            dispatch({
              type: UPDATE_WALLET_BALANCE_FAILED,
              payload: error.code + ": " + error.message,
            });
          });
      })
      .catch((error) => {
        dispatch({
          type: UPDATE_WALLET_BALANCE_FAILED,
          payload: error.code + ": " + error.message,
        });
      });
  };
