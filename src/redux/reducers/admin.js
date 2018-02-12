import * as types from '../constants/AdminActionTypes';
import _ from 'lodash';
const initState = {
  created: false,
  createTransactionStatus: 0,
  error: '',
  loadingIcon: 1,
  listAdmin: []
}

export default function admin(state = initState, action) {
  switch (action.type) {
    case types.GET_LIST_ADMIN:
      return {
        ...state,
        loaded: true,
        error: '',
        loadingIcon: 1
      }
    case types.GET_LIST_ADMIN_SUCESS:

      return {
        ...state,
        loaded: false,
        success: true,
        listAdmin: action.result,
        loadingIcon: 2
      }
    case types.GET_LIST_ADMIN_FAIL:
      return {
        ...state,
        loaded: false,
        success: false,
        listAdmin: null,
        loadingIcon: 3
      }
    case types.CREATE_ADMIN:
      return {
        ...state,
        createLoad: true,
        created: false,
        error: '',
        loadingIcon: 1
      }
    case types.CREATE_ADMIN_SUCESS:
      let newList = [action.result, ...state.listAdmin];
      return {
        ...state,
        createLoad: false,
        created: true,
        listAdmin: newList,
        adminCreated: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.CREATE_ADMIN_FAIL:
      return {
        ...state,
        createLoad: false,
        created: false,
        adminCreated: null,
        error: action.error,
        loadingIcon: 3
      }
    case types.EDIT_ADMIN:
      return {
        ...state,
        editLoad: true,
        edited: false,
        editedAdmin: null,
        errorEdit: '',
        loadingIcon: 1
      }
    case types.EDIT_ADMIN_SUCCESS:
      let index = _.findIndex(state.listAdmin, { id: action.result.id });
      state.listAdmin.splice(index, 1, action.result);
      return {
        ...state,
        editLoad: false,
        edited: true,
        editedAdmin: action.result,
        errorEdit: '',
        loadingIcon: 2
      }
    case types.EDIT_ADMIN_FAIL:
      return {
        ...state,
        editLoad: false,
        edited: false,
        editedAdmin: null,
        errorEdit: action.error,
        loadingIcon: 3
      }
    case types.DELETE_ADMIN:
      return {
        ...state,
        editLoad: true,
        deleted: false,
        deletedAdmin: null,
        errorDelete: '',
        loadingIcon: 1
      }
    case types.DELETE_ADMIN_SUCCESS:
      let deletedIndex = _.findIndex(state.listReviewers, { id: action.result.id });
      let deletedList = [...state.listReviewers.slice(0, deletedIndex), ...state.listReviewers.slice(deletedIndex + 1)];
      return {
        ...state,
        editLoad: false,
        deleted: true,
        listAdmin: deletedList,
        deletedAdmin: action.result,
        errorDelete: '',
        loadingIcon: 2
      }
    case types.DELETE_ADMIN_FAIL:
      return {
        ...state,
        editLoad: false,
        deleted: false,
        deletedAdmin: null,
        errorDelete: action.error,
        loadingIcon: 3
      }
      case types.GET_CHALLENGES_REPORT:
      return {
        ...state,
       getReport: false,
       reportList: null,
       error: '',
       loadingIcon: 1
      }
    case types.GET_CHALLENGES_REPORT_SUCCESS:
      return {
        ...state,
        getReport: true,
        reportList: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.GET_CHALLENGES_REPORT_FAIL:
      return {
        ...state,
        getReport: true,
        reportList: null,
        error: action.error,
        loadingIcon: 3
      }
      case types.GET_LIST_CLIENT:
      return {
        ...state,
       getClient: false,
       clientList: null,
       error: '',
       loadingIcon: 1
      }
    case types.GET_LIST_CLIENT_SUCCESS:
      return {
        ...state,
        getClient: true,
        clientList: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.GET_LIST_CLIENT_FAIL:
      return {
        ...state,
        getClient: true,
        clientList: null,
        error: action.error,
        loadingIcon: 3
      }
      case types.GET_LIST_TRANSACTION:
      return {
        ...state,
       getTransaction: false,
       transactionList: null,
       error: '',
       loadingIcon: 1
      }
    case types.GET_LIST_TRANSACTION_SUCCESS:
      return {
        ...state,
        getTransaction: true,
        transactionList: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.GET_LIST_TRANSACTION_FAIL:
      return {
        ...state,
        getTransaction: true,
        transactionList: null,
        error: action.error,
        loadingIcon: 3
      }
      
    case types.CREATE_TRANSACTION:
      return {
        ...state,
       createTransactionStatus: 1,
       transactionList: null,
       error: '',
       loadingIcon: 1
      }
    case types.CREATE_TRANSACTION_SUCCESS:
      return {
        ...state,
        createTransactionStatus: 2,
        transactionList: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.CREATE_TRANSACTION_FAIL:
      return {
        ...state,
        createTransactionStatus: 2,
        transactionList: null,
        error: action.error,
        loadingIcon: 3
    }
    case types.EXPORT_CHALLENGE:
    return {
      ...state,
     export: false,
     exportResult: null,
     exportError: null,
     loadingIcon: 1
    }
  case types.EXPORT_CHALLENGE_SUCCESS:
    return {
      ...state,
      export: true,
      exportResult: action.result,
      exportError: null,
      loadingIcon: 2
    }
  case types.EXPORT_CHALLENGE_FAIL:
    return {
      ...state,
      export: true,
      exportResult: null,
      exportError: action.error,
      loadingIcon: 3
  }
  case types.EXPORT_TRANSACTION:
  return {
    ...state,
   export: false,
   exportResult: null,
   exportError: null,
   loadingIcon: 1
  }
case types.EXPORT_TRANSACTION_SUCCESS:
  return {
    ...state,
    export: true,
    exportResult: action.result,
    exportError: null,
    loadingIcon: 2
  }
case types.EXPORT_TRANSACTION_FAIL:
  return {
    ...state,
    export: true,
    exportResult: null,
    exportError: action.error,
    loadingIcon: 3
}
    default:
      return state;
  }
}
