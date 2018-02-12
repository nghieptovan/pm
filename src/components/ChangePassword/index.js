import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import _ from 'lodash';
import '../LocalLogin/index.scss';
import logoImg from '../../assets/logologin.png';
import {validateChangePasswordForm} from '../../utils/formValidation'
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { renderField, renderMaterialField } from "../ReduxField";
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as AuthActions from '../../redux/actions/auth';
import Modal from 'react-modal';
import ReactLoading from 'react-loading';
const validate = values => {
    return validateChangePasswordForm(values);
  };
const selector = formValueSelector('changePwdForm');
@connect(
  state => ({
    password: selector(state, 'password'),
    confirm: selector(state, 'confirm'),
    auth: state.auth
  }),
  ({ changePwd: (user, token) => AuthActions.changePwd(user, token) })
)

export default class ChangePwd extends Component {
    constructor(props){
    super(props);
    this.state = {
      changed: false
    }
    }
    componentWillReceiveProps(nextProps){
        const { auth } = this.props;
        const { auth: nextAuth } = nextProps;
        auth.changePwd != nextAuth.changePwd && nextAuth.changedInfo ? this.showSuccessModal() : '';
        nextAuth.errorChange ? this.setState({error: nextAuth.errorChange}): '';
        
    }
    showSuccessModal = () => {
        this.setState({ isOpen: true});
        this.startTimer();
    }
    startTimer = () => {
        this.setState({ timeCountDown: 2000 });
        let intervalId = setInterval(() => {
          if (this.state.timeCountDown < 0) {
            this.closeModal();  
            browserHistory.push('/');      
            clearInterval(intervalId);
          } else {
            let _timeCountDown = this.state.timeCountDown - 500;
            this.setState({ timeCountDown: _timeCountDown });
          }
        }, 500);
      }
    closeModal = () => {
      this.props.reset();
      this.setState({ isOpen: false});
    }
    handleSubmit = e => {
        e.preventDefault();
        if (this.props.valid) {
        const { confirm, password } = this.props;
        const user = {       
            'password': password
        }
        this.setState({loadingUpload: true})
        this.props.changePwd(user, this.props.params.token );
        }
    } 
    render() {   
        return (
      <div className="loginPage">
        <div className="admin">
          <div className="background-wrapper"><div className="background"></div></div>
          <div className="content-wrapper">          
            <form role="form" className="login-form form-horizontal material-form">
              <div className="form-group logo-type">
                <img src={logoImg} />
              </div>
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                  <Field name="password" type="password"                   
                    label="New password"
                    autoFocus={true}
                    component={renderMaterialField}
                  />  
                </div>                
              </div>
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <Field name="confirm" type="password"                   
                      label="Confirm password"
                      autoFocus={true}
                      component={renderMaterialField}
                    />  
                </div>                
              </div>      
              <div className="formgroup form-group">
                <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" style={{color: 'red'}}>
                  {this.state.error}
                </div>                
              </div>           
              <div className="formgroup form-group submit-wrapper">
                <button onClick={this.handleSubmit}><span>Submit</span> <i className="fa fa-angle-right" aria-hidden="true"></i></button>
              </div>
            </form>          
          </div>
        </div>
        <Modal
            isOpen={this.state.isOpen}
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
                <span className='title-confirm-popup'>Your password has been set, redirecting to login page</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
}
ChangePwd = reduxForm({
  form: 'changePwdForm',
  validate 
})(ChangePwd);