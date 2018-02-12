import tl from './tl.json';
import qa from './qa.json';
import prod from './prod.json';

const env = process.env.NODE_ENV;
let hostname = tl.BASE_URL;
let facebookAppID= tl.FACEBOOK_APP_ID;
let s3URL = tl.S3_URL;

if (env === 'production') {
    hostname = prod.BASE_URL;
    facebookAppID = prod.FACEBOOK_APP_ID;
    s3URL = prod.S3_URL;
} else if (env === 'qa') {
    hostname = qa.BASE_URL;
    facebookAppID = qa.FACEBOOK_APP_ID;
    s3URL = qa.S3_URL;
}

export {
    hostname,
    facebookAppID,
    s3URL
}
