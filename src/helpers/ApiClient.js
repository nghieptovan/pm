import axios from 'axios';
const methods = ['get', 'post', 'put', 'patch', 'delete'];
import {hostname} from '../config';
const formatUrl = (path) => {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  // Prepend `/api` to relative URL, to proxy to API server.
  return hostname + adjustedPath;
}

export default class ApiClient {
  constructor(req) {
    methods.forEach((method) =>
      this[method] = (path, data, gaData) => new Promise((resolve, reject) => {
        axios[method](formatUrl(path), data)
        .then(response => {
          if (response.data.success) {
            if (gaData) {
              const {ReactGA, type, params} = gaData;
              ReactGA.ga(`${type}`, params);
            }
            resolve(response.data.result)
          }  else {
            sessionStorage.setItem('errorStatus', response.data.status.code);
            reject(response.data.status.status)
          }
        }).catch(err => {
          reject(err)
        });
      }));
  }
  empty() {}
}