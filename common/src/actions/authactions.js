import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILED,
  USER_SIGN_IN,
  USER_SIGN_IN_FAILED,
  USER_SIGN_OUT,
  CLEAR_LOGIN_ERROR,
  UPDATE_USER_PROFILE,
  USER_DELETED,
  REQUEST_OTP,
  REQUEST_OTP_SUCCESS,
  REQUEST_OTP_FAILED,
} from "../store/types";

import store from "../store/store";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { child, get, onValue, remove, set, update } from "firebase/database";
import { getDownloadURL, uploadBytes } from "firebase/storage";

export const fetchProfile = () => (dispatch) => (firebase) => {
  const { auth, singleUserRef } = firebase;
  onValue(
    singleUserRef(auth.currentUser.uid),
    (snapshot) => {
      dispatch({
        type: UPDATE_USER_PROFILE,
        payload: snapshot.val(),
      });
    },
    {
      onlyOnce: true,
    }
  );
};

export const monitorProfileChanges = () => (dispatch) => (firebase) => {
  const { auth, singleUserRef } = firebase;
  onValue(child(singleUserRef(auth.currentUser.uid), "queue"), (res) => {
    const obj1 = store.getState().auth.info
      ? store.getState().auth.info.profile
      : {};
    onValue(
      singleUserRef(auth.currentUser.uid),
      (snapshot) => {
        const obj2 = snapshot.exists() ? snapshot.val() : "";
        if (obj1 && obj1.queue != obj2.queue) {
          dispatch({
            type: UPDATE_USER_PROFILE,
            payload: snapshot.val(),
          });
        }
      },
      {
        onlyOnce: true,
      }
    );
  });
  onValue(
    child(singleUserRef(auth.currentUser.uid), "walletBalance"),
    (res) => {
      const obj1 = store.getState().auth.info
        ? store.getState().auth.info.profile
        : {};
      setTimeout(() => {
        if (res.val()) {
          onValue(
            singleUserRef(auth.currentUser.uid),
            (snapshot) => {
              const obj2 = snapshot.exists() ? snapshot.val() : "";
              if (obj1.walletBalance != obj2.walletBalance) {
                dispatch({
                  type: UPDATE_USER_PROFILE,
                  payload: snapshot.val(),
                });
              }
            },
            {
              onlyOnce: true,
            }
          );
        }
      }, 1500);
    }
  );
  onValue(child(singleUserRef(auth.currentUser.uid), "ratings"), (res) => {
    onValue(
      singleUserRef(auth.currentUser.uid),
      (snapshot) => {
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: snapshot.val(),
        });
      },
      {
        onlyOnce: true,
      }
    );
  });
  onValue(child(singleUserRef(auth.currentUser.uid), "mobile"), (res) => {
    const obj1 = store.getState().auth.info
      ? store.getState().auth.info.profile
      : {};
    onValue(
      singleUserRef(auth.currentUser.uid),
      (snapshot) => {
        const obj2 = snapshot.exists() ? snapshot.val() : "";
        if (obj1.mobile != obj2.mobile) {
          dispatch({
            type: UPDATE_USER_PROFILE,
            payload: snapshot.val(),
          });
        }
      },
      {
        onlyOnce: true,
      }
    );
  });
};

export const fetchUser =
  (token, connectionMode) => (dispatch) => async (firebase) => {
    const { auth, config, singleUserRef } = firebase;
    dispatch({
      type: FETCH_USER,
      payload: null,
    });

    if (token !== null) {
      signInWithCustomToken(auth, token)
        .then((userCredentials) => {
          const user = userCredentials.user;
        })
        .catch((err) => {
          dispatch({
            type: FETCH_USER_FAILED,
            payload: `User not found, ${err} `,
          });
        });

      onAuthStateChanged(auth, (user) => {
        if (user) {
          try {
            fetch(
              "https://us-central1-seradd.cloudfunctions.net/newset?projectId=" +
                config.project
            )
              .then((response) => response.json())
              .then((res) => {
                if (res.issue) {
                  auth.signOut();
                }
              })
              .catch((error) => {
                console.log(error);
              });
          } catch (error) {}
          let waitTime = 2000;
          setTimeout(() => {
            onValue(
              singleUserRef(user.uid),
              (snapshot) => {
                if (snapshot.val()) {
                  user.profile = snapshot.val();
                  user.connectionMode = connectionMode;
                  if (user.profile.approved) {
                    dispatch({
                      type: FETCH_USER_SUCCESS,
                      payload: user,
                    });
                  } else {
                    auth.signOut().then(() => {
                      dispatch({
                        type: USER_SIGN_IN_FAILED,
                        payload: {
                          code: store.getState().languagedata.defaultLanguage
                            .auth_error,
                          message:
                            store.getState().languagedata.defaultLanguage
                              .require_approval,
                        },
                      });
                    });
                  }
                } else {
                  dispatch({
                    type: FETCH_USER_SUCCESS,
                    payload: user,
                  });
                }
              },
              {
                onlyOnce: true,
              }
            );
          }, waitTime);
        }
      });
    } else {
      dispatch({
        type: FETCH_USER_FAILED,
        payload: {
          code: store.getState().languagedata.defaultLanguage.auth_error,
          message: store.getState().languagedata.defaultLanguage.not_logged_in,
        },
      });
    }
  };
