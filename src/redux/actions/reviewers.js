//Reviewers api

import * as types from '../constants/ReviewerActionTypes';

const getListReviewers = (token, id) => (
  {
    types: [types.GET_LIST_REVIEWERS, types.GET_LIST_REVIEWERS_SUCESS, types.GET_LIST_REVIEWERS_FAIL],
    promise: (client) => client.get(`/api/client/get/${id}/reviewers?access_token=${token}`)
  }
)
const createReviewerAcount = (input, token) => (
  {
    types: [types.CREATE_REVIEWERS, types.CREATE_REVIEWERS_SUCESS, types.CREATE_REVIEWERS_FAIL],
    promise: (client) => client.post(`/api/client/create/reviewer?access_token=${token}`, {
      username: input.username,
      password: input.password,
      email: input.email,
      mobile: input.mobile,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      status: input.status,
      clientId: input.clientId
    })
  }
)

const editReviewer = (input, token) => (
  {
    types: [types.EDIT_REVIEWERS, types.EDIT_REVIEWERS_SUCCESS, types.EDIT_REVIEWERS_FAIL],
    promise: (client) => client.put(`/api/client/edit/reviewer?access_token=${token}`, {
      username: input.username,
      password: input.password,
      email: input.email,
      mobile: input.mobile,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      status: input.status,
      id: input.id
    })
  }
)

const deleteReviewer = (id, token) => (
  {
    types: [types.DELETE_REVIEWERS, types.DELETE_REVIEWERS_SUCCESS, types.DELETE_REVIEWERS_FAIL],
    promise: (client) => client.delete(`/api/client/delete/reviewer/${id}?access_token=${token}`, {
      id: id
    })
  }
)

export {
  getListReviewers,
  createReviewerAcount,
  editReviewer,
  deleteReviewer,
}
