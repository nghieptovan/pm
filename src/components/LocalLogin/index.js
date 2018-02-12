import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import _ from 'lodash';
import './index.scss';
import logoImg from '../../assets/logologin.png';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { renderField, renderMaterialField } from "../ReduxField";
import { validateLoginForm } from '../../utils/formValidation';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as AuthActions from '../../redux/actions/auth';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateLoginForm(values);
};

const selector = formValueSelector('localLoginForm');
@connect(
  state => ({
    userName: selector(state, 'userName'),
    password: selector(state, 'password'),
    userLogin: state.auth  
  }),
  ({ login: (user, currentType) => AuthActions.login(user, currentType) })
)

export default class LocalLogin extends Component {
  constructor(props){
    super(props);
    this.state = {     
      loadingUpload: false
    }
  }
  componentWillMount() {
    const errorCode = sessionStorage.getItem('errorStatus');
    if (errorCode == 201) {
      sessionStorage.removeItem('errorStatus');
      sessionStorage.clear();
      window.location.reload();
    }     
    switch (getCurrentUser().role || '') {
      case 'EADMIN' : {
        browserHistory.push('/admin/clients');
        break;
      }
      case 'CADMIN':
      case 'REVIEWER':
      case 'EREVIEWER': {
        getClientShortName().then(shortName => {
          browserHistory.push(`/client/${shortName}/dashboard`);
        })
        break;
      }
      default: { 
        sessionStorage.clear();
        break;              
     } 
    }
  }

  componentWillReceiveProps(nextProps) {
    const { userLogin: { logged: loggedUser }, userLogin: { user: user } } = nextProps;
    this.props.userLogin.loadingIcon != nextProps.userLogin.loadingIcon && nextProps.userLogin.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';
    this.props.userLogin.loadingIcon != nextProps.userLogin.loadingIcon && nextProps.userLogin.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';
    const isAuthenticated = loggedUser && ['EADMIN', 'CADMIN', 'EREVIEWER', 'REVIEWER'].includes(user.role || '');
    if (isAuthenticated) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      sessionStorage.setItem('token', (user.token || {}));
      if (this.refs.rememberme.checked) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('token', (user.token || {}));
        localStorage.setItem('rememberMe', true);
      }
      window.location.reload();
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    if (this.props.valid) {
      const { userName, password } = this.props;
      const remember = this.refs.rememberme;
      const user = {
        'username': userName,
        'password': password,
        'remember':  remember.checked
      }
      this.setState({loadingUpload: true});
      this.props.login(user, window.location.pathname === '/admin' ? 'EADMIN'  : 'CADMIN' );
    }
  }

  renderShowErrorMessage = message => {
    const style = message !== '' ? {} : { display: 'none' };
    return (
      <div style={style} className='login-error-message'>{message}</div>
    )
  }

  render() {
    const { role, userLogin: {error: errorMessage}, valid, pristine } = this.props;
    let disableButtonStyle = { cursor: 'pointer' };
    if (!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    const pageRole = browserHistory.getCurrentLocation().pathname.replace('/','').includes('admin') ? 'admin' : 'client';     
    return (
      <div className="loginPage">
        <div className={pageRole}>
          <div className="background-wrapper"><div className="background"></div></div>
          <div className="content-wrapper">
            <form role="form" className="login-form form-horizontal material-form">
              <div className="form-group logo-type">
                <img src={logoImg} /><p className="nameRoles">{pageRole}</p>
              </div>
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <Field name="userName" type="text"                   
                    label="Username"
                    autoFocus={true}
                    component={renderMaterialField}
                  />  
                </div>                
              </div>
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <Field name="password" type="password"                   
                      label="Password"
                      autoFocus={true}
                      component={renderMaterialField}
                    />  
                </div>                
              </div>
              
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <div className="remember-wrapper">
                    <input
                      type="checkbox"
                      ref="rememberme"                      
                    />                  
                      <p>Remember me</p>                  
                  </div>
                  <span className="text-danger" style={{color: 'red'}}>{errorMessage}</span>
                </div>
              </div>
              <div className="formgroup form-group submit-wrapper">
                <button style={disableButtonStyle} onClick={this.handleSubmit}><span>LOGIN</span> <i className="fa fa-angle-right" aria-hidden="true"></i></button>
              </div>
              {this.state.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                 } 
            </form>
          </div>
        </div>
      </div>
    )
  }
}

LocalLogin = reduxForm({
  form: 'localLoginForm',
  validate
})(LocalLogin);