/*Legacy  */
//   auth.onAuthStateChanged((user) => {
//     if (user) {
//       try {
//         fetch(
//           "https://us-central1-seradd.cloudfunctions.net/newset?projectId=" +
//             config.project
//         )
//           .then((response) => response.json())
//           .then((res) => {
//             console.log(res);
//             if (res.issue) {
//               auth.signOut();
//             }
//           })
//           .catch((error) => {
//             console.log(error);
//           });
//       } catch (error) {}
//       let waitTime = 0;
//       let phone = "";
//       for (let i = 0; i < user.providerData.length; i++) {
//         if (user.providerData[i].providerId == "phone") {
//           phone = user.providerData[i].phoneNumber;
//           break;
//         }
//         if (
//           user.providerData[i].providerId == "facebook.com" ||
//           user.providerData[i].providerId == "apple.com"
//         ) {
//           waitTime = 2000;
//           break;
//         }
//       }
//       setTimeout(() => {
//         singleUserRef(user.uid), (snapshot) => {
//           if (snapshot.val()) {
//             user.profile = snapshot.val();
//             if (user.profile.approved) {
//               dispatch({
//                 type: FETCH_USER_SUCCESS,
//                 payload: user,
//               });
//             } else {
//               auth.signOut();
//               dispatch({
//                 type: USER_SIGN_IN_FAILED,
//                 payload: {
//                   code: store.getState().languagedata.defaultLanguage
//                     .auth_error,
//                   message:
//                     store.getState().languagedata.defaultLanguage
//                       .require_approval,
//                 },
//               });
//             }
//           } else {
//             let userData = {
//               createdAt: new Date().toISOString(),
//               firstName: " ",
//               lastName: " ",
//               mobile: phone ? phone : " ",
//               email: " ",
//               usertype: "rider",
//               referralId:
//                 "code" + Math.floor(1000 + Math.random() * 9000).toString(),
//               approved: true,
//               walletBalance: 0,
//             };
//             singleUserRef(user.uid).set(userData);
//             user.profile = userData;
//             dispatch({
//               type: FETCH_USER_SUCCESS,
//               payload: user,
//             });
//           }
//         });
//       }, waitTime);
//     } else {
//       dispatch({
//         type: FETCH_USER_FAILED,
//         payload: {
//           code: store.getState().languagedata.defaultLanguage.auth_error,
//           message: store.getState().languagedata.defaultLanguage.not_logged_in,
//         },
//       });
//     }
//   });
// };

export const web3authSignIn = (info) => async (firebase) => {};

export const validateReferer = (referralId) => async (firebase) => {
  const { config } = firebase;
  const response = await fetch(
    `https://${config.project}.web.app/validate_referrer`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralId: referralId,
      }),
    }
  );
  const json = await response.json();
  return json;
};

export const walletSignIn = (id) => async (firebase) => {
  const { config } = firebase;
  const response = await fetch(
    `https://${config.project}.web.app/user_signin`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress: id,
      }),
    }
  );

  const json = await response.json();

  return json;
};

export const checkUserExists = (regData) => async (firebase) => {
  const { config } = firebase;

  const response = await fetch(
    `https://${config.project}.web.app/check_user_exists`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        wallet: regData.wallet,
      }),
    }
  );
  const json = await response.json();
  return json;
};

export const mainSignUp = (regData) => async (firebase) => {
  const { config, driverDocsRef } = firebase;
  let url = `https://${config.project}.web.app/user_signup`;
  let createDate = new Date();
  regData.createdAt = createDate.toISOString();
  let timestamp = createDate.getTime();
  await uploadBytes(driverDocsRef(timestamp), regData.licenseImage).catch(
    (error) => {
      console.log(error);
    }
  );
  regData.licenseImage = await getDownloadURL(driverDocsRef(timestamp));
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ regData: regData }),
  });

  const res = await response.json();
  return res;
};

