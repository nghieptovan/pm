import { 
  LOGIN, 
  LOGIN_SOCIAL, 
  LOGIN_SUCCESS, 
  LOGIN_FAIL,
  LOGOUT,   
  LOGOUT_SUCCESS, 
  LOGOUT_FAIL,
  LOAD,
  LOAD_SUCCESS,
  LOAD_FAIL,
  REGISTER,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  GET_TWITTER,
  GET_TWITTER_FAIL,
  GET_TWITTER_SUCCESS,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_FAIL,
  FORGOT_PASSWORD_SUCCESS,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAIL,
  CHANGE_PASSWORD_SUCCESS 
} from '../constants/AuthActionTypes';

const initialState = {
  loaded: false,
  error: '',
  created: false,
  createdUser: null,
  loadingIcon: 1
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        loggingIn: true,
        error: '',
        loadingIcon: 1
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        loaded: false,
        logged: true,
        loggingIn: false,
        user: action.result,
        error: '',
        loadingIcon: 2
      }
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        user: null,
        logged: false,
        error: action.error,
        loadingIcon: 3
      }
    case LOGOUT:
      return {
        ...state,
        logout: false,
        logoutMsg: null,
        error: '',
        loadingIcon: 1
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        logout: true,
        logoutMsg: action.result,
        error: '',
        loadingIcon: 2
      }
    case LOGOUT_FAIL:
      return {
        ...state,
        logout: true,
        logoutMsg: null,
        error: action.error,
        loadingIcon: 3
      }
    case LOAD:
      return {
        ...state,
        loading: true,
        error: '',
        loadingIcon: 1
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        user: action.result,
        loadingIcon: 2
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error,
        loadingIcon: 3
      };
      case REGISTER:
      return {
        ...state,
        created: false,
        createdUser: null,
        errorReg: '',
        loadingIcon: 1
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        created: true,
        createdUser: action.result,
        errorReg: '',
        loadingIcon: 2
      };
    case REGISTER_FAIL:
      return {
        ...state,
        created: false,
        createdUser: null,
        errorReg: action.error,
        loadingIcon: 3
      }; 
      case GET_TWITTER:
      return {
        ...state,
        login: false,
        loginInfo: null,
        error: '',
        loadingIcon: 1
      };
    case GET_TWITTER_SUCCESS:
      return {
        ...state,
        login: true,
        loginInfo: action.result,
        error: '',
        loadingIcon: 2
      };
    case GET_TWITTER_FAIL:
      return {
        ...state,
        login:true,
        loginInfo: null,
        error: action.error,
        loadingIcon: 3
      }; 
      case CHANGE_PASSWORD:
      return {
        ...state,
        changePwd: false,
        changedInfo: null,
        errorChange: '',
        loadingIcon: 1
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changePwd: true,
        changedInfo: action.result,
        errorChange: '',
        loadingIcon: 2
      };
    case CHANGE_PASSWORD_FAIL:
      return {
        ...state,
        changePwd:true,
        changedInfo: null,
        errorChange: action.error,
        loadingIcon: 3
      }; 
      case FORGOT_PASSWORD:
      return {
        ...state,
        forgotPwd: false,
        forgotInfo: null,
        errorForgot: '',
        loadingIcon: 1
      };
    case FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgotPwd: true,
        forgotInfo: action.result,
        errorForgot: '',
        loadingIcon: 2
      };
    case FORGOT_PASSWORD_FAIL:
      return {
        ...state,
        forgotPwd:true,
        forgotInfo: null,
        errorForgot: action.error,
        loadingIcon: 3
      }; 
    default:
      return state
  }
}
