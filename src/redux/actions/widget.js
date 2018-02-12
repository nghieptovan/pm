import * as types from '../constants/WidgetActionTypes';
export const uploadWidget = (access_time, data) => (
  {
    types: [types.UPLOAD_WIDGET, types.UPLOAD_WIDGET_SUCCESS, types.UPLOAD_WIDGET_FAIL],
    promise: (client) => client.post(`/api/widget/upload?access_time=${access_time}`, data)
  }
)

export const checkEmail = (email) => (
  {
    types: [types.CHECK_EMAIL, types.CHECK_EMAIL_SUCCESS, types.CHECK_EMAIL_FAIL],
    promise: (client) => client.put(`/api/widget/account?email=${email}`)
  }
)


