
import { 
  LOGIN, 
  LOGIN_SUCCESS, 
  LOGIN_FAIL,
  LOGOUT,   
  LOGOUT_SUCCESS, 
  LOGOUT_FAIL,
  LOAD,
  LOAD_SUCCESS,
  LOAD_FAIL,
  REGISTER, 
  REGISTER_SUCCESS, 
  REGISTER_FAIL,
  GET_TWITTER,
  GET_TWITTER_FAIL,
  GET_TWITTER_SUCCESS,
  FORGOT_PASSWORD,
  FORGOT_PASSWORD_FAIL,
  FORGOT_PASSWORD_SUCCESS,
  CHANGE_PASSWORD,
  CHANGE_PASSWORD_FAIL,
  CHANGE_PASSWORD_SUCCESS 
} from '../constants/AuthActionTypes';
import * as types from '../constants/AuthActionTypes';
import moment from 'moment';
import axios from 'axios';

export const login = (user, currentType) => (
  {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.put(`/api/auth/local?role=${currentType}&remember=${user.remember}`, {
      username: user.username,
      password: user.password
    })
  }
)

export const logout = (token) => (
  {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.put(`/api/auth/sign-out?access_token=${token}` )
  }
)

export const loginSocial = (user, social) => (
  {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.put(`/api/auth/social?social=${social}&access_time=${moment()}`, {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.username
    })
  }
)

export const signup = (user) => (
  {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAIL],
    promise: (client) => client.post(`/api/auth/register`, user)   
  }
)

export const getTwitter = (access_token, clientId) => (
  {
    types: [GET_TWITTER, GET_TWITTER_SUCCESS, GET_TWITTER_SUCCESS],
    promise: (client) => client.get(`/api/social/twitter/${clientId}/get?access_token=${access_token}`)   
  }
)

export const forgotPwd = (user) => (
  {
    types: [FORGOT_PASSWORD, FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAIL],
    promise: (client) => client.put(`/api/auth/forgot-pwd`, user)
  }
)

export const changePwd = (user, token) => (
  {
    types: [CHANGE_PASSWORD, CHANGE_PASSWORD_SUCCESS, CHANGE_PASSWORD_FAIL],
    promise: (client) => client.put(`/api/auth/change-pwd?access_token=${token}`, user)
  }
)