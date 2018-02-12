import * as types from '../constants/FileClientsActionTypes';

export const exportRewardClient  = (clientId, token, access_time) => (
  {
      types: [types.EXPORT_REWARD_CLIENT, types.EXPORT_REWARD_CLIENT_SUCCESS, types.EXPORT_REWARD_CLIENT_FAIL],
      promise: (client) => client.get(`/api/export/reward/excel/${clientId}?access_token=${token}&access_time=${access_time}`)
  }
)
export const importRewardClient  = (clientId, dataInput, token, access_time) => (
  {
      types: [types.IMPORT_REWARD_CLIENT, types.IMPORT_REWARD_CLIENT_SUCCESS, types.IMPORT_REWARD_CLIENT_FAIL],
      promise: (client) => client.post(`/api/import/reward/excel/${clientId}?access_token=${token}&access_time=${access_time}`,{
        data: dataInput.data,
        isIgnored: dataInput.isIgnored
      }        
      )
  }
)