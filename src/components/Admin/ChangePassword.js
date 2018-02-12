import React, {Component, PropTypes } from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as AuthActions from '../../redux/actions/auth';
import Sidebar from '../../components/Sidebar/Sidebar';
import AdminList from './AdminList';
import './Admins.scss';
import NavHeaderAdmin from '../../components/NavHeader/NavHeaderAdmin';
import Modal from 'react-modal';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateChangePasswordAdminForm} from  './../../utils/formValidation';
import {getCurrentUser} from  './../../utils/common';
import {renderField} from "../ReduxField/index";
import { Scrollbars } from 'react-custom-scrollbars';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateChangePasswordAdminForm(values);
};

const selector = formValueSelector('changePwd');
@connect(
  state => ({
    auth: state.auth,
    pwd: selector(state, 'pwd'),
    confirmPwd: selector(state, 'confirmPwd'),
    oldPwd: selector(state, 'oldPwd'),    
  }),
  ({changePwd: (user,token) => AuthActions.changePwd(user, token)})
)

export default class ChangePwd extends Component {
  constructor(props){
    super(props);
    this.state = {
      listAdmin: [],
      error: '',
      heightList: '',
      clickCreate: false,
      openSideBar: false,
      isActive: true,
      editID: '',
      modalIsOpen: false,
      isAddedSuccessfullyModal: false,
      admin: '',
      loadingUpload: false
    }
  }

  static propTypes = { createClient: PropTypes.func,
    auth: PropTypes.object,
    getListAdmin: PropTypes.func,
    createAdmin: PropTypes.func,
    changeCreateToEditAdmin: PropTypes.func
  };

  componentWillMount() {
    if (getCurrentUser() === null) {
      browserHistory.push('/admin');
    } 
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  handleChangePwd = (e) => {
    e.preventDefault();
    if(this.props.valid) {
      let { pwd, oldPwd } = this.props;
      let dataInput = {
        password: pwd,
        oldPassword: oldPwd
      }
      this.setState({loadingUpload: true})
      this.props.changePwd(dataInput, getCurrentUser().token);    
    }
  }
  
  componentWillReceiveProps(nextProps) {
    const { auth: nextAuth } = nextProps;
    const { auth } = this.props;    
    if(auth.changePwd != nextAuth.changePwd && nextAuth.changedInfo){
      this.showAddedSuccessfullyModal();
    } else if (nextAuth.errorChange){
      this.setState({error: nextAuth.errorChange})
    }
    auth.loadingIcon !== nextAuth.loadingIcon && nextAuth.loadingIcon == 1? this.setState({loadingUpload: true}) : '';
        auth.loadingIcon !== nextAuth.loadingIcon && nextAuth.loadingIcon != 1? this.setState({loadingUpload: false}) : '';
  }

  componentDidMount(){
    this.setState({heightList : window.innerHeight - 80 - this.refs.createAdminForm.clientHeight});
  }

  actionSideBar = (input) => {
    this.setState({
      openSideBar: input
    });
  }

  
  showAddedSuccessfullyModal = () => {
    this.setState({ isAddedSuccessfullyModal: true });
    this.startTimer();
  }
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isAddedSuccessfullyModal: false }); 
        this.props.reset();       
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);   
  }
  render() {
    const { admin, valid, pristine } = this.props;
    let disableButtonStyle = {cursor:'pointer'};
    if(!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    return (
      <div id="container" style={{ maxHeight : window.innerHeight + 'px', overflow: 'hidden'}}>
        <div id="wrapper">
          <Sidebar openSideBar={this.state.openSideBar} selected="admins"/>
          <NavHeaderAdmin actionSideBar={(input) => this.actionSideBar(input)}/>               
          <div id="page-wrapper">         
            <div className="container-fluid">            
              <div ref="createAdminForm" className="create-admin-form row-fluid">
                <form>
                    {this.state.loadingUpload && 
            <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading cp" />
            }   
                  <div className="row">
                    <div className="col-md-12 col-lg-12 col-sm-12">
                      <span className="e-admin-title">CHANGE PASSWORD</span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                      <Field name="oldPwd" type="password"
                             label="Old Password"
                             component={renderField}
                      />
                    </div>                    
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                      <Field name="pwd" type="password"
                             label="New Password"
                             component={renderField}
                      />
                    </div>                   
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                      <Field name="confirmPwd" type="password"
                             label="Confirm Password"
                             component={renderField}
                      />
                    </div>                  
                  </div>
                    <div className="row">
                    <div className="col-md-5 col-lg-5 col-sm-5">
                      {this.state.error && <p className="redux-form-error-message" style={{margin: '0 30px'}}>{this.state.error}</p>}
                    </div>                  
                    </div>
                    <div className="row">
                    <div className="inputrow button-wrapper">
                        <div className="edit-admin-button-wrapper">
                            <span className="change-button" onClick={(e) => this.handleChangePwd(e)}  style={disableButtonStyle}>Change Password</span>
                        </div>                    
                    </div>
                  </div>
                </form>
              </div>       
          </div>         
          </div>          
        </div >
        <Modal
          isOpen={this.state.isAddedSuccessfullyModal}         
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
          contentLabel="Updated Successfully Modal"
        >
          <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-check" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Your password has been updated!</span>
              </div>
            </div>
          </form>
        </Modal>
    </div>
    );
  }
}

ChangePwd = reduxForm({
  form: 'changePwd',
  validate
})(ChangePwd);