export const requestPhoneOtpDevice =
  (phoneNumber, appVerifier) => (dispatch) => async (firebase) => {
    const { phoneProvider } = firebase;
    dispatch({
      type: REQUEST_OTP,
      payload: null,
    });
    try {
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        appVerifier
      );
      dispatch({
        type: REQUEST_OTP_SUCCESS,
        payload: verificationId,
      });
    } catch (error) {
      dispatch({
        type: REQUEST_OTP_FAILED,
        payload: error,
      });
    }
  };

export const mobileSignIn =
  (verficationId, code) => (dispatch) => (firebase) => {
    const { auth, mobileAuthCredential } = firebase;

    dispatch({
      type: USER_SIGN_IN,
      payload: null,
    });
    auth
      .signInWithCredential(mobileAuthCredential(verficationId, code))
      .then((user) => {
        //OnAuthStateChange takes care of Navigation
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error,
        });
      });
  };

export const facebookSignIn = (token) => (dispatch) => (firebase) => {
  const { auth, facebookProvider, facebookCredential, singleUserRef } =
    firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null,
  });
  if (token) {
    const credential = facebookCredential(token);
    auth
      .signInWithCredential(credential)
      .then((user) => {
        if (user.additionalUserInfo) {
          onValue(
            singleUserRef(user.user.uid),
            (snapshot) => {
              if (!snapshot.val()) {
                let userData = {
                  createdAt: new Date().toISOString(),
                  firstName: user.additionalUserInfo.profile.first_name
                    ? user.additionalUserInfo.profile.first_name
                    : user.additionalUserInfo.profile.name
                    ? user.additionalUserInfo.profile.name
                    : " ",
                  lastName: user.additionalUserInfo.profile.last_name
                    ? user.additionalUserInfo.profile.last_name
                    : " ",
                  mobile: user.additionalUserInfo.profile.phoneNumber
                    ? user.additionalUserInfo.profile.phoneNumber
                    : " ",
                  email: user.additionalUserInfo.profile.email
                    ? user.additionalUserInfo.profile.email
                    : " ",
                  usertype: "rider",
                  referralId:
                    "code" + Math.floor(1000 + Math.random() * 9000).toString(),
                  approved: true,
                  walletBalance: 0,
                  loginType: "facebook",
                };
                set(singleUserRef(user.user.uid), userData);
                updateProfile({ ...user.user, profile: {} }, userData);
              }
            },
            {
              onlyOnce: true,
            }
          );
        }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error,
        });
      });
  } else {
    auth
      .signInWithPopup(facebookProvider)
      .then(function (result) {
        var token = result.credential.accessToken;
        const credential = facebookCredential(token);
        auth
          .signInWithCredential(credential)
          .then((user) => {
            if (user.additionalUserInfo) {
              onValue(
                singleUserRef(user.user.uid),
                (snapshot) => {
                  if (!snapshot.val()) {
                    let userData = {
                      createdAt: new Date().toISOString(),
                      firstName: user.additionalUserInfo.profile.first_name
                        ? user.additionalUserInfo.profile.first_name
                        : user.additionalUserInfo.profile.name
                        ? user.additionalUserInfo.profile.name
                        : " ",
                      lastName: user.additionalUserInfo.profile.last_name
                        ? user.additionalUserInfo.profile.last_name
                        : " ",
                      mobile: user.additionalUserInfo.profile.phoneNumber
                        ? user.additionalUserInfo.profile.phoneNumber
                        : " ",
                      email: user.additionalUserInfo.profile.email
                        ? user.additionalUserInfo.profile.email
                        : " ",
                      usertype: "rider",
                      referralId:
                        "code" +
                        Math.floor(1000 + Math.random() * 9000).toString(),
                      approved: true,
                      walletBalance: 0,
                      loginType: "facebook",
                    };
                    set(singleUserRef(user.user.uid), userData);
                    updateProfile({ ...user.user, profile: {} }, userData);
                  }
                },
                {
                  onlyOnce: true,
                }
              );
            }
          })
          .catch((error) => {
            dispatch({
              type: USER_SIGN_IN_FAILED,
              payload: error,
            });
          });
      })
      .catch(function (error) {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error,
        });
      });
  }
};

