import * as types from '../constants/ContentActionTypes';
import _ from 'lodash';
const initState = {
  error: '',
  resultUpload: null,
  uploaded: false,
  listUpload: null,
  getList : false,
  errorLoadList: '',
  loadList: false,
  listMyUpload: [],
  errorUploadReview: '',
  updatedReview: false,
  updatedReviewContent: {},
  updatedRewardStatus: 0,
  errorRewardNow: '',
  ratingMultiStatus: false,
  ratingMultiResult: null,
  ratingMultiError: '',
  errorCreatorUpload: '',
  statusCreatorUpload: 0,
  loadingIcon: 1
}

export default function client(state = initState, action) {
  switch (action.type) {
    case types.CREATOR_UPLOAD:
      return {
        ...state,
        statusCreatorUpload: 1,
        errorCreatorUpload: '',
        loadingIcon: 1
      }
    case types.CREATOR_UPLOAD_SUCCESS:
      return {
        ...state,
        statusCreatorUpload: 2,
        resultUpload: action.result,
        loadingIcon: 2
      }
    case types.CREATOR_UPLOAD_FAIL:
      return {
        ...state,
        statusCreatorUpload: 2,
        resultUpload: null,
        errorCreatorUpload: action.error,
        loadingIcon: 3
      }
      case types.CREATOR_GET_LIST_UPLOAD:
      return {
        ...state,
        getList: false,  
        listUpload: null,      
        error: '',
        loadingContentIcon: 1
      }
    case types.CREATOR_GET_LIST_UPLOAD_SUCCESS:
      return {
        ...state,
        getList: true,        
        listUpload: action.result,
        loadingContentIcon: 2
      }
    case types.CREATOR_GET_LIST_UPLOAD_FAIL:
      return {
        ...state,
        getList: false,
        listUpload: null,       
        error: action.error,
        loadingContentIcon: 3
      }
    case types.CREATOR_GET_UPLOAD:
      return {
        ...state,
        errorLoadList: '',
        loadList: false,
        listMyUpload: [],
        loadingIcon: 1
      }
    case types.CREATOR_GET_UPLOAD_SUCCESS:
      return {
        ...state,
        errorLoadList: '',
        loadList: true,
        listMyUpload: action.result,
        loadingIcon: 2
      }
    case types.CREATOR_GET_UPLOAD_FAIL:
      return {
        ...state,
        errorLoadList: action.error,
        loadList: false,
        listMyUpload: null,
        loadingIcon: 3
      } 
    case types.CONTENT_REVIEW_UPDATE:
      return {
        ...state,
        errorUploadReview: '',
        updatedReview: false,
        updatedReviewContent: {},
        loadingIcon: 1
    }
    case types.CONTENT_REVIEW_UPDATE_SUCCESS:
      return {
        ...state,
        errorUploadReview: '',
        updatedReview: true,
        listUpload: action.result,
        updatedReviewContent: action.result,
        loadingIcon: 2
    }
    case types.CONTENT_REVIEW_UPDATE_FAIL:
      return {
        ...state,
        errorUploadReview: action.error,
        updatedReview: true,
        updatedReviewContent: {},
        loadingIcon: 3
    }
    case types.CONTENT_REWARD_LIST:
      return {
        ...state,
        errorLoadRewarded: '',
        loadRewarded: false,
        rewardList: null,
        loadingIcon: 1
    }
    case types.CONTENT_REWARD_LIST_SUCCESS:
      return {
        ...state,
        erroroadRewarded: '',
        loadRewarded: true,
        rewardList: action.result,
        loadingIcon: 2
    }
    case types.CONTENT_REWARD_LIST_FAIL:
      return {
        ...state,
        errorLoadRewarded: action.error,
        loadRewarded: false,
        rewardList: null,
        loadingIcon: 3
    } 
    case types.CONTENT_REWARD_UPDATE:
      return {
      ...state,
      updatedRewardStatus: 0,
      errorRewardNow: '',
      loadingIcon: 1
    }
    case types.CONTENT_REWARD_UPDATE_SUCCESS:
      return {
        ...state,
        updatedRewardStatus: 1,
        listUpload: action.result,
        errorRewardNow: '',
        loadingIcon: 2
    }
    case types.CONTENT_REWARD_UPDATE_FAIL:
      return {
        ...state,
        updatedRewardStatus: 2,
        errorRewardNow: action.error,
        loadingIcon: 3
    }   
    case types.CONTENT_SEARCH:
      return {
    ...state,
    search: false,
    listSearch: null,
    loadingIcon: 1
    }
    case types.CONTENT_SEARCH_SUCCESS:
      return {
      ...state,
      search: true,
      listSearch: action.result,
      loadingIcon: 2
    }
    case types.CONTENT_SEARCH_FAIL:
      return {
      ...state,
      search: true,
      error: action.error,
      listSearch: null,
      loadingIcon: 3
    }     
    case types.RATING_MULTIPLE_CONTENT:
      return {
        ...state,
        ratingMultiStatus: false,
        loadingIcon: 1
    }
    case types.RATING_MULTIPLE_CONTENT_SUCCESS:
      return {
        ...state,
        ratingMultiStatus: true,
        ratingMultiResult: action.result,
        listUpload: action.result,
        ratingMultiError: '',
        loadingIcon: 2
    }
    case types.RATING_MULTIPLE_CONTENT_FAIL:
      return {
        ...state,
        ratingMultiStatus: true,
        ratingMultiResult: null,
        ratingMultiError: action.error,
        loadingIcon: 3
    } 

    default:
      return state;
  }
}
