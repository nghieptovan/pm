import * as types from '../constants/DashboardActionTypes';

export const getDashboard = (token, id) => (
  {
    types: [types.GET_DASHBOARD, types.GET_DASHBOARD_SUCCESS, types.GET_DASHBOARD_FAIL],
    promise: (client) => client.get(`/api/client/get/dashboard/${id}?access_token=${token}`)
  }
)