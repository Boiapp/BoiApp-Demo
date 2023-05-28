/*eslint no-loop-func: "off"*/
const appcat = require("./common/appcat");
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

const RequestPushMsg = require("./common").RequestPushMsg;
const addToWallet = require("./common").addToWallet;
const deductFromWallet = require("./common").deductFromWallet;
const getDistance = require("./common").getDistance;
const getHtml = require("./common").getHtml;
const returnTokens = require("./common").returnTokens;

exports.googleapis = require("./google-apis");
exports.web3 = require("./web3");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trim-modem-361020-default-rtdb.firebaseio.com",
});

const providers = [];

// exports.paypal = require("./providers/paypal");
// exports.braintree = require("./providers/braintree");
// exports.stripe = require("./providers/stripe");
// exports.paytm = require("./providers/paytm");
// exports.payulatam = require("./providers/payulatam");
// exports.flutterwave = require("./providers/flutterwave");
// exports.paystack = require("./providers/paystack");
// exports.payfast = require("./providers/payfast");
// exports.liqpay = require("./providers/liqpay");
// exports.culqi = require("./providers/culqi");
// exports.mercadopago = require("./providers/mercadopago");
// exports.test = require('./providers/test');

// exports.get_providers = functions.https.onRequest((request, response) => {
//   response.set("Access-Control-Allow-Origin", "*");
//   response.set("Access-Control-Allow-Headers", "Content-Type");
//   let arr = [];
//   for (let i = 0; i < providers.length; i++) {
//     arr.push({
//       name: providers[i],
//       link: "/" + providers[i] + "-link",
//     });
//   }
//   response.send(arr);
// });

exports.setup = functions.https.onRequest(async (request, response) => {
  admin
    .database()
    .ref("/users")
    .once("value", (snapshot) => {
      if (snapshot.val()) {
        response.send(getHtml("Setup done already"));
        return true;
      } else {
        if (request.query.mobile) {
          admin
            .auth()
            .createUser({
              phoneNumber: request.query.mobile,
            })
            .then((userRecord) => {
              const sampledb = require("./json/" + appcat + "-sample-db.json");
              const enJson = require("./json/" + appcat + "-lang-en.json");
              sampledb["languages"]["lang1"]["keyValuePairs"] = enJson;
              const projectId = admin.instanceId().app.options.projectId;
              let users = {};
              users[userRecord.uid] = {
                firstName: "Admin",
                lastName: "Admin",
                mobile: request.query.mobile,
                usertype: "admin",
                approved: true,
              };
              sampledb["users"] = users;
              admin.database().ref("/").set(sampledb);
              response.redirect("/");
              return true;
            })
            .catch((error) => {
              response.send(getHtml(error.message));
              return true;
            });
        } else {
          response.send(getHtml("Mobile number not found."));
          return true;
        }
      }
      return true;
    });
});

