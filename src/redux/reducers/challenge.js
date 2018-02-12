import * as types from '../constants/ChallengeActionTypes';
import _ from 'lodash';
const initState = {
  error: '',
  createdChallenge: null,
  created: false,
  getChallengeLoad: true,
  challengeById: {},
  listChallenges:[],
  listLiveChallenges:[],
  listSearch:[],
  challenges:[],
  createChallengeStatus: 0,
  editChallengeStatus: 0,
  loadingChallenge: 0,
  loadingLiveChallenge: 0,
  loadingIcon: 1,
  loadingChallengeById: 0
}

export default function challenge(state = initState, action) {
  switch (action.type) {
    case types.CREATE_CHALLENGE:
      return {
        ...state,
        createLoad: true,
        createChallengeStatus: 1,
        created: false,
        createdChallenge: null,
        error: '',
        loadingIcon: 1
      }
    case types.CREATE_CHALLENGE_SUCCESS:      
      let newList = [action.result, ...state.listChallenges];
      return {
        ...state,
        createLoad: false,
        createChallengeStatus: 2,
        created: true,
        listChallenges: newList,
        createdChallenge: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.CREATE_CHALLENGE_FAIL:
      return {
        ...state,
        createLoad: false,
        createChallengeStatus: 2,
        created: false,
        createdChallenge: null,
        error: action.error,
        loadingIcon: 3
      }
      case types.SEARCH_CHALLENGE:
      return {
        ...state,
        search: true,
        successSearch: false,
        listSearch: [],
        loadingIcon: 1
      }
    case types.SEARCH_CHALLENGE_SUCCESS:
      return {
        ...state,
        search: false,
        successSearch: true,
        listSearch: action.result,
        loadingIcon: 2
      }
    case types.SEARCH_CHALLENGE_FAIL:
      return (
        {
          ...state,
          search: false,
          successSearch: false,
          statusSearch: false,
          listSearch: [],
          loadingIcon: 3
        });
        case types.SEARCH_DATE_CHALLENGE:
        return {
          ...state,
          search: true,
          successSearch: false,
          listSearch: [],
          loadingIcon: 1
        }
      case types.SEARCH_DATE_CHALLENGE_SUCCESS:
        return {
          ...state,
          search: false,
          successSearch: true,
          listSearch: action.result,
          loadingIcon: 2
        }
      case types.SEARCH_DATE_CHALLENGE_FAIL:
        return (
          {
            ...state,
            search: false,
            successSearch: false,
            statusSearch: false,
            listSearch: [],
            loadingIcon: 3
          });
    case types.GET_LIST_CHALLENGES:
      return {
        ...state,
        getListLoad: true,
        listChallenges: [],
        loadingChallenge: 1,
        error: '',
        loadingIcon: 1
      }
    case types.GET_LIST_CHALLENGES_SUCCESS:
      return {
        ...state,
        getListLoad: false,
        listChallenges: action.result,
        loadingChallenge: 2,
        error: '',
        loadingIcon: 2
      }
    case types.GET_LIST_CHALLENGES_FAIL:
      return {
        ...state,
        getListLoad: false,
        listChallenges: null,
        loadingChallenge: 3,
        error: action.error,
        loadingIcon: 3
    } 
    case types.GET_LIST_CHALLENGES_FOR_UPLOAD:
    return {
      ...state,
      getListLoad: true,
      challenges: [],
      error: '',
      loadingIcon: 1
    }
  case types.GET_LIST_CHALLENGES_FOR_UPLOAD_SUCCESS:
    return {
      ...state,
      getListLoad: false,
      challenges: action.result,
      error: '',
      loadingIcon: 2
    }
  case types.GET_LIST_CHALLENGES_FOR_UPLOAD_FAIL:
    return {
      ...state,
      getListLoad: false,
      challenges: [],
      error: action.error,
      loadingIcon: 3
  } 
    case types.GET_CHALLENGE_BY_ID:
      return {
        ...state,
        getChallengeLoad: true,
        challengeById: null,
        error: '',
        loadingIcon: 1,        
        loadingChallengeById: 1        
      }
    case types.GET_CHALLENGE_BY_ID_SUCCESS:      
      return {
        ...state,
        getChallengeLoad: false,
        challengeById: action.result,
        error: '',
        loadingIcon: 2,
        loadingChallengeById: 2
      }
    case types.GET_CHALLENGE_BY_ID_FAIL:
      return {
        ...state,
        getChallengeLoad: false,
        challengeById: null,
        error: action.error,
        loadingIcon: 3,
        loadingChallengeById: 3
    }       
    case types.EDIT_CHALLENGE:
      return {
        ...state,
        editLoad: true,
        editChallengeStatus: 1,
        edited: false,
        editedChallenge: null,
        error: '',
        loadingIcon: 1
      }
    case types.EDIT_CHALLENGE_SUCCESS:
      let index = _.findIndex(state.listChallenges, {id: action.result.id});
      state.listChallenges.splice(index, 1, action.result);
      return {
        ...state,
        editLoad: false,
        editChallengeStatus: 2,
        edited: true,
        editedChallenge: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.EDIT_CHALLENGE_FAIL:
      return {
        ...state,
        editLoad: false,
        editChallengeStatus: 2,
        edited: false,
        editedChallenge: null,
        error: action.error,
        loadingIcon: 3
      }
    case types.CHANGE_STATUS_CHALLENGE:
      return {
        ...state,
        editLoad: true,
        edited: false,
        editedChallenge: null,
        error: '',
        loadingIcon: 1
      }
    case types.CHANGE_STATUS_CHALLENGE_SUCCESS:
      return {
        ...state,
        editLoad: false,
        edited: true,
        editedChallenge: action.result,
        error: '',
        loadingIcon: 2
      }
    case types.CHANGE_STATUS_CHALLENGE_FAIL:
      return {
        ...state,
        editLoad: false,
        edited: false,
        editedChallenge: null,
        error: action.error,
        loadingIcon: 3
    }
    case types.GET_LIVE_CHALLENGE:
    return {
      ...state,
      listLiveLoad: true,
      listLiveChallenges: [],
      loadingLiveChallenge: 1
    }
  case types.GET_LIVE_CHALLENGE_SUCCESS:   
    return {
      ...state,
      listLiveLoad: false,
      listLiveChallenges: action.result,
      loadingLiveChallenge: 2
    }
  case types.GET_LIVE_CHALLENGE_FAIL:
    return {
      ...state,
      listLiveLoad: false,
      listLiveChallenges,
      error: action.error,
      loadingLiveChallenge: 3
  }
  case types.GET_DASHBOARD:
  return {
    ...state,
    getDashboard: false,   
    dashboard: null,
    error: '',
    loadingIcon: 1
  }
case types.GET_DASHBOARD_SUCCESS:
  return {
    ...state,
    getDashboard: true,   
    dashboard: action.result,
    error: '',
    loadingIcon: 2
  }
case types.GET_DASHBOARD_FAIL:
  return {
    ...state,
    getDashboard: true,   
    dashboard: null,
    error: action.error,
    loadingIcon: 3
}
    case types.CREATOR_GET_DASHBOARD:
    return {
      ...state,
      getDashboard: false,   
      dashboard: null,
      error: '',
      loadingIcon: 1
    }
    case types.CREATOR_GET_DASHBOARD_SUCCESS:
    return {
      ...state,
      getDashboard: true,   
      dashboard: action.result,
      error: '',
      loadingIcon: 2
    }
    case types.CREATOR_GET_DASHBOARD_FAIL:
    return {
      ...state,
      getDashboard: true,   
      dashboard: null,
      error: action.error,
      loadingIcon: 3
    }
    default:
      return state;
  }
}