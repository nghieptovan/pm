import * as types from '../constants/ContentActionTypes';

export const creatorUpload  = (data, token, access_time) => (
  {
      types: [types.CREATOR_UPLOAD, types.CREATOR_UPLOAD_SUCCESS, types.CREATOR_UPLOAD_FAIL],
      promise: (client) => client.post(`/api/content/upload?access_token=${token}&access_time=${access_time}`, data)
  }
)
export const getListUploads  = (challengeId, token, status) => (
  {
      types: [types.CREATOR_GET_LIST_UPLOAD, types.CREATOR_GET_LIST_UPLOAD_SUCCESS, types.CREATOR_GET_LIST_UPLOAD_FAIL],
      promise: (client) => client.get(`/api/content/get/${challengeId}/${status}?access_token=${token}`)
  }
)
export const getListRewarded  = (token) => (
  {
      types: [types.CONTENT_REWARD_LIST, types.CONTENT_REWARD_LIST_SUCCESS, types.CONTENT_REWARD_LIST_FAIL],
      promise: (client) => client.get(`/api/content/get/rewarded?access_token=${token}`)
  }
)
export const creatorGetMyUpload  = (token) => (
  {
      types: [types.CREATOR_GET_UPLOAD, types.CREATOR_GET_UPLOAD_SUCCESS, types.CREATOR_GET_UPLOAD_FAIL],
      promise: (client) => client.get(`/api/content/get/uploaded?access_token=${token}`)
  }
)


export const contentReviewUpdate  = (token, access_time, status, data, isAll) => (
  {
      types: [types.CONTENT_REVIEW_UPDATE, types.CONTENT_REVIEW_UPDATE_SUCCESS, types.CONTENT_REVIEW_UPDATE_FAIL],
      promise: (client) => client.put(`/api/content/review?access_token=${token}&access_time=${access_time}&status=${status}&isAll=${isAll}`,{
        id: data.id,
        favourites: data.favourites,
        flagged: data.flagged,
        star: data.star,
        comment: data.comment
      })
  }
)

export const contentRewardUpload  = (token, access_time, status, data, isAll, mode) => (
  {
      types: [types.CONTENT_REWARD_UPDATE, types.CONTENT_REWARD_UPDATE_SUCCESS, types.CONTENT_REWARD_UPDATE_FAIL],
      promise: (client) => client.put(`/api/content/reward?access_token=${token}&access_time=${access_time}&status=${status}&isAll=${isAll}&mode=${mode}`,{
        contents: data
      })
  }
)

export const ratingMultiple  = (token, access_time, status, data, isAll) => (
  {
      types: [types.RATING_MULTIPLE_CONTENT, types.RATING_MULTIPLE_CONTENT_SUCCESS, types.RATING_MULTIPLE_CONTENT_FAIL],
      promise: (client) => client.put(`/api/content/rate/multiple?access_token=${token}&access_time=${access_time}&status=${status}&isAll=${isAll}`,{
        contents: data
      })
  }
)


export const searchUpload  = (token, status, name, challengeId) => (
  {
      types: [types.CONTENT_SEARCH, types.CONTENT_SEARCH_SUCCESS, types.CONTENT_SEARCH_FAIL],
      promise: (client) => client.get(`/api/content/search/${challengeId}/${status}?access_token=${token}&name=${name}`)
  }
)

