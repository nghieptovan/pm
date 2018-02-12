import * as types from '../constants/ReviewerActionTypes';
import _ from 'lodash';
const initState = {
  created: false,
  isAddedSuccessfullyModal: true,
  loadingIcon: 1
}

export default function reviewers(state = initState, action) {
  switch (action.type) {
    case types.GET_LIST_REVIEWERS:
      return {
        ...state,
        loaded: true,
        loadingIcon: 1
      }
    case types.GET_LIST_REVIEWERS_SUCESS:
      return {
        ...state,
        loaded: false,
        success: true,
        listReviewers: action.result,
        loadingIcon: 2
      }
    case types.GET_LIST_REVIEWERS_FAIL:
      return {
        ...state,
        loaded: false,
        success: false,
        listReviewers: null,
        loadingIcon: 3
      }
    case types.CREATE_REVIEWERS:
      return {
        ...state,
        createLoad: true,
        created: false,
        error: '',
        loadingIcon: 1
      }
    case types.CREATE_REVIEWERS_SUCESS:
      let newList = [action.result, ...state.listReviewers];
      return {
        ...state,
        createLoad: false,
        created: true,
        listReviewers: newList,
        error: '',
        reviewerCreated: action.result,
        loadingIcon: 2
      }
    case types.CREATE_REVIEWERS_FAIL:
      return {
        ...state,
        createLoad: false,
        created: false,
        reviewerCreated: null,
        error: action.error,
        loadingIcon: 3
      }
    case types.EDIT_REVIEWERS:
      return {
        ...state,
        editLoad: true,
        edited: false,
        editedReviewer: null,
        errorEdit: '',
        loadingIcon: 1
      }
    case types.EDIT_REVIEWERS_SUCCESS:
      let index = _.findIndex(state.listReviewers, { id: action.result.id });
      state.listReviewers.splice(index, 1, action.result);
      return {
        ...state,
        editLoad: false,
        edited: true,
        editedReviewer: action.result,
        errorEdit: '',
        loadingIcon: 2
      }
    case types.EDIT_REVIEWERS_FAIL:
      return {
        ...state,
        editLoad: false,
        edited: false,
        editedReviewer: null,
        errorEdit: action.error,
        loadingIcon: 3
      }
    case types.DELETE_REVIEWERS:
      return {
        ...state,
        editLoad: true,
        deleted: false,
        deletedReviewer: null,
        loadingIcon: 1
      }
    case types.DELETE_REVIEWERS_SUCCESS:
      let deletedIndex = _.findIndex(state.listReviewers, { id: action.result.id });
      let deletedList = [...state.listReviewers.slice(0, deletedIndex), ...state.listReviewers.slice(deletedIndex + 1)];
      return {
        ...state,
        editLoad: false,
        deleted: true,
        listReviewers: deletedList,
        deletedReviewer: action.result,
        loadingIcon: 2
      }
    case types.DELETE_REVIEWERS_FAIL:
      return {
        ...state,
        editLoad: false,
        deleted: false,
        deletedReviewer: null,
        errorDelete: action.error,
        loadingIcon: 3
      }
    default:
      return state;
  }
}
