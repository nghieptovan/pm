import * as types from '../constants/ClientActionTypes';
import _ from 'lodash';
const initState = {
  status: '',
  listClient: [],
  error: '',
  createdClient:'',
  created:'',
  listSearch: [],
  exportExcelCLient: 0,
  exportExcelResult: '',
  loadListCreators: false,
  listCreators: null,
  errorListCreator: '',
  sendMailStatus: false,
  errorSendMailCreator: '',
  loadingPostFB: 0,
  loadingPostTW: 0,
  listRewardeesStatus: 0,
  listRewardees: [],
  listRewardeesError: '',
  configureMailStatus: 0,
  configureMail: {},
  configureMailError: '',
  updateConfigureStatus: 0,
  updateConfigure: {},
  updateConfigureError: '',
  loadingCreateClient: 0,
  loadingEditClient: 0,
  loadingGetLiveChallenge: 0,
  loadingIcon: 1
}

export default function client(state = initState, action) {
  switch (action.type) {
    case types.GET_LIST:
      return {
        ...state,
        loaded: true,
        success: false,
        listClient: null,
        listSearch: null,
        successSearch: null,
        loadingGetLiveChallenge: 1,
        loadingIcon: 1
      }
    case types.GET_LIST_SUCESS:
      // let returnData = [...action.result].reverse();
      return {
        ...state,
        loaded: false,
        success: true,
        listClient: action.result,
        listSearch: null,
        successSearch: null,
        loadingGetLiveChallenge: 2,
        loadingIcon: 2
      }
    case types.GET_LIST_FAIL:
      return (
        {
          ...state,
          loaded: false,
          success: false,
          status: false,
          listClient: null,
          loadingGetLiveChallenge: 3,
          loadingIcon: 3
        });
    case types.CREATE_CLIENT:
      return {
        ...state,
        createLoad: true,
        created: false,
        createdClient: null,
        error: '',
        listSearch: null,
        successSearch: null,
        loadingCreateClient: 1,
        loadingIcon: 1
    }
    case types.CREATE_CLIENT_SUCESS:
      let newList = [action.result, ...state.listClient];
      return {
          ...state,
          createLoad: false,
          created: true,
          listClient: newList,
          createdClient: action.result,
          error: '',
          loadingCreateClient: 2,
          loadingIcon: 2
      }
    case types.CREATE_CLIENT_FAIL:
      return {
        ...state,
        createLoad: false,
        created: false,
        createdClient: null,
        error: action.error,
        loadingCreateClient: 3,
        loadingIcon: 3
    }
    case types.EDIT_CLIENT:
      return {
        ...state,
        editLoad: true,
        edited: false,
        errorEdit: '',
        loadingEditClient: 1,
        loadingIcon: 1
    }
    case types.EDIT_CLIENT_SUCESS:
      let index = _.findIndex(state.listClient, {id: action.result.id});
      state.listClient.splice(index, 1, action.result);
      let indexSearch = _.findIndex(state.listSearch, {id: action.result.id}); 
      if(indexSearch >= 0){
        state.listSearch.splice(indexSearch, 1, action.result);
      }      
      return {
        ...state,
        editLoad: false,
        edited: true,
        editedClient: action.result,
        errorEdit: '',
        loadingEditClient: 2,
        loadingIcon: 2
      }
    case types.EDIT_CLIENT_FAIL:
      return {
        ...state,
        editLoad: false,
        edited: false,
        errorEdit: action.error,
        loadingEditClient: 3,
        loadingIcon: 3
      }
    case types.SEARCH_CLIENT:
      return {
        ...state,
        search: true,
        successSearch: false,
        listSearch: null,
        loadingIcon: 1
      }
    case types.SEARCH_CLIENT_SUCESS:
      return {
        ...state,
        search: false,
        successSearch: true,
        listSearch: action.result,
        loadingIcon: 2
      }
    case types.SEARCH_CLIENT_FAIL:
      return (
        {
          ...state,
          search: false,
          successSearch: false,
          statusSearch: false,
          listSearch: null,
          loadingIcon: 3
        });
    case types.EXPORT_CLIENT:
      return {
        ...state,
        exportType: 'pdf',
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 1
      }
    case types.EXPORT_CLIENT_SUCESS:
      return {
        ...state,
        exportStatus: 2,
        exportResult: action.result,
        loadingIcon: 2
      }
    case types.EXPORT_CLIENT_FAIL:
      return {
        ...state,
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 3
    }

    case types.EXPORT_EXCEL_CLIENT:
      return {
        ...state,
        exportType: 'xlsx',
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 1
      }
    case types.EXPORT_EXCEL_CLIENT_SUCESS:      
      return {
        ...state,
        exportStatus: 2,
        exportResult: action.result,
        loadingIcon: 2 
      }
    case types.EXPORT_EXCEL_CLIENT_FAIL:
      return {
        ...state,
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 3
    }

    case types.EXPORT_CSV_CLIENT:
      return {
        ...state,
        exportType: 'csv',
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 1
      }
    case types.EXPORT_CSV_CLIENT_SUCESS:
      return {
        ...state,
        exportStatus: 2,
        exportResult: action.result,
        loadingIcon: 2
      }
    case types.EXPORT_CSV_CLIENT_FAIL:
      return {
        ...state,
        exportStatus: 1,
        exportResult: '',
        loadingIcon: 3
    }
    case types.GET_SOCIAL_MEDIA:
      return {
        ...state,
        getSocialMedia: 0,
        socialMediaResult: '',
        error: '',
        loadingIcon: 1
      }
    case types.GET_SOCIAL_MEDIA_SUCCESS:
      return {
        ...state,
        getSocialMedia: 1,
        socialMediaResult: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.GET_SOCIAL_MEDIA_FAIL:
      return {
        ...state,
        getSocialMedia: 2,
        socialMediaResult: '',
        error: action.error,
        loadingIcon: 3
      }      
      case types.SET_FACEBOOK_PAGES:
      return {
        ...state,
        setPage: false,
        listPage: null,
        error: '',
        loadingIcon: 1
      }
    case types.SET_FACEBOOK_PAGES_SUCCESS:
      return {
        ...state,
        setPage: true,
        listPage: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.SET_FACEBOOK_PAGES_FAIL:
      return {
        ...state,
        setPage: false,
        listPage: null,
        error: action.error,
        loadingIcon: 3
      }
    
    case types.GET_LIST_CREATORS:
      return {
        ...state,
        loadListCreators: false,
        listCreators: null,
        errorListCreator: '',
        loadingIcon: 1
    }
    case types.GET_LIST_CREATORS_SUCCESS:
      return {
        ...state,
        loadListCreators: true,
        listCreators: action.result,
        loadingIcon: 2
    }
    case types.GET_LIST_CREATORS_FAIL:
      return {
        ...state,
        loadListCreators: true,
        listCreators: null,
        errorListCreator: action.error,
        loadingIcon: 3
    }
    case types.SEND_MAILTO_CREATOR:
    return {
      ...state,
      sendMailStatus: false,
      errorSendMailCreator: '',
      loadingIcon: 1
    }
    case types.SEND_MAILTO_CREATOR_SUCCESS:
      return {
        ...state,
        sendMailStatus: true,
        errorSendMailCreator: '',
        loadingIcon: 2
    }
    case types.SEND_MAILTO_CREATOR_FAIL:
      return {
        ...state,
        sendMailStatus: true,
        errorSendMailCreator: action.error,
        loadingIcon: 3
    }
    case types.POST_FACEBOOK:
    return {
      ...state,
      postFacebook: false,
      socialError: '',
      facebookContent: null,
      loadingPostFB: 1,
      loadingIcon: 1
    }
    case types.POST_FACEBOOK_SUCCESS:
      return {
        ...state,
        postFacebook: true,
        socialError: '',
        facebookContent: action.result,
        loadingPostFB: 2,
        loadingIcon: 2
    }
    case types.POST_FACEBOOK_FAIL:
      return {
        ...state,
        postFacebook: true,
        socialError: action.error,
        facebookContent: null,
        loadingPostFB: 2,
        loadingIcon: 3
    }
    case types.POST_TWITTER:
    return {
      ...state,
      postTwitter: false,
      socialError: '',
      twitterContent: null,
      loadingPostTW: 1,
      loadingIcon: 1
    }
    case types.POST_TWITTER_SUCCESS:
      return {
        ...state,
        postTwitter: true,
        socialError: '',
        twitterContent: action.result,
        loadingPostTW: 2,
        loadingIcon: 2
    }
  case types.POST_TWITTER_FAIL:
    return {
        ...state,
        postTwitter: true,
        socialError: action.error,
        twitterContent: null,
        loadingPostTW: 2,
        loadingIcon: 3
    }
  case types.LOGOUT_TWITTER:
  return {
      ...state,
      logout: false,
      error: '',
      logoutResult: null,
      loadingIcon: 1
    }
    case types.LOGOUT_TWITTER_SUCCESS:
      return {
        ...state,
        logout: true,
        error: '',
        logoutResult: action.result,
        loadingIcon: 2
    }
    case types.LOGOUT_TWITTER_FAIL:
      return {
        ...state,
        logout: true,
        error: action.error,
        logoutResult: null,
        loadingIcon: 3
    }
    case types.REWARD_LIST:
      return {
        ...state,
        getList: false,
        rewardList: null,
        error: '',
        loadingIcon: 1
    }
    case types.REWARD_LIST_SUCCESS:
      return {
        ...state,
        getList: true,
        rewardList: action.result,
        error: '',
        loadingIcon: 2
    }
    case types.REWARD_LIST_FAIL:
      return {
        ...state,
        getList: false,
        error: action.error,
        rewardList: null,
        loadingIcon: 3
    }
    case types.GET_LIST_CREATORS_REWARDEES:
      return {
      ...state,
      listRewardeesStatus: 1,
      listRewardees: [],
      listRewardeesError: '',     
    }
    case types.GET_LIST_CREATORS_REWARDEES_SUCCESS:
      return {
        ...state,
        listRewardeesStatus: 2,
        listRewardees: action.result,
        listRewardeesError: ''
    }
    case types.GET_LIST_CREATORS_REWARDEES_FAIL:
      return {
        ...state,
        listRewardeesStatus: 3,
        listRewardees: [],
        listRewardeesError: action.error
    }
    case types.GET_CONFIGURE_MAIL:
      return {
      ...state,
      configureMailStatus: 1,
      configureMail: {},
      configureMailError: '',
      loadingIcon: 1
    }
    case types.GET_CONFIGURE_MAIL_SUCCESS:
      return {
        ...state,
        configureMailStatus: 2,
        configureMail: action.result,
        configureMailError: '',
        loadingIcon: 2
    }
    case types.GET_CONFIGURE_MAIL_FAIL:
      return {
        ...state,
        configureMailStatus: 3,
        configureMail: {},
        configureMailError: action.error,
        loadingIcon: 3
    }
    case types.UPDATE_CONFIGURE_MAIL:
      return {
        ...state,
        updateConfigureStatus: 1,
        updateConfigure: {},
        updateConfigureError: '',
        loadingIcon: 1
    }
    case types.UPDATE_CONFIGURE_MAIL_SUCCESS:
      return {
        ...state,
        updateConfigureStatus: 2,
        configureMail: action.result,
        updateConfigureError: '',
        loadingIcon: 2
    }
    case types.UPDATE_CONFIGURE_MAIL_FAIL:
      return {
        ...state,
        updateConfigureStatus: 3,
        updateConfigureError: action.error,
        loadingIcon: 3
    }
    case types.EXPORT_CREATOR:
    return {
      ...state,
      exportCStatus: 1,
      exportCResult: null,
      exportCError: null,
      loadingIcon: 1
    }
    case types.EXPORT_CREATOR_SUCCESS:
      return {
        ...state,
        exportCStatus: 2,
        exportCResult: action.result,
        exportCError: null,
        loadingIcon: 2
    }
    case types.EXPORT_CREATOR_FAIL:
      return {
        ...state,
        exportCStatus: 3,
        exportCResult: null,
        exportCError: action.error,
        loadingIcon: 3
    }
    case types.EXPORT_REWARDEE:
    return {
      ...state,
      exportRStatus: 1,
      exportRResult: null,
      exportRError: null
    }
    case types.EXPORT_REWARDEE_SUCCESS:
      return {
        ...state,
        exportRStatus: 2,
        exportRResult: action.result,
        exportRError: null
    }
    case types.EXPORT_REWARDEE_FAIL:
      return {
        ...state,
        exportRStatus: 3,
        exportRResult: null,
        exportRError: action.error
    }
    case types.IMPORT_CREATOR:
    return {
      ...state,
      importStatus: 1,
      importResult: null,
      importError: null,
      loadingIcon: 1
    }
    case types.IMPORT_CREATOR_SUCCESS:
      return {
        ...state,
        importStatus: 2,
        importResult: action.result,
        importError: null,
        loadingIcon: 2
    }
    case types.IMPORT_CREATOR_FAIL:
      return {
        ...state,
        importStatus: 3,
        importResult: null,
        importError: action.error,
        loadingIcon: 3
    }
    case types.CHANGE_TEMPLATE_STATUS:
    return {
      ...state,
      changeStatus: 1,
      changedInfo: null,
      changeError: null,
      loadingIcon: 1
    }
    case types.CHANGE_TEMPLATE_STATUS_SUCCESS:
      return {
        ...state,
        changeStatus: 2,
        changedInfo: action.result,
        changeError: null,
        loadingIcon: 2
    }
    case types.CHANGE_TEMPLATE_STATUS_FAIL:
      return {
        ...state,
        changeStatus: 3,
        changedInfo: null,
        changeError: action.error,
        loadingIcon: 3
    }
    case types.CREATE_TEMPLATE:
    return {
      ...state,
      createStatus: 1,
      createdInfo: null,
      createError: null,
      loadingIcon: 1
    }
    case types.CREATE_TEMPLATE_SUCCESS:
      return {
        ...state,
        createStatus: 2,
        createdInfo: action.result,
        createError: null,
        loadingIcon: 2
    }
    case types.CREATE_TEMPLATE_FAIL:
      return {
        ...state,
        createStatus: 3,
        createdInfo: null,
        createError: action.error,
        loadingIcon: 3
    }
    case types.DELETE_TEMPLATE:
    return {
      ...state,
      deleteStatus: 1,
      deleteInfo: null,
      deleteError: null,
      loadingIcon: 1
    }
    case types.DELETE_TEMPLATE_SUCCESS:
      return {
        ...state,
        deleteStatus: 2,
        deleteInfo: action.result,
        deleteError: null,
        loadingIcon: 2
    }
    case types.DELETE_TEMPLATE_FAIL:
      return {
        ...state,
        deleteStatus: 3,
        deleteInfo: null,
        deleteError: action.error,
        loadingIcon: 3
    }
    default:
      return state;
  }
}