exports.success = functions.https.onRequest(async (request, response) => {
  const language = Object.values(
    (
      await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value")
    ).val()
  )[0].keyValuePairs;
  var amount_line = request.query.amount
    ? `<h3>${language.payment_of}<strong>${request.query.amount}</strong>${language.was_successful}</h3>`
    : "";
  var order_line = request.query.order_id
    ? `<h5>${language.order_no}${request.query.order_id}</h5>`
    : "";
  var transaction_line = request.query.transaction_id
    ? `<h6>${language.transaction_id}${request.query.transaction_id}</h6>`
    : "";
  response.status(200).send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.success_payment}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                h3, h6, h4 { margin: 0px; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'>
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/accept-47587_960_720.png' alt='Icon'> 
                    ${amount_line}
                    ${order_line}
                    ${transaction_line}
                    <h4>${language.payment_thanks}</h4>
                </div>
            </div>
            ${
              request.query.order_id &&
              request.query.order_id.startsWith("wallet")
                ? ``
                : `<script type="text/JavaScript">setTimeout("location.href = '/bookings';",5000);</script>`
            }
        </body>
        </html>
    `);
});

exports.cancel = functions.https.onRequest(async (request, response) => {
  const language = Object.values(
    (
      await admin
        .database()
        .ref("languages")
        .orderByChild("default")
        .equalTo(true)
        .once("value")
    ).val()
  )[0].keyValuePairs;
  response.send(`
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${language.payment_cancelled}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2012/05/07/02/13/cancel-47588_960_720.png' alt='Icon'> 
                    <h3>${language.payment_fail}</h3> 
                    <h4>${language.try_again}</h4>
                </div> 
            </div>
            <script type="text/JavaScript">setTimeout("location.href = '/bookings';",5000);</script>
        </body>
        </html>
    `);
});

exports.newBooking = functions.database
  .ref("/bookings/{bookingId}")
  .onCreate((snapshot, context) => {
    let booking = snapshot.val();
    booking.key = context.params.bookingId;
    if (!booking.bookLater && booking.status === "NEW") {
      admin
        .database()
        .ref("/users")
        .orderByChild("queue")
        .equalTo(false)
        .once("value", (ddata) => {
          let drivers = ddata.val();
          if (drivers) {
            for (let dkey in drivers) {
              let driver = drivers[dkey];
              driver.key = dkey;
              if (
                driver.usertype === "driver" &&
                driver.approved === true &&
                driver.driverActiveStatus === true &&
                driver.location
              ) {
                admin
                  .database()
                  .ref("settings")
                  .once("value", async (settingsdata) => {
                    let settings = settingsdata.val();
                    let originalDistance = getDistance(
                      booking.pickup.lat,
                      booking.pickup.lng,
                      driver.location.lat,
                      driver.location.lng
                    );
                    if (settings.convert_to_mile) {
                      originalDistance = originalDistance / 1.609344;
                    }
                    if (
                      originalDistance <= settings.driverRadius &&
                      driver.carType === booking.carType &&
                      settings.autoDispatch
                    ) {
                      admin
                        .database()
                        .ref(
                          "bookings/" +
                            booking.key +
                            "/requestedDrivers/" +
                            driver.key
                        )
                        .set(true);
                      const langSnap = await admin
                        .database()
                        .ref("languages")
                        .orderByChild("default")
                        .equalTo(true)
                        .once("value");
                      const language = Object.values(langSnap.val())[0]
                        .keyValuePairs;
                      RequestPushMsg(driver.pushToken, {
                        title: language.notification_title,
                        msg: language.new_booking_notification,
                        screen: "DriverTrips",
                      });
                    }
                  });
              }
            }
          }
        });
    }
  });

exports.updateBooking = functions.database
  .ref("/bookings/{bookingId}")
  .onUpdate((change, context) => {
    let oldrow = change.before.val();
    let booking = change.after.val();
    booking.key = context.params.bookingId;
    if (
      !booking.bookLater &&
      oldrow.status === "PAYMENT_PENDING" &&
      booking.status === "NEW"
    ) {
      admin
        .database()
        .ref("/users")
        .orderByChild("queue")
        .equalTo(false)
        .once("value", (ddata) => {
          let drivers = ddata.val();
          if (drivers) {
            for (let dkey in drivers) {
              let driver = drivers[dkey];
              driver.key = dkey;
              if (
                driver.usertype === "driver" &&
                driver.approved === true &&
                driver.driverActiveStatus === true &&
                driver.location
              ) {
                admin
                  .database()
                  .ref("settings")
                  .once("value", async (settingsdata) => {
                    let settings = settingsdata.val();
                    let originalDistance = getDistance(
                      booking.pickup.lat,
                      booking.pickup.lng,
                      driver.location.lat,
                      driver.location.lng
                    );
                    if (settings.convert_to_mile) {
                      originalDistance = originalDistance / 1.609344;
                    }
                    if (
                      originalDistance <= settings.driverRadius &&
                      driver.carType === booking.carType &&
                      settings.autoDispatch
                    ) {
                      await admin
                        .database()
                        .ref(
                          "bookings/" +
                            booking.key +
                            "/requestedDrivers/" +
                            driver.key
                        )
                        .set(true);
                      const langSnap = await admin
                        .database()
                        .ref("languages")
                        .orderByChild("default")
                        .equalTo(true)
                        .once("value");
                      const language = Object.values(langSnap.val())[0]
                        .keyValuePairs;
                      RequestPushMsg(driver.pushToken, {
                        title: language.notification_title,
                        msg: language.new_booking_notification,
                        screen: "DriverTrips",
                      });
                    }
                  });
              }
            }
          }
        });
    }
    if (oldrow.status !== booking.status && booking.status === "CANCELLED") {
      if (booking.customer_paid && parseFloat(booking.customer_paid) > 0) {
        addToWallet(
          booking.customer,
          parseFloat(booking.customer_paid),
          "Admin Credit",
          null
        );
      }
      if (oldrow.status === "ACCEPTED" && booking.cancelledBy === "rider") {
        admin
          .database()
          .ref("tracking/" + booking.key)
          .orderByChild("status")
          .equalTo("ACCEPTED")
          .once("value", (sdata) => {
            let items = sdata.val();
            if (items) {
              for (let skey in items) {
                const accTime = items[skey].at;
                let date1 = new Date();
                let date2 = new Date(accTime);
                let diffTime = date1 - date2;
                let diffMins = diffTime / (1000 * 60);
                admin
                  .database()
                  .ref("cartypes")
                  .once("value", async (cardata) => {
                    const cars = cardata.val();
                    let cancelSlab = null;
                    for (let ckey in cars) {
                      if (booking.carType === cars[ckey].name) {
                        cancelSlab = cars[ckey].cancelSlab;
                      }
                    }
                    let deductValue = 0;
                    if (cancelSlab) {
                      for (let i = 0; i < cancelSlab.length; i++) {
                        if (diffMins > parseFloat(cancelSlab[i].minsDelayed)) {
                          deductValue = cancelSlab[i].amount;
                        }
                      }
                    }
                    if (deductValue > 0) {
                      await admin
                        .database()
                        .ref("bookings/" + booking.key + "/cancellationFee")
                        .set(deductValue);
                      deductFromWallet(
                        booking.customer,
                        deductValue,
                        "Cancellation Fee"
                      );
                    }
                  });
              }
            }
          });
      }
    }
  });

exports.bookingScheduler = functions.pubsub
  .schedule("every 5 minutes")
  .onRun((context) => {
    admin
      .database()
      .ref("/bookings")
      .orderByChild("status")
      .equalTo("NEW")
      .once("value", (snapshot) => {
        let bookings = snapshot.val();
        if (bookings) {
          for (let key in bookings) {
            let booking = bookings[key];
            booking.key = key;
            let date1 = new Date();
            let date2 = new Date(booking.tripdate);
            let diffTime = date2 - date1;
            let diffMins = diffTime / (1000 * 60);
            if (
              diffMins > 0 &&
              diffMins < 15 &&
              booking.bookLater &&
              !booking.requestedDrivers
            ) {
              admin
                .database()
                .ref("/users")
                .orderByChild("queue")
                .equalTo(false)
                .once("value", (ddata) => {
                  let drivers = ddata.val();
                  if (drivers) {
                    for (let dkey in drivers) {
                      let driver = drivers[dkey];
                      driver.key = dkey;
                      if (
                        driver.usertype === "driver" &&
                        driver.approved === true &&
                        driver.driverActiveStatus === true &&
                        driver.location
                      ) {
                        admin
                          .database()
                          .ref("settings")
                          .once("value", async (settingsdata) => {
                            let settings = settingsdata.val();
                            let originalDistance = getDistance(
                              booking.pickup.lat,
                              booking.pickup.lng,
                              driver.location.lat,
                              driver.location.lng
                            );
                            if (settings.convert_to_mile) {
                              originalDistance = originalDistance / 1.609344;
                            }
                            if (
                              originalDistance <= settings.driverRadius &&
                              driver.carType === booking.carType &&
                              settings.autoDispatch
                            ) {
                              admin
                                .database()
                                .ref(
                                  "bookings/" +
                                    booking.key +
                                    "/requestedDrivers/" +
                                    driver.key
                                )
                                .set(true);
                              const langSnap = await admin
                                .database()
                                .ref("languages")
                                .orderByChild("default")
                                .equalTo(true)
                                .once("value");
                              const language = Object.values(langSnap.val())[0]
                                .keyValuePairs;
                              RequestPushMsg(driver.pushToken, {
                                title: language.notification_title,
                                msg: language.new_booking_notification,
                                screen: "DriverTrips",
                              });
                              return true;
                            }
                            return true;
                          });
                      }
                    }
                  } else {
                    return false;
                  }
                  return true;
                });
            }
            if (diffMins < -30) {
              admin
                .database()
                .ref("bookings/" + booking.key + "/requestedDrivers")
                .remove();
              admin
                .database()
                .ref("bookings/" + booking.key)
                .update({
                  status: "CANCELLED",
                  reason: "RIDE AUTO CANCELLED. NO RESPONSE",
                  cancelledBy: "admin",
                });
              try {
                returnTokens(booking.address)
                  .then((res) => console.log(res))
                  .catch((err) => console.log(err));
              } catch (err) {
                console.log(err);
              }
              /* devolver el dinero al pasajero */
            }
            return true;
          }
        } else {
          return false;
        }
        return true;
      });
  });

exports.send_notification = functions.https.onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  if (request.body.token === "token_error" || request.body.token === "web") {
    response.send({ error: "Token found as " + request.body.token });
  } else {
    let data = {
      title: request.body.title,
      msg: request.body.msg,
    };
    if (request.body.screen) {
      data["screen"] = request.body.screen;
    }
    if (request.body.params) {
      data["params"] = request.body.params;
    }

    RequestPushMsg(request.body.token, data)
      .then((responseData) => {
        response.send(responseData);
        return true;
      })
      .catch((error) => {
        response.send({ error: error });
      });
  }
});

exports.userDelete = functions.database
  .ref("/users/{uid}")
  .onDelete((snapshot, context) => {
    let uid = context.params.uid;
    return admin.auth().deleteUser(uid);
  });

exports.userCreate = functions.database
  .ref("/users/{uid}")
  .onCreate((snapshot, context) => {
    let uid = context.params.uid;
    let userInfo = snapshot.val();
    return userInfo.createdByAdmin
      ? admin.auth().createUser({
          uid: uid,
          phoneNumber: userInfo.mobile,
        })
      : true;
  });

exports.validate_referrer = functions.https.onRequest(
  async (request, response) => {
    let referralId = request.body.referralId;
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const snapshot = await admin.database().ref("users").once("value");
    let value = snapshot.val();
    if (value) {
      let arr = Object.keys(value);
      let key;
      for (let i = 0; i < arr.length; i++) {
        if (value[arr[i]].referralId === referralId) {
          key = arr[i];
        }
      }
      response.send({ uid: key });
    } else {
      response.send({ uid: null });
    }
  }
);

exports.check_user_exists = functions.https.onRequest((request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  let uid = null;

  if (request.body.wallet) {
    uid = request.body.wallet;
    try {
      admin
        .auth()
        .getUser(uid)
        .then((getUserResult) => {
          response.send({ user: getUserResult });
          return true;
        })
        .catch((error) => {
          response.send({ error: error, uid: uid });
        });
    } catch (error) {
      response.send({ error: error });
    }
  } else {
    response.send({ error: "Wallet Address not found." });
  }
});

exports.user_signin = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  let walletAddress = request.body.walletAddress;
  try {
    await admin
      .auth()
      .createCustomToken(walletAddress)
      .then((customToken) => {
        return response.send({ token: customToken });
      })
      .catch((err) => {
        console.log(err);
        response.send({ error: err });
      });
  } catch (err) {
    console.log(err);
    response.send({ error: `User Not Found` });
  }
});

// exports.user_signout = functions.https.onRequest(async (request, response) => {
//   response.set("Access-Control-Allow-Origin", "*");
//   response.set("Access-Control-Allow-Headers", "Content-Type");
//   let walletAddress = request.body.walletAddress;
//   try {
//     await admin
//       .auth()
//       .revokeRefreshTokens(walletAddress)
//       .then(() => {
//         return response.send({ message: "User Signed Out Successfully" });
//       })
//       .catch((err) => {
//         console.log(err);
//         response.send({ error: err });
//       });
//   } catch (err) {
//     console.log(err);
//     response.send({ error: `User Not Found` });
//   }
// });

exports.user_delete = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  let uid = request.body.uid;
  await admin
    .auth()
    .deleteUser(uid)
    .then(() => {
      return response.send({ message: "User Deleted Successfully" });
    })
    .catch((error) => {
      response.send("Error deleting user:", error);
    });
});

exports.user_signup = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Headers", "Content-Type");
  let userDetails = request.body.regData;
  try {
    let regData = {
      createdAt: userDetails.createdAt,
      usertype: userDetails.usertype,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      wallet: userDetails.wallet,
      pkey: userDetails.pkey,
      profileImage: userDetails.profileImage,
      referralId: "code" + Math.floor(1000 + Math.random() * 9000).toString(),
      approved: true,
      walletBalance: 0,
      pushToken: "init",
      signupViaReferral: userDetails.signupViaReferral
        ? userDetails.signupViaReferral
        : " ",
    };
    let settingdata = await admin.database().ref("settings").once("value");
    let settings = settingdata.val();
    if (userDetails.usertype === "rider") {
      regData.bankCode = userDetails.bankCode;
      regData.bankName = userDetails.bankName;
      regData.bankAccount = userDetails.bankAccount;
    }
    if (userDetails.usertype === "driver") {
      regData.licenseImage = userDetails.licenseImage;
      regData.vehicleNumber = userDetails.vehicleNumber;
      regData.vehicleModel = userDetails.vehicleModel;
      regData.vehicleMake = userDetails.vehicleMake;
      regData.carType = userDetails.carType;
      regData.bankCode = userDetails.bankCode;
      regData.bankName = userDetails.bankName;
      regData.bankAccount = userDetails.bankAccount;
      regData.other_info = userDetails.other_info;
      regData.queue = false;
      regData.driverActiveStatus = true;
      if (settings.driver_approval) {
        regData.approved = false;
      }
    }
    const uid = userDetails.wallet;
    let userRecord = await admin.auth().createUser({
      uid: uid,
    });
    if (userRecord && userRecord.uid) {
      await admin
        .database()
        .ref("users/" + userRecord.uid)
        .set(regData);
      if (userDetails.signupViaReferral && settings.bonus > 0) {
        await addToWallet(
          userDetails.signupViaReferral,
          settings.bonus,
          "Admin Credit",
          null
        );
        await addToWallet(userRecord.uid, settings.bonus, "Admin Credit", null);
      }
      await admin
        .auth()
        .createCustomToken(userRecord.uid)
        .then((customToken) => {
          return response.send({ uid: userRecord.uid, token: customToken });
        })
        .catch((err) => {
          console.log(err);
          response.send({ error: err });
        });
      // response.send({ uid: userRecord.uid });
    } else {
      response.send({ error: "User Not Created" });
    }
  } catch (error) {
    response.send({ error: `User Not Created, error: ${error}` });
  }
});
