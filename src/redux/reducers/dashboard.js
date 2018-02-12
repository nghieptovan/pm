import * as types from '../constants/DashboardActionTypes';
import _ from 'lodash';
import dataMap from '../../utils/config';

const initState = {
  error: '',
  getDashboard: false,
  clientInfo: null
}

export default function dashboard(state = initState, action) {
  switch (action.type) {
    case types.GET_DASHBOARD:
      return {
        ...state
      };
    case types.GET_DASHBOARD_SUCCESS: 
      let data = action.result;
      let editData = [];
      let count = 1;
      let configLocation = dataMap.dataSet;
      let userLocation = data.location;
      if(userLocation){
        _.forEach(userLocation, (value) => {
          if(value.country == 'US' && value.uploads > 0){
            if(value.uploads < 5){
              configLocation[value.location].fillKey = 'Color5';
            }else if(value.uploads < 50){
              configLocation[value.location].fillKey = 'Color4';
            }else if(value.uploads < 100){
              configLocation[value.location].fillKey = 'Color3';
            }else if(value.uploads < 200){
              configLocation[value.location].fillKey = 'Color2';
            }else{
              configLocation[value.location].fillKey = 'Color1';
            }
            configLocation[value.location].uploads = value.uploads;
          }
        });

      }
      data.location = configLocation;

      if(data.weekUploads){
        // editData.push({week: '', uploads: 0, title: '', notShow: true});
        _.forEach(data.weekUploads, (value) => {
          if(count >= 0){
            const name = value.week.length >= 8 ? `${value.week.substring(0, 6)}` : value.week;
            editData.push({week: `Week ${count}`, uploads: value.uploads, title: name, notShow: false});
          }     
          count++;
        });        
        data.weekUploads = editData;
      }
      
      let lastestCh = [];
      _.forEach(data.latestChallenges, (value) => {
        const name = value.challengeName.length > 8 ? `${value.challengeName.substring(0, 6)}..` : value.challengeName;
        lastestCh.push({challengeName: name, uploads: value.uploads, challengeId: value.challengeId});  
      });
      data.latestChallenges = lastestCh;
      
      return {
        ...state,
        error: '',
        getDashboard: true,
        clientInfo: data
      };
    case types.GET_DASHBOARD_FAIL:
      return {
        ...state,
        error: action.error,
        getDashboard: true,
        clientInfo: null
      };
    default:
     return state;
    }
}