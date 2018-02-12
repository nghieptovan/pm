import * as types from '../constants/FileClientsActionTypes';
import _ from 'lodash';
const initState = {
  exportType: '',
  exportStatus: 0,
  exportResult: '',
  exportError: '',
  importStatus: 0,
  importError: '',
  loadingIcon: 1
}

export default function fileclients(state = initState, action) {
  switch (action.type) {
    case types.EXPORT_REWARD_CLIENT:
      return {
        ...state,
        exportType: 'xlsx',
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 1
      }
    case types.EXPORT_REWARD_CLIENT_SUCCESS:
      return {
        ...state,
        exportStatus: 2,
        exportResult: action.result,
        exportError: '',
        loadingIcon: 2
      }
    case types.EXPORT_REWARD_CLIENT_FAIL:
      return {
        ...state,
        exportStatus: 2,
        exportResult: '',
        exportError: action.error,
        loadingIcon: 3
      }
    case types.IMPORT_REWARD_CLIENT:
      return {
        ...state,
        importStatus: 1,
        loadingIcon: 1
      }
    case types.IMPORT_REWARD_CLIENT_SUCCESS:
      return {
        ...state,
        importStatus: 2,
        importError: '',
        importResult: action.result,
        loadingIcon: 2
      }
    case types.IMPORT_REWARD_CLIENT_FAIL:
      return {
        ...state,
        importStatus: 3,
        importError: action.error,
        loadingIcon: 3
      }      
    default:
      return state;
  }
}
