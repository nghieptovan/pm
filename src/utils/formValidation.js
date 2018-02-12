import { FIELD_CHARACTERS, SIMPLE_PASS } from './../redux/constants/FieldTypes';

const specialCharacterPattern = new RegExp(/[~`!#$%\^&*+=()@\[\]\\;,/{}|\":<>\?]/);
const emailPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
const mobilePattern = new RegExp(/^\d+$/);
const integerGreaterThan0 = new RegExp(/^[1-9]+[0-9]*$/);

const invalidText = (invalidChars) => { return `The character${invalidChars.length > 1 ? 's' : ''} ${invalidChars.length > 1 ? 'are' : 'is'} not allowed.` };
// const invalidText = (invalidChars) => { return `The character${invalidChars.length > 1 ? 's' : ''} ${invalidChars} ${invalidChars.length > 1 ? 'are' : 'is'} not allowed.` };
const fieldRequiredText = 'This field is required';
const fieldContainSpaceText = 'This field can not contain spaces';
const emailInvalidText = 'Invalid email address';

const validateLoginForm = values => {
  const errors = {}
  if (!values.userName) {
    errors.userName = fieldRequiredText;
  } else if (values.userName.indexOf('@') >= 0) {
    if (!emailPattern.test(values.userName)) {
      errors.userName = emailInvalidText;
    }
  }
  else if (specialCharacterPattern.test(values.userName)) {
    const regex = new RegExp(/[^\w\.\-]/img);
    const invalidChars = values.userName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();
    errors.userName = invalidText(invalidChars);
  }
  else if (values.userName.indexOf(' ') >= 0) {
    errors.userName = fieldContainSpaceText;
  }
  else if (values.userName.length < FIELD_CHARACTERS.USER_NAME.MIN) {
    errors.userName = `Username must be at least ${FIELD_CHARACTERS.USER_NAME.MIN} characters`;
  }
  if (!values.password) {
    errors.password = fieldRequiredText
  }
  else if (values.password.indexOf(' ') >= 0) {
    errors.password = fieldContainSpaceText;
  }
  else if (values.password.length < FIELD_CHARACTERS.PASS.MIN) {
    errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
  }
  return errors
}

const validateClientForm = (values, edited = false) => {
  let errors = {};

  if (!values.branchName) {
    errors.branchName = fieldRequiredText;
  }
  else if (specialCharacterPattern.test(values.branchName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.branchName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.branchName = invalidText(invalidChars);
  }
  else if (values.branchName.length < FIELD_CHARACTERS.BRAND_NAME.MIN || values.branchName.length > FIELD_CHARACTERS.BRAND_NAME.MAX) {
    errors.branchName = `Please use between ${FIELD_CHARACTERS.BRAND_NAME.MIN} and ${FIELD_CHARACTERS.BRAND_NAME.MAX} characters`;
  }

  if (!values.lastName) {
    errors.lastName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.lastName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.lastName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.lastName = invalidText(invalidChars);
  }
  else if (values.lastName.length < FIELD_CHARACTERS.LAST_NAME.MIN || values.lastName.length > FIELD_CHARACTERS.LAST_NAME.MAX) {
    errors.lastName = `Please use between ${FIELD_CHARACTERS.LAST_NAME.MIN} and ${FIELD_CHARACTERS.LAST_NAME.MAX} characters`;
  }

  if (!values.firstName) {
    errors.firstName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.firstName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.branchName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.firstName = invalidText(invalidChars);
  } else if (values.firstName.length < FIELD_CHARACTERS.FIRST_NAME.MIN || values.firstName.length > FIELD_CHARACTERS.FIRST_NAME.MAX) {
    errors.firstName = `Please use between ${FIELD_CHARACTERS.FIRST_NAME.MIN} and ${FIELD_CHARACTERS.FIRST_NAME.MAX} characters`;
  }

  if (!values.userID) {
    errors.userID = fieldRequiredText;
  } else if (values.userID.indexOf(' ') >= 0) {
    errors.userID = fieldContainSpaceText;
  } else if (specialCharacterPattern.test(values.userID)) {
    const regex = new RegExp(/[^\w\.\-]/img);
    const invalidChars = values.userID.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.userID = invalidText(invalidChars);

  } else if (values.userID.length < FIELD_CHARACTERS.USER_ID.MIN || values.userID.length > FIELD_CHARACTERS.USER_ID.MAX) {
    errors.userID = `Please use between ${FIELD_CHARACTERS.USER_ID.MIN} and ${FIELD_CHARACTERS.USER_ID.MAX} characters`;
  }
  if(values.mobileNumber){
    if (values.mobileNumber.length > 0 && !mobilePattern.test(values.mobileNumber)) {
      errors.mobileNumber = 'The mobile number contains only digits';
    } else if (values.mobileNumber.length > 0 && (values.mobileNumber.length < FIELD_CHARACTERS.MOBILE.MIN || values.mobileNumber.length > FIELD_CHARACTERS.MOBILE.MAX)) {
      errors.mobileNumber = `Please use between ${FIELD_CHARACTERS.MOBILE.MIN} and ${FIELD_CHARACTERS.MOBILE.MAX} characters`;
    }  
  }
  
  if (!values.email) {
    errors.email = fieldRequiredText;
  } else if (!emailPattern.test(values.email)) {
    errors.email = emailInvalidText;
  }

  if (!edited) {
    if (!values.password) {
      errors.password = fieldRequiredText;
    } else if (values.password.indexOf(' ') >= 0) {
      errors.password = fieldContainSpaceText;
    } else if (values.password.length < FIELD_CHARACTERS.PASS.MIN) {
      errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
    } else if (SIMPLE_PASS.includes(values.password)) {
      errors.password = 'Pass is simple'
    }
  } else if (values.password) {
    if (values.password.indexOf(' ') >= 0) {
      errors.password = fieldContainSpaceText;
    } else if (values.password.length > 0 && values.password.length < FIELD_CHARACTERS.PASS.MIN) {
      errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
    } else if (SIMPLE_PASS.includes(values.password)) {
      errors.password = 'Pass is simple'
    }
  }

  if (!values.entribeREP) {
    errors.entribeREP = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.entribeREP)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.entribeREP.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();
    errors.entribeREP = invalidText(invalidChars);
  } else if (values.entribeREP.length < FIELD_CHARACTERS.ENTRIBE_REP.MIN || values.entribeREP.length > FIELD_CHARACTERS.ENTRIBE_REP.MAX) {
    errors.entribeREP = `Please use between ${FIELD_CHARACTERS.ENTRIBE_REP.MIN} and ${FIELD_CHARACTERS.ENTRIBE_REP.MAX} characters`;
  }

  if (!values.startDate) {
    errors.startDate = fieldRequiredText;
  } else if (typeof values.endDate !== 'undefined') {
    if (new Date(values.startDate.replace(/-/g, '/')) > new Date(values.endDate.replace(/-/g, '/'))) {
      errors.startDate = 'Start date can\'t be greater than end date';
    }
  }

  if (!values.endDate) {
    errors.endDate = fieldRequiredText;
  }

  return errors;
}


const validateAdminForm = (values, edited = false) => {
  let errors = {};
  if (!values.firstName) {
    errors.firstName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.firstName)) {

    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.firstName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.firstName = invalidText(invalidChars);

  } 
  // else if (values.firstName.indexOf(' ') >= 0) {
  //   errors.firstName = fieldContainSpaceText;
  // }
  else if (values.firstName.length < FIELD_CHARACTERS.FIRST_NAME.MIN || values.firstName.length > FIELD_CHARACTERS.FIRST_NAME.MAX) {
    errors.firstName = `Please use between ${FIELD_CHARACTERS.FIRST_NAME.MIN} and ${FIELD_CHARACTERS.FIRST_NAME.MAX} characters`;
  }
  if (!values.lastName) {
    errors.lastName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.lastName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.lastName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.lastName = invalidText(invalidChars);
  } 
  // else if (values.lastName.indexOf(' ') >= 0) {
  //   errors.lastName = fieldContainSpaceText;
  // }
  else if (values.lastName.length < FIELD_CHARACTERS.LAST_NAME.MIN || values.lastName.length > FIELD_CHARACTERS.LAST_NAME.MAX) {
    errors.lastName = `Please use between ${FIELD_CHARACTERS.LAST_NAME.MIN} and ${FIELD_CHARACTERS.LAST_NAME.MAX} characters`;
  }

  if (!values.userName) {
    errors.userName = fieldRequiredText;
  } else if (values.userName.indexOf(' ') >= 0) {
    errors.userName = fieldContainSpaceText;
  } else if (specialCharacterPattern.test(values.userName)) {
    const regex = new RegExp(/[^\w\.\-]/img);
    const invalidChars = values.userName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.userName = invalidText(invalidChars);
  } else if (values.userName.length < FIELD_CHARACTERS.USER_NAME.MIN || values.userName.length > FIELD_CHARACTERS.USER_NAME.MAX) {
    errors.userName = `Please use between ${FIELD_CHARACTERS.USER_NAME.MIN} and ${FIELD_CHARACTERS.USER_NAME.MAX} characters`;
  }

  // if (!values.mobileNumber) {
  //   errors.mobileNumber = fieldRequiredText;
  // } else
  if(values.mobileNumber){
    if (values.mobileNumber.length > 0 && !mobilePattern.test(values.mobileNumber)) {
      errors.mobileNumber = 'The mobile number contains only digits';
    } else if (values.mobileNumber.length > 0 && (values.mobileNumber.length < FIELD_CHARACTERS.MOBILE.MIN || values.mobileNumber.length > FIELD_CHARACTERS.MOBILE.MAX)) {
      errors.mobileNumber = `Please use between ${FIELD_CHARACTERS.MOBILE.MIN} and ${FIELD_CHARACTERS.MOBILE.MAX} characters`;
    }
  }
  if (!values.email) {
    errors.email = fieldRequiredText;
  } else if (!emailPattern.test(values.email)) {
    errors.email = emailInvalidText;
  }

  if (!edited) {
    if (!values.password) {
      errors.password = fieldRequiredText;
    } else if (values.password.indexOf(' ') >= 0) {
      errors.password = fieldContainSpaceText;
    } else if (values.password.length < FIELD_CHARACTERS.PASS.MIN) {
      errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
    } else if (SIMPLE_PASS.includes(values.password)) {
      errors.password = 'Pass is simple'
    }
  } else {
    if (!values.password) {
      // errors.password = fieldRequiredText;
    } else if (values.password.indexOf(' ') >= 0) {
      errors.password = fieldContainSpaceText;
    } else if (values.password.length > 0 && values.password.length < FIELD_CHARACTERS.PASS.MIN) {
      errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
    } else if (SIMPLE_PASS.includes(values.password)) {
      errors.password = 'Pass is simple'
    }
  }

  return errors;
}

const validateSignUpForm = (values) => {
  let errors = {};
  if (!values.firstName) {
    errors.firstName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.firstName)) {

    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.firstName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.firstName = invalidText(invalidChars);

  }
  //  else if (values.firstName.indexOf(' ') >= 0) {
  //   errors.firstName = fieldContainSpaceText;
  // }
  else if (values.firstName.length < FIELD_CHARACTERS.FIRST_NAME.MIN || values.firstName.length > FIELD_CHARACTERS.FIRST_NAME.MAX) {
    errors.firstName = `Please use between ${FIELD_CHARACTERS.FIRST_NAME.MIN} and ${FIELD_CHARACTERS.FIRST_NAME.MAX} characters`;
  }
  if (!values.lastName) {
    errors.lastName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.lastName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.lastName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.lastName = invalidText(invalidChars);
  } 
  // else if (values.lastName.indexOf(' ') >= 0) {
  //   errors.lastName = fieldContainSpaceText;
  // }
  else if (values.lastName.length < FIELD_CHARACTERS.LAST_NAME.MIN || values.lastName.length > FIELD_CHARACTERS.LAST_NAME.MAX) {
    errors.lastName = `Please use between ${FIELD_CHARACTERS.LAST_NAME.MIN} and ${FIELD_CHARACTERS.LAST_NAME.MAX} characters`;
  }

  if (!values.userName) {
    errors.userName = fieldRequiredText;
  } else if (values.userName.indexOf(' ') >= 0) {
    errors.userName = fieldContainSpaceText;
  } else if (specialCharacterPattern.test(values.userName)) {
    const regex = new RegExp(/[^\w\.\-]/img);
    const invalidChars = values.userName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();

    errors.userName = invalidText(invalidChars);
  } else if (values.userName.length < FIELD_CHARACTERS.USER_NAME.MIN || values.userName.length > FIELD_CHARACTERS.USER_NAME.MAX) {
    errors.userName = `Please use between ${FIELD_CHARACTERS.USER_NAME.MIN} and ${FIELD_CHARACTERS.USER_NAME.MAX} characters`;
  }

  if (values.mobile && !mobilePattern.test(values.mobile)) {
    errors.mobile = 'The mobile number contains only digits';
  } else if ((values.mobile && values.mobile.length < FIELD_CHARACTERS.MOBILE.MIN  ) || (values.mobile && values.mobile.length > FIELD_CHARACTERS.MOBILE.MAX)) {
    errors.mobile = `Please use between ${FIELD_CHARACTERS.MOBILE.MIN} and ${FIELD_CHARACTERS.MOBILE.MAX} characters`;
  } else errors.mobile='';

  if (values.age && !mobilePattern.test(values.age)) {
    errors.age = 'Age contains only digits';
  } else if ((values.age < 18 || values.age > 80)) {
    errors.age = `Age is from 18-80`;
  } 
  if (!values.email) {
    errors.email = fieldRequiredText;
  } else if (!emailPattern.test(values.email)) {
    errors.email = emailInvalidText;
  }
  if (!values.password) {
    errors.password = fieldRequiredText;
  } else if (values.password.indexOf(' ') >= 0) {
    errors.password = fieldContainSpaceText;
  } else if (values.password.length > 0 && values.password.length < FIELD_CHARACTERS.PASS.MIN) {
    errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
  } else if (SIMPLE_PASS.includes(values.password)) {
    errors.password = 'Pass is simple'
  }

  return errors;
}
const validateWidgetForm = (values) => {
  let errors = {};
  if (!values.firstName) {
    errors.firstName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.firstName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.firstName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();
    errors.firstName = invalidText(invalidChars);
  }
  //  else if (values.firstName.indexOf(' ') >= 0) {
  //   errors.firstName = fieldContainSpaceText;
  // }
  else if (values.firstName.length < FIELD_CHARACTERS.FIRST_NAME.MIN || values.firstName.length > FIELD_CHARACTERS.FIRST_NAME.MAX) {
    errors.firstName = `Please use between ${FIELD_CHARACTERS.FIRST_NAME.MIN} and ${FIELD_CHARACTERS.FIRST_NAME.MAX} characters`;
  }
  if (!values.lastName) {
    errors.lastName = fieldRequiredText;
  } else if (specialCharacterPattern.test(values.lastName)) {
    const regex = new RegExp(/[^\w\.\-\ ]/img);
    const invalidChars = values.lastName.match(regex).filter(function (elem, index, self) {
      return index == self.indexOf(elem);
    }).join();
    errors.lastName = invalidText(invalidChars);
  } 
  // else if (values.lastName.indexOf(' ') >= 0) {
  //   errors.lastName = fieldContainSpaceText;
  // }
  else if (values.lastName.length < FIELD_CHARACTERS.LAST_NAME.MIN || values.lastName.length > FIELD_CHARACTERS.LAST_NAME.MAX) {
    errors.lastName = `Please use between ${FIELD_CHARACTERS.LAST_NAME.MIN} and ${FIELD_CHARACTERS.LAST_NAME.MAX} characters`;
  }
  if (!values.email) {
    errors.email = fieldRequiredText;
  } else if (!emailPattern.test(values.email)) {
    errors.email = emailInvalidText;
  }

  return errors;
}
const getMaxLengthField = name => {
  let result = 256;
  switch (name) {
    case 'mobileNumber':
      result = FIELD_CHARACTERS.MOBILE.MAX;
      break;
    case 'email':
      result = FIELD_CHARACTERS.EMAIL_ADDRESS.MAX;
      break;
    case 'password':
      result = FIELD_CHARACTERS.PASS.MAX;
      break;
    case 'description':
      result = FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX;
      break;
    case 'challengeName':
      result = FIELD_CHARACTERS.CHALLENGE_NAME.MAX;
    default:
      result = FIELD_CHARACTERS.BRAND_NAME.MAX;
      break;
  }
  return result;
}

const setReadOnlyField = name => {
  let result = false;
  switch (name) {
    case 'userID':
      result = true;
      break;
    default:
      result = false;
      break;
  }
  return result;
}
const normalizeSlash = ( value, previousValue) => {
  if (!value) {
    return value
  }
  const excludedSlash = value.replace(/[/]/g, '')
  return excludedSlash;
}
const validateChallengeForm = (values, edited = false) => {
  let errors = {};
  if (!values.challengeName) {
    errors.challengeName = fieldRequiredText;
  } else if(values.challengeName.indexOf("/") > -1){
    errors.challengeName = invalidText("/");
  }else if (values.challengeName.trim().length == 0){
    errors.challengeName = fieldRequiredText;
  }
  else if (values.challengeName.length < FIELD_CHARACTERS.CHALLENGE_NAME.MIN || values.challengeName.length > FIELD_CHARACTERS.CHALLENGE_NAME.MAX) {
    errors.challengeName = `Please use between ${FIELD_CHARACTERS.CHALLENGE_NAME.MIN} and ${FIELD_CHARACTERS.CHALLENGE_NAME.MAX} characters`;
  }
  if (values.description) {
    if (values.description.length > FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX) {
      errors.description = `Please use ${FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX} characters or less`;
    }
  }
  if (values.socialPost) {
    if (values.socialPost.length > 140) {
      errors.socialPost = `Please use 140 characters or less`;
    }
  }  
  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  if (!values.startDate) {
    errors.startDate = fieldRequiredText;
  } else if (typeof values.endDate !== 'undefined') {
    if (new Date(values.startDate.replace(/-/g, '/')) > new Date(values.endDate.replace(/-/g, '/'))) {
      errors.endDate = 'End date must be greater than start date!';
    }
  }
  if(values.startDate && (!values.status || values.status != 'LIVE') && (new Date(values.startDate.replace(/-/g, '/')) < currentDate)){
    errors.startDate = 'Start date can\'t be in the past';
  }

  if (!values.endDate) {
    errors.endDate = fieldRequiredText;
  }
  if(values.endDate && (new Date(values.endDate.replace(/-/g, '/')) < currentDate)){
    errors.endDate = 'End date can\'t be in the past';
  }
  return errors;
}

const uploadCreator = (values, edited = false) => {
  let errors = {};
  if (!values.challengeSelect) {
    errors.challengeSelect = fieldRequiredText;
  }  
  return errors;
}
const previewContent = (values, edited = false) => {
  let errors = {}; 
  // if(values.customRewardLevel.length > 0){
  //   if (!mobilePattern.test(values.customRewardLevel)){
  //     errors.customRewardLevel = 'Reward contains only digits';
  //   }
  // }
  if(!values.code){    
      errors.code = fieldRequiredText;    
  } 
  return errors;
}
const validateTransactionForm = (values, edited = false) => {
  let errors = {};
  if (!values.detail) {
    errors.detail = fieldRequiredText;
  } 
  else if (values.detail.length < FIELD_CHARACTERS.CHALLENGE_NAME.MIN || values.detail.length > FIELD_CHARACTERS.CHALLENGE_NAME.MAX) {
    errors.detail = `Please use between ${FIELD_CHARACTERS.CHALLENGE_NAME.MIN} and ${FIELD_CHARACTERS.CHALLENGE_NAME.MAX} characters`;
  }
  if (values.note) {
    if (values.note.length > FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX) {
      errors.note = `Please use ${FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX} characters or less`;
    }
  }
  if (!values.amount) {
    errors.amount = fieldRequiredText;
  } else if (!mobilePattern.test(values.amount)) {
    errors.amount = 'Transaction amount contains only digits';
  } else if(!integerGreaterThan0.test(values.amount)){
    errors.amount = 'Transaction amount greater than 0';
  }
  return errors;
}
const validateChangePasswordForm = (values, edited = false) => {
  let errors = {};
  if (!values.password) {
    errors.password = fieldRequiredText;
  } else if (values.password.indexOf(' ') >= 0) {
    errors.password = fieldContainSpaceText;
  } else if (values.password.length > 0 && values.password.length < FIELD_CHARACTERS.PASS.MIN) {
    errors.password = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
  } else if (SIMPLE_PASS.includes(values.password)) {
    errors.password = 'Password is simple'
  }  
  if (!values.confirm) {
    errors.confirm = fieldRequiredText;
  }
  if(values.confirm !== values.password){
    errors.confirm = "Confirm password doesn't match"
  }
  return errors;
}
const validateChangePasswordAdminForm = (values, edited = false) => {
  let errors = {};
  if (!values.pwd) {
    errors.pwd = fieldRequiredText;
  } else if (values.pwd.indexOf(' ') >= 0) {
    errors.pwd = fieldContainSpaceText;
  } else if (values.pwd.length > 0 && values.pwd.length < FIELD_CHARACTERS.PASS.MIN) {
    errors.pwd = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
  } else if (SIMPLE_PASS.includes(values.pwd)) {
    errors.pwd = 'Password is simple'
  }  
  if (!values.oldPwd) {
    errors.oldPwd = fieldRequiredText;
  } else if (values.oldPwd.indexOf(' ') >= 0) {
    errors.oldPwd = fieldContainSpaceText;
  } else if (values.oldPwd.length > 0 && values.oldPwd.length < FIELD_CHARACTERS.PASS.MIN) {
    errors.oldPwd = `Password must be at least ${FIELD_CHARACTERS.PASS.MIN} characters`;
  } else if (SIMPLE_PASS.includes(values.oldPwd)) {
    errors.oldPwd = 'Password is simple'
  } 
  if (!values.confirmPwd) {
    errors.confirmPwd = fieldRequiredText;
  }
  if(values.confirmPwd !== values.pwd){
    errors.confirmPwd = "Confirm password doesn't match"
  }
  return errors;
}
const validateTemplateForm = (values, edited = false) => {
  let errors = {};
  if (!values.description) {
    errors.description = fieldRequiredText;
  } else if (values.description.length > 0 && values.description.length > FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX) {
    errors.description = `Maximum description length is ${FIELD_CHARACTERS.CHALLENGE_DESCRIPTION.MAX} characters`;
  } 
  if (!values.title) {
    errors.title = fieldRequiredText;
  } else if (values.title.length > 0 && values.title.length > FIELD_CHARACTERS.ADMIN_NAME.MAX) {
    errors.title = `Maximum title length is ${FIELD_CHARACTERS.ADMIN_NAME.MAX} characters`;
  } 
  return errors;
}
export {
  validateTemplateForm,
  validateChangePasswordForm,
  validateTransactionForm,
  validateLoginForm,
  validateClientForm,
  validateAdminForm,
  validateSignUpForm,
  getMaxLengthField,
  setReadOnlyField,
  validateChallengeForm,
  uploadCreator,
  previewContent,
  validateWidgetForm,
  validateChangePasswordAdminForm,
  normalizeSlash
}