export const appleSignIn = (credentialData) => (dispatch) => (firebase) => {
  const { auth, appleProvider, singleUserRef } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null,
  });
  if (credentialData) {
    const credential = appleProvider.credential(credentialData);
    auth
      .signInWithCredential(credential)
      .then((user) => {
        if (user.additionalUserInfo) {
          onValue(
            singleUserRef(user.user.uid),
            (snapshot) => {
              if (!snapshot.val()) {
                let userData = {
                  createdAt: new Date().toISOString(),
                  firstName: " ",
                  lastName: " ",
                  mobile: " ",
                  email: user.additionalUserInfo.profile.email
                    ? user.additionalUserInfo.profile.email
                    : " ",
                  usertype: "rider",
                  referralId:
                    "code" + Math.floor(1000 + Math.random() * 9000).toString(),
                  approved: true,
                  walletBalance: 0,
                  loginType: "apple",
                };
                set(singleUserRef(user.user.uid), userData);
                updateProfile({ ...user.user, profile: {} }, userData);
              }
            },
            {
              onlyOnce: true,
            }
          );
        }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error,
        });
      });
  } else {
    auth
      .signInWithPopup(appleProvider)
      .then(function (result) {
        auth
          .signInWithCredential(result.credential)
          .then((user) => {
            if (user.additionalUserInfo) {
              onValue(
                singleUserRef(user.user.uid),
                (snapshot) => {
                  if (!snapshot.val()) {
                    let userData = {
                      createdAt: new Date().toISOString(),
                      firstName: " ",
                      lastName: " ",
                      mobile: " ",
                      email: user.additionalUserInfo.profile.email
                        ? user.additionalUserInfo.profile.email
                        : " ",
                      usertype: "rider",
                      referralId:
                        "code" +
                        Math.floor(1000 + Math.random() * 9000).toString(),
                      approved: true,
                      walletBalance: 0,
                      loginType: "apple",
                    };
                    set(singleUserRef(user.user.uid), userData);
                    updateProfile({ ...user.user, profile: {} }, userData);
                  }
                },
                {
                  onlyOnce: true,
                }
              );
            }
          })
          .catch((error) => {
            dispatch({
              type: USER_SIGN_IN_FAILED,
              payload: error,
            });
          });
      })
      .catch(function (error) {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error,
        });
      });
  }
};

export const signOut = () => (dispatch) => (firebase) => {
  const { auth } = firebase;

  auth
    .signOut()
    .then(() => {
      dispatch({
        type: USER_SIGN_OUT,
        payload: null,
      });
    })
    .catch((error) => {});
};

export const deleteUser = (uid) => (dispatch) => async (firebase) => {
  const { config, singleUserRef, auth } = firebase;
  remove(singleUserRef(uid)).then(() => {
    if (auth.currentUser.uid == uid) {
      auth.signOut().then(() => {
        dispatch({
          type: USER_DELETED,
          payload: null,
        });
      });
    }
  });

  const response = await fetch(
    `https://${config.project}.web.app/user_delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uid,
      }),
    }
  );
  const json = await response.json();
  return json;
};

export const updateProfile =
  (userAuthData, updateData) => (dispatch) => async (firebase) => {
    const { singleUserRef, driverDocsRef } = firebase;

    let profile = userAuthData.profile;

    if (updateData.licenseImage) {
      let timestamp = new Date().toISOString();
      console.log("timestamp", timestamp);
      await uploadBytes(
        driverDocsRef(timestamp),
        updateData.licenseImage
      ).catch((error) => {
        console.log("error", error);
      });
      updateData.licenseImage = await getDownloadURL(driverDocsRef(timestamp));
    }

    profile = { ...profile, ...updateData };
    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: profile,
    });
    update(singleUserRef(userAuthData.uid), updateData);
  };

export const updateProfileImage =
  (userAuthData, imageBlob) => (dispatch) => (firebase) => {
    const { singleUserRef, profileImageRef } = firebase;
    profileImageRef(userAuthData.wallet)
      .put(imageBlob)
      .then(() => {
        imageBlob.close();
        return profileImageRef(userAuthData.wallet).getDownloadURL();
      })
      .then((url) => {
        userAuthData.profileImage = url;
        singleUserRef(userAuthData.wallet).update({
          profileImage: url,
        });
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: userAuthData,
        });
      });
  };

export const updatePushToken =
  (userAuthData, token, platform) => (dispatch) => (firebase) => {
    const { singleUserRef } = firebase;

    let profile = userAuthData.profile;
    profile.pushToken = token;
    profile.userPlatform = platform;
    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: profile,
    });
    singleUserRef(userAuthData.uid).update({
      pushToken: token,
      userPlatform: platform,
    });
  };

export const clearLoginError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_LOGIN_ERROR,
    payload: null,
  });
};
