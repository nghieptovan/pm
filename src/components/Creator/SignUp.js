import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory, Link } from 'react-router';
import _ from 'lodash';
import './SignUp.scss';
import Modal from 'react-modal';
import TermsAndConditions from '../TermsAndConditions/index';
import logoImg from '../../assets/logologin.png';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { renderField, renderMaterialField } from "../ReduxField";
import { validateSignUpForm } from '../../utils/formValidation';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as AuthActions from '../../redux/actions/auth';
import ReCAPTCHA from 'react-google-recaptcha';
import ReactRadioButtonGroup from 'react-radio-button-group';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateSignUpForm(values, false);
};

const selector = formValueSelector('SignUp');
@connect(
  state => ({
    user: state.auth,
    fields: selector(state, 'age', 'userName', 'password', 'firstName', 'lastName', 'email', 'mobile', 'agree'),
  }),
  ({ signup: (user) => AuthActions.signup(user),
    changeFieldValue: (field, value) => change('SignUp', field, value) })
)

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      errorReg: '',
      fields: {},
      firstCall: false,
      agree: false,
      isOpen:false,
      gender: 'Male'
    });
  }
  static propTypes = {
    createdUser: PropTypes.object,
    router: React.PropTypes.object,
    signup: PropTypes.func
  }

  componentWillMount(){        
    this.getLocation();
  }
  
  componentWillReceiveProps(nextProps) {
    const { user: nextUser } = nextProps;
    const { user } = this.props;
    if (nextUser.created != user.created && nextUser.createdUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(nextUser.createdUser));
      sessionStorage.setItem('token', (nextUser.createdUser.token || {})); 
      this.openSuccessModal();
    } else if (nextUser.errorReg) {
      this.setState({errorReg: nextUser.errorReg});
    }    
    user.loadingIcon != nextUser.loadingIcon && nextUser.loadingIcon == 1 ? this.setState({loadingUpload: true}): '';
    user.loadingIcon != nextUser.loadingIcon && nextUser.loadingIcon != 1 ? this.setState({loadingUpload: false}): '';
  };
  getLocation = () => {
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "http://ip-api.com/json", true);
      xhr.onload = () => {
          var result = JSON.parse(xhr.response);    
          this.setState({location: result})                                           
          resolve(xhr.responseText);
      }
      xhr.onerror = () => {         
          reject(xhr.statusText);
      } 
      xhr.send();
    });
  }

  handleSignUp = e => {
    e.preventDefault();    
    if (this.props.valid && this.refs.agree.checked && this.state.captcha) {
      const { fields } = this.props;
      let location = this.state.location;
      location = location.regionName+"-"+location.countryCode +"-"+(location.region && location.region.length > 0 ? location.region : location.countryCode);
      const user = {
        'username': fields.userName,
        'password': fields.password,
        'firstName': fields.firstName,
        'lastName': fields.lastName,
        'email': fields.email,
        'mobile': fields.mobile,
        'role': 'CREATOR',
        'status': 'Active',
        'gender': this.state.gender,
        'age': fields.age,
        'location': location
      }
      this.setState({firstCall: false, loadingUpload: true})
      this.props.signup(user);     
    }    
  };
  openSuccessModal = () => {
    this.setState({ isSignupSuccessfullyModal: true});
    this.startTimer();
  }
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isSignupSuccessfullyModal: false, errorReg: ''});
        browserHistory.push(`/brand`);  
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  openModal = () =>{
    this.setState({isOpen: true});
  }
  closeModal = () => {
    this.setState({isOpen: false});
  }
  renderShowErrorMessage = message => {
    const style = message !== '' ? {} : { display: 'none' };
    return (
      <span style={style} className='login-error-message'>{message}</span>
    )
  };
  handleChange = (value) => {
    this.setState({gender: value});
  }
  onChange = (value) => {
    this.setState({ captcha: value });
  };
  render() {
    const { valid, pristine } = this.props;
    let disableButtonStyle = { cursor: 'pointer' };
    if (!valid || pristine || !this.refs.agree.checked || !this.state.captcha) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    console.log(this.state.loadingUpload)
    return (
      <div className="signUpPage">
        <div className='client'>
          <div className="background-wrapper">
            <div className="background">
            <Link to={`/dashboard`} ref="gotodashboard" style={{display: 'none'}}>
            </Link>
            </div>
          </div>
          <div className="content-wrapper">         
            <form role="form" className="login-form form-horizontal form-signup material-form">
              <div className="form-group logo-type">
                <img src={logoImg} />
              </div>
              <div className="formgroup form-group">              
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                  <Field name="firstName" type="text"                   
                    label="First Name*"
                    component={renderMaterialField}
                  />     
                </div>

                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                  <Field name="lastName" type="text"                   
                    label="Last Name*"
                    component={renderMaterialField}
                  />
                </div>
              </div>             
              <div className="formgroup form-group">
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                  <Field name="email" type="text"                   
                    label="Email*"
                    component={renderMaterialField}
                  /> 
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                  <Field name="mobile" type="text"                   
                    label="Mobile No."
                    component={renderMaterialField}
                  />
                </div>
              </div>
              <div className="formgroup form-group">
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                  <Field name="userName" type="text"                   
                    label="Username*"
                    component={renderMaterialField}
                  />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                  <Field name="password" type="password"                   
                    label="Password*"
                    component={renderMaterialField}
                  />                  
                </div>
              </div>      
              <div className="formgroup form-group">
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12">
                  <Field name="age" type="text"                   
                    label="Age*"
                    component={renderMaterialField}
                  />
                </div>
              <ReactRadioButtonGroup
                options={['Male', 'Female']}
                name="gender"
                isStateful={true}
                value="Male"
                onChange={this.handleChange}
                groupClassName="col-lg-6 col-md-6 col-sm-6 col-xs-12 gendergroup"                
                itemClassName="gender"               
              />  
              </div>                 
              <div className="formgroup form-group remember-wrapper">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 remember-div">
                  <div className="remerber">
                    <input
                      type="checkbox"
                      ref="agree"                      
                    />                  
                      <p>I agree to the <a onClick={() => this.openModal()}>terms and conditions</a> of Entribe</p>                  
                  </div>
                </div>

              </div>
              <div className="formgroup form-group captcha-wrapper">
                <ReCAPTCHA 
                  className="col-lg-12 col-md-12 col-sm-12 col-xs-12"
                  ref="recaptcha"
                  sitekey="6Lf_yTUUAAAAAKGPXSdncLJZXBYdSa9fjeRGyraC"
                  onChange={this.onChange}                  
                />
              </div>
              {
                this.state.errorReg && <div className="error-wrapper text-center">
                  {this.renderShowErrorMessage(this.state.errorReg)}
              </div>
              }
              <div className="formgroup form-group submit-wrapper">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <button style={disableButtonStyle} onClick={this.handleSignUp}><span>SIGN UP</span> <i className="fa fa-angle-right" aria-hidden="true"></i></button>
                </div>
              </div>
              {this.state.loadingUpload &&
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }
            </form>            
          </div>
        </div>
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={this.closeModal}
          className={{
            base: 'customConfirm_Modal',
            afterOpen: 'customConfirm_after-open1',
            beforeClose: 'customConfirm_before-close1'
          }}
          overlayClassName={{
            base: 'customConfirm_Overlay1',
            afterOpen: 'customConfirmOverlay_after-open1',
            beforeClose: 'customConfirmOverlay_before-close1'
          }}
          contentLabel="Added Successfully Modal"
        >
          <form className='form-confirm'>
            <div className="row">              
              <div className="icon-thick-delete-icon" onClick={this.closeModal} />             
              <TermsAndConditions />             
            </div>            
          </form>
        </Modal>
        <Modal
          isOpen={this.state.isSignupSuccessfullyModal}
          onRequestClose={this.closeModal}
          className={{
            base: 'customConfirm_Modal',
            afterOpen: 'customConfirm_after-open',
            beforeClose: 'customConfirm_before-close'
          }}
          overlayClassName={{
            base: 'customConfirm_Overlay',
            afterOpen: 'customConfirmOverlay_after-open',
            beforeClose: 'customConfirmOverlay_before-close'
          }}
          contentLabel="Added Successfully Modal"
        >

          <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>{"Register successfully, redirecting to main page."}</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
}

SignUp = reduxForm({
  form: 'SignUp',
  validate
})(SignUp);