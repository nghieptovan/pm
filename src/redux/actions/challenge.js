
import * as types from '../constants/ChallengeActionTypes';
import { getClientShortName } from '../../utils/common';
export const createChallenge = (input, token) => (
    {
        types: [types.CREATE_CHALLENGE, types.CREATE_CHALLENGE_SUCCESS, types.CREATE_CHALLENGE_FAIL],
        promise: (client) => client.post(`/api/challenge/create?access_token=${token}`, input)
    }
)
export const getListChallenges = (clientId, token, status) => (
    {
        types: [types.GET_LIST_CHALLENGES, types.GET_LIST_CHALLENGES_SUCCESS, types.GET_LIST_CHALLENGES_FAIL],
        promise: (client) => client.get(`/api/challenge/get/${status}/${clientId}?access_token=${token}`)
    }
  )
export const getChallengesForUploads = (clientId, token) => (
    {
        types: [types.GET_LIST_CHALLENGES_FOR_UPLOAD, types.GET_LIST_CHALLENGES_FOR_UPLOAD_SUCCESS, types.GET_LIST_CHALLENGES_FOR_UPLOAD_FAIL],
        promise: (client) => client.get(`/api/challenge/get/${clientId}/upload?access_token=${token}`)
    }
)
export const getChallengeById  = (token, id) => (
    {
        types: [types.GET_CHALLENGE_BY_ID, types.GET_CHALLENGE_BY_ID_SUCCESS, types.GET_CHALLENGE_BY_ID_FAIL],
        promise: (client) => client.get(`/api/challenge/get/${id}?access_token=${token}`)
    }
)
export const getChallengeForWidget  = (id) => (
    {
        types: [types.GET_CHALLENGE_BY_ID, types.GET_CHALLENGE_BY_ID_SUCCESS, types.GET_CHALLENGE_BY_ID_FAIL],
        promise: (client) => client.get(`/api/challenge/get/widget/${id}`)
    }
)
export const editChallenge = (input, token) => (
    {
        types: [types.EDIT_CHALLENGE, types.EDIT_CHALLENGE_SUCCESS, types.EDIT_CHALLENGE_FAIL],
        promise: (client) => client.put(`/api/challenge/edit?access_token=${token}`, input)
    }
)
export const changeStatusChallenge = ( id, status, token, time) => (
    {
        types: [types.EDIT_CHALLENGE, types.EDIT_CHALLENGE_SUCCESS, types.EDIT_CHALLENGE_FAIL],
        promise: (client) => client.put(`/api/challenge/${id}/status/${status}?access_token=${token}&access_time=${time}`)
    }
)
export const searchChallenge = (clientId, status, name, token) => (
    {
        types: [types.SEARCH_CHALLENGE, types.SEARCH_CHALLENGE_SUCCESS, types.SEARCH_CHALLENGE_FAIL],
        promise: (client) => client.get(`/api/challenge/search/name/${status}/${clientId}?access_token=${token}&name=${name}`)
    }
)
export const searchChallengeByDate = (clientId, status, date, token) => (
    {
        types: [types.SEARCH_DATE_CHALLENGE, types.SEARCH_DATE_CHALLENGE_SUCCESS, types.SEARCH_DATE_CHALLENGE_FAIL],
        promise: (client) => client.get(`/api/challenge/search/date/${date}/${status}/${clientId}?access_token=${token}`)
    }
)
export const getLiveChallenge = ( token, page = 0, maxRecords = 5, data) => (
    {
        types: [types.GET_LIVE_CHALLENGE, types.GET_LIVE_CHALLENGE_SUCCESS, types.GET_LIVE_CHALLENGE_FAIL],
        promise: (client) => client.get(`/api/challenge/get/live?page=${page}&maxRecords=${maxRecords}&brandName=${data}`)
        // promise: (client) => client.get(`/api/challenge/get/${clientId}/live?access_token=${token}&page=${page}&maxRecords=${maxRecords}`)
    }
)
export const getDashboard = (id, token) => (
    {
        types: [types.GET_DASHBOARD, types.GET_DASHBOARD_SUCCESS, types.GET_DASHBOARD_FAIL],
        promise: (client) => client.get(`/api/challenge/get/dashboard/${id}?access_token=${token}`)
    }
)
export const creatorGetDashboard = (clientName, challenge) => (
    {
        types: [types.CREATOR_GET_DASHBOARD, types.CREATOR_GET_DASHBOARD_SUCCESS, types.CREATOR_GET_DASHBOARD_FAIL],
        promise: (client) => client.get(`/api/challenge/creator/get/dashboard?client=${clientName}&challenge=${challenge}`)
    }
)
