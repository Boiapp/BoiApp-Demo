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

const INITIAL_STATE = {
  address: null,
  value: null,
  error: {
    flag: false,
    msg: null,
  },
  success: false,
};

export const web3reducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case CONFIRM_DELIVERY_BY_DRIVER:
      return {
        ...state,
        address: action.payload.address,
      };
    case CONFIRM_DELIVERY_BY_DRIVER_SUCCESS:
      return {
        ...state,
        value: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case CONFIRM_DELIVERY_BY_DRIVER_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case CONFIRM_DELIVERY_BY_APP:
      return {
        ...state,
        address: action.payload.address,
      };
    case CONFIRM_DELIVERY_BY_APP_SUCCESS:
      return {
        ...state,
        value: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case CONFIRM_DELIVERY_BY_APP_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case CONFIRM_DELIVERY_BY_PASSENGER:
      return {
        ...state,
        address: action.payload.address,
      };
    case CONFIRM_DELIVERY_BY_PASSENGER_SUCCESS:
      return {
        ...state,
        success: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case CONFIRM_DELIVERY_BY_PASSENGER_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case CREATE_NEW_POT:
      return {
        ...state,
        address: action.payload.address,
        value: action.payload.value,
      };
    case CREATE_NEW_POT_SUCCESS:
      return {
        ...state,
        value: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case CREATE_NEW_POT_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case PAYMENT_POT:
      return {
        ...state,
        address: action.payload.address,
        value: action.payload.value,
      };
    case PAYMENT_POT_SUCCESS:
      return {
        ...state,
        value: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case PAYMENT_POT_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case START_RIDE_BY_DRIVER:
      return {
        ...state,
        address: action.payload.address,
      };

    case START_RIDE_BY_DRIVER_SUCCESS:
      return {
        ...state,
        value: action.payload,
        error: {
          flag: false,
          msg: null,
        },
      };
    case START_RIDE_BY_DRIVER_FAILED:
      return {
        ...state,
        value: null,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    default:
      return state;
  }
};
