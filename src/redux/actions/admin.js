//admin api

import * as types from '../constants/AdminActionTypes';

export const getListAdmin = (token) => (
  {
    types: [types.GET_LIST_ADMIN, types.GET_LIST_ADMIN_SUCESS, types.GET_LIST_ADMIN_FAIL],
    promise: (client) => client.get(`/api/admin/get?access_token=${token}`)
  }
)
export const createAdminAcount = (input, token) => (
    {
        types: [types.CREATE_ADMIN, types.CREATE_ADMIN_SUCESS, types.CREATE_ADMIN_FAIL],
        promise: (client) => client.post(`/api/admin/create?access_token=${token}`,{
            username: input.username,
            password: input.password,
            email: input.email,
            mobile: input.mobile,
            role: input.role,
            firstName: input.firstName,
            lastName: input.lastName,
            status: input.status
        })
    }
)

export const editAdmin  = (input, token) => (
  {
    types: [types.EDIT_ADMIN, types.EDIT_ADMIN_SUCCESS, types.EDIT_ADMIN_FAIL],
    promise: (client) => client.put(`/api/admin/edit?access_token=${token}`,{
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

export const deleteAdmin  = (id, token) => (
  {
    types: [types.DELETE_ADMIN, types.DELETE_ADMIN_SUCCESS, types.DELETE_ADMIN_FAIL],
    promise: (client) => client.delete(`/api/admin/delete/${id}?access_token=${token}`,{
      id: id
    })
  }
)
export const getChallengesReport  = (token) => (
  {
    types: [types.GET_CHALLENGES_REPORT, types.GET_CHALLENGES_REPORT_SUCCESS, types.GET_CHALLENGES_REPORT_FAIL],
    promise: (client) => client.get(`/api/report/challenges?access_token=${token}`)
  }
)
export const getActiveClients  = (token) => (
  {
    types: [types.GET_LIST_CLIENT, types.GET_LIST_CLIENT_SUCCESS, types.GET_LIST_CLIENT_FAIL],
    promise: (client) => client.get(`/api/admin/transaction/client?access_token=${token}`)
  }
)
export const getTransaction  = (clientId, token) => (
  {
    types: [types.GET_LIST_TRANSACTION, types.GET_LIST_TRANSACTION_SUCCESS, types.GET_LIST_TRANSACTION_FAIL],
    promise: (client) => client.get(`/api/admin/transaction/${clientId}?access_token=${token}`)
  }
)
export const createTransaction  = (data, token) => (
  {
    types: [types.CREATE_TRANSACTION, types.CREATE_TRANSACTION_SUCCESS, types.CREATE_TRANSACTION_FAIL],
    promise: (client) => client.post(`/api/admin/transaction/create?access_token=${token}`, data)
  }
)
export const exportChallenge = (token) => (
  {
    types: [types.EXPORT_CHALLENGE, types.EXPORT_CHALLENGE_SUCCESS, types.EXPORT_CHALLENGE_FAIL],
    promise: (client) => client.get(`/api/export/challenge/excel?access_token=${token}`)
  }
)
export const exportTransaction = (token, clientId) => (
  {
    types: [types.EXPORT_TRANSACTION, types.EXPORT_TRANSACTION_SUCCESS, types.EXPORT_TRANSACTION_FAIL],
    promise: (client) => client.get(`/api/export/account/${clientId}/excel?access_token=${token}`)
  }
)