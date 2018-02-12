import React, {Component, PropTypes} from 'react';
import { browserHistory, Link } from 'react-router';
import {connect} from 'react-redux';
import './index.scss';
import logoImg from '../../assets/logologin.png';
import fbImg from '../../assets/fb.png';
import ggImg from '../../assets/gg.png';
import FacebookLogin from 'react-facebook-login';
import GoogleLogin from 'react-google-login';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import {renderField, renderMaterialField} from "../ReduxField";
import {validateLoginForm} from  '../../utils/formValidation';
import * as AuthActions from '../../redux/actions/auth';
import { getCurrentUser } from '../../utils/common';
import Modal from 'react-modal';
import { facebookAppID} from '../../config';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateLoginForm(values);
};

const selector = formValueSelector('socialLoginForm');
@connect (
  state => ({userLogin: state.auth,
             userName: selector(state, 'userName'), 
             password: selector(state, 'password'),
             email: selector(state, 'email')}),            
             ({login: (user, currentType) => AuthActions.login(user, currentType), 
              loginSocial: (user, social) => AuthActions.loginSocial(user, social),
              forgotPwd: (user) => AuthActions.forgotPwd(user)})
)
export default class SocialLoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      error:'',
      firstCall: false,
      isOpen: false     
    });
  }
  componentWillMount(){    
    const errorCode = sessionStorage.getItem('errorStatus');
    if (errorCode == 201) {
      sessionStorage.removeItem('errorStatus');
      sessionStorage.clear();
      window.location.reload();
    }
    this.props.userLogin.error ? this.setState({firstCall: true}) : '';    
    if ((getCurrentUser().role || '') === 'CREATOR') {
      browserHistory.push('/brand');
    } else {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('token');
    }
    this.getLocation();
  }

  componentWillReceiveProps(nextProps) {
    const { userLogin: { logged: loggedUser }, userLogin: { user: user } } = nextProps;
    const { userLogin } = this.props;
    const { userLogin: nextUserLogin } = nextProps;  
    this.props.userLogin.loadingIcon != nextProps.userLogin.loadingIcon && nextProps.userLogin.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';
    this.props.userLogin.loadingIcon != nextProps.userLogin.loadingIcon && nextProps.userLogin.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';
    if(userLogin.forgotPwd != nextUserLogin.forgotPwd && nextUserLogin.forgotInfo){
      this.showSentSuccess();
    } else if (userLogin.forgotPwd != nextUserLogin.forgotPwd && nextUserLogin.errorForgot){
      this.setState({errorForgot: nextUserLogin.errorForgot})
    }   
    const isLoggedCreator = loggedUser && (user.role || '') === 'CREATOR';    
    if(isLoggedCreator) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('token', (user.token || {}));
      if (this.refs.rememberme.checked) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', (user.token || {}));
        localStorage.setItem('rememberMe', true);
      }
      window.location.reload();
    }
    if(this.state.errorForgot && this.refs.email && this.state.isOpen){
      this.validateForm();
    }    
    if(nextProps.userLogin.error && this.state.firstCall == false){      
      this.setState({error: nextProps.userLogin.error});
    }
  }
  showSentSuccess = () => {
    this.setState({ isSent: true });
    this.startTimer();
  }
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isSent: false }, this.closeModal);        
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  handleSubmit = e => {
    e.preventDefault();
    if(this.props.valid) {
      const { userName, password} = this.props;
      const remember = this.refs.rememberme;
      const user = {
        'username': userName,
        'password': password,
        'remember': remember.checked
      }
      this.props.login(user, 'CREATOR');
      this.setState({firstCall: false, loadingUpload: true})
    }
  }

  responseGoogle = response => {
    let location = this.state.location;
    location = location.regionName+"-"+location.countryCode +"-"+(location.region  && location.region.length > 0? location.region : location.countryCode);
    const user = {
      'first_name': response.profileObj.givenName || '',
      'last_name': response.profileObj.familyName || '',
      'username': response.profileObj.email || '',
      'status': 'Active',
      'location':location
    };                               
    this.props.loginSocial(user, 'google');
  }
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
  responseFacebook = response => {
    let location = this.state.location;
    location = location.regionName+"-"+location.countryCode +"-"+(location.region  && location.region.length > 0? location.region : location.countryCode);
    const user = {
      'first_name': response.first_name || '',
      'last_name': response.last_name || '',
      'username': response.email || '',
      'status': 'Active',
      'location':location
    };
    this.props.loginSocial(user, 'facebook');
  }

  loginToFB = e => {
    e.preventDefault();
    const clickToLoginFB = this.refs.clickToLoginFB;
    clickToLoginFB.click();
  }

  renderShowErrorMessage = message => {
    const style = message !== '' ? {} : {display:'none'};
    return(
        <span style={style} className='login-creator-error-message'>{message}</span>
    )
  }
  validateForm = () => {
    let {email} = this.refs;
    let isOk = true;
    const emailPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!email.value){
      this.setState({errorForgot: 'Please fill in email'});
      isOk = false;
    } else if (!emailPattern.test(email.value)){
      this.setState({errorForgot: 'Invalid email'});
      isOk = false;
    }
    if(isOk){
      this.setState({errorForgot: null});
    }
    return isOk;
  }
  openPopup = () => {
    this.setState({isOpen: true, errorForgot: null });
  }
  closeModal = () => {
    this.props.reset();
    this.setState({ isOpen: false, errorForgot: null});
  }
  handleForgot = (e) => {
    e.preventDefault();
    const email = this.refs.email.value;
    if(this.validateForm()) {
        let data = { 'email': email};
        this.props.forgotPwd(data);
    }    
  }
  render() {
    const { userLogin: {error: errorMessage}, valid, pristine } = this.props;
    let disableButtonStyle = {cursor:'pointer'};   
    if(!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    return (
      <div className="creatorPage-wrapper">
        <div className="creatorPage container-fluid">
          <div className="mobile-portrait">
            <img className="logoImg" src={logoImg} />
            <div className="leftSide col-lg-6 col-md-6 col-sm-6 col-xs-12">
              {/* <div className="backgroundLeft" /> */}
              <div className="contentLeft">
                <form role="form" className="login-form form-horizontal material-form">
                  <div className="formgroup form-group has-feedback">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <Field name="userName" type="text"                   
                        label="Username (Email)"
                        component={renderMaterialField}
                      />  
                    </div>
                  </div>
                  <div className="formgroup form-group">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <Field name="password" type="password"                   
                        label="Password"
                        component={renderMaterialField}
                      />    
                    </div>
                                     
                  </div>
                  <div className="formgroup form-group remember-me">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div className="remember-wrapper">
                        <input
                          type="checkbox"
                          ref="rememberme"  
                          contentEditable="false"                    
                        />                  
                          <p>Remember me</p>                  
                      </div>
                    </div>
                  </div>
                  {this.state.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                 } 
                  <div className="signUp form-group" style={{margin: '0px 15px'}}>
                    <p className='login-forget-password' onClick={this.openPopup}>Forgot password?</p>
                    
                    <Link to={`/signup`}>
                    <p className='login-signup-button'>SIGN UP</p>
                    </Link>
                  </div>
                  <div className="signin-row">
                    <button style={disableButtonStyle} onClick={this.handleSubmit}><span>SIGN IN</span> <i className="fa fa-angle-right" aria-hidden="true"></i></button>
                  </div>
                  
                  {this.state.error && this.renderShowErrorMessage(this.state.error)}
                  <FacebookLogin
                    appId={facebookAppID}
                    ref="clickToLoginFB"
                    fields="name,email,first_name,last_name"
                    cssClass="facebookButtonClass"
                    callback={this.responseFacebook}
                  />
                </form>
              </div>
            </div>
            <div className="rightSide col-lg-6 col-md-6 col-sm-6 col-xs-12">
              <div className="contentRight">
                <form role="form" className="login-form form-horizontal">
                  <div onClick={this.loginToFB} className="social-login form-group has-feedback">
                    <div className="fbButton social-button">
                      <div>
                        <i className="fa fa-facebook" aria-hidden="true"></i> <span>Sign In with Facebook</span>
                      </div>
                    </div>
                  </div>

                  <label className="lableGG">Or</label>

                  <div className="social-login form-group has-feedback">
                    <GoogleLogin
                      clientId="1022732091713-rn5ck7fan7187r7smbd276n13338odga.apps.googleusercontent.com"
                      className="ggButton social-button"
                      buttonText="Sign In with Google+"
                      onSuccess={this.responseGoogle}
                      onFailure={this.responseGoogle}
                    ><div><i className="fa fa-google-plus" aria-hidden="true"></i><span>Sign In with Google+</span></div></GoogleLogin>
                  </div>
                </form>              
              </div>
            </div>
          </div>
        </div>
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={this.closeModal}
          className={{
            base: 'custom_Modal',
            afterOpen: 'custom_after-open-forgot',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Added Successfully Modal"
        >
        <div className="container-fluid">     
          <form role="form" className="login-form form-horizontal material-form">     
            <div className="logoImg">
              <img className="img" src={logoImg} />     
            </div> 
            <div className="formgroup form-group has-feedback header">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <span>Forgot your password?</span>
              </div>
            </div>
            <div className="formgroup form-group has-feedback input-email">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <Field name="email" type="text"                   
                  label="Email address"
                  ref="email"
                  component={renderMaterialField}
                />  
              </div>
            </div>
            <div className="formgroup form-group has-feedback input-email">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" style={{color: 'red', fontWeight: '400'}}>
               {this.state.errorForgot}
              </div>
            </div>
            <div className="formgroup form-group has-feedback">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <button className="button-send pull-right" onClick={(e) => this.handleForgot(e)}>Send me instructions</button>
              </div>
            </div> 
          </form>       
          </div>
        </Modal>
        <Modal
          isOpen={this.state.isSent}
          onRequestClose={this.closeModal2}
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
                <span className='title-confirm-popup'>An email has been sent to your email address, please check your email for instructions</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
}


SocialLoginForm = reduxForm({
  form: 'socialLoginForm',
  validate
})(SocialLoginForm);
