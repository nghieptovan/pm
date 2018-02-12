import * as types from '../constants/WidgetActionTypes';
import _ from 'lodash';
const initState = {
  upload: false,
  uploadData: null,
  error: '',
  uploadStatus: 0,
  checkEmailStatus: 0,
  checkEmail: {},
  checkEmailError: ''
}
export default function widget(state = initState, action) {
    switch (action.type) {
      case types.UPLOAD_WIDGET:
        return {
          ...state,
          uploadData: null,
          uploadStatus: 1,
          loadingIcon: 1
        };
      case types.UPLOAD_WIDGET_SUCCESS: 
        return {
          ...state,
          error: '',
          upload: true,
          uploadData: action.result,
          uploadStatus: 2,
          loadingIcon: 2
        };
      case types.UPLOAD_WIDGET_FAIL:
        return {
          ...state,
          error: action.error,
          upload: false,
          uploadData: null,
          uploadStatus: 3,
          loadingIcon: 3
        };
      case types.CHECK_EMAIL:
        return {
          ...state,
          checkEmailStatus: 1,
          checkEmail: {},
          checkEmailError: '',
          loadingIcon: 1
        };
      case types.CHECK_EMAIL_SUCCESS: 
        return {
          ...state,
          checkEmailStatus: 2,
          checkEmail: action.result,
          checkEmailError: '',
          loadingIcon: 2
        };
      case types.CHECK_EMAIL_FAIL:
        return {
          ...state,
          checkEmailStatus: 3,
          checkEmail: {},
          checkEmailError: action.error,
          loadingIcon: 3
        };
      default:
       return state;
      }
  }
