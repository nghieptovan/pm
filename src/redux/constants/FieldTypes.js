import moment from 'moment';

const FIELD_CHARACTERS = {
  DOMAIN_NAME: {MIN:4, MAX:253},
  EMAIL_ADDRESS: {MIN:7, MAX:254},
  LAST_NAME: {MIN:1, MAX:35},
  FIRST_NAME: {MIN:1, MAX:35},
  USER_NAME: {MIN:1, MAX:70},
  TELEPHONE_NUMBER: {MIN:10, MAX:15},
  HTTPS_URL: {MIN:11, MAX:2083},
  URL: {MIN:6, MAX:2083},
  PASS: {MIN:6, MAX:254},
  BRAND_NAME: {MIN: 1, MAX: 70},
  ADMIN_NAME: {MIN: 1, MAX: 35},
  DISPLAY_NAME: {MIN: 1, MAX: 70},
  CONTACT_NAME: {MIN: 1, MAX: 70},
  USER_ID: {MIN: 1, MAX: 35},
  MOBILE: {MIN: 10, MAX: 15},
  ENTRIBE_REP: {MIN: 1, MAX: 35},
  CHALLENGE_NAME: {MIN: 1, MAX: 150},
  CHALLENGE_DESCRIPTION: {MAX: 250}
}

const FIELD_TYPE = {
  USER_NAME: 'Username',
  PASS: 'Password'
}

const SIMPLE_PASS = [
  "password",
  "password1",
  "drowssap",
  "123456",
  "654321",
  "abcdefg",
  "gfedcba",
  "111111",
  "bbbbbb",
  "123123",
  "007007",
  "hahaha",
  "21122112",
  "qwerty",
  "qwertyui",
  "qwerty1",
  "qwerty12",
  "asdfgh",
  "asdfghjk",
  "monkey1",
  "donkey1"
];

const ADMIN_DATA_DEFAULT = {
  firstName: 'admin',
  lastName: 'admin',
  userName: 'admin',
  mobileNumber: '0123456789',
  email : 'john@gmail.com',
  password: ''
};

const USER_DATA_DEFAULT = {
  branchName: 'Adidas',
  firstName: 'John',
  lastName: 'Steve',
  mobileNumber: '0123456789',
  userID: '123',
  entribeREP: '7986543',
  email : 'abc@gmail.com',
  startDate:  moment().format('MM-DD-YYYY'),
  endDate:  moment().format('MM-DD-YYYY'),
  password: ''
};

export {
  FIELD_CHARACTERS,
  SIMPLE_PASS,
  FIELD_TYPE,
  ADMIN_DATA_DEFAULT,
  USER_DATA_DEFAULT
}
