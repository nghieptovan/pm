import React, {Component, PropTypes } from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as AdminActions from '../../redux/actions/admin';
import Sidebar from '../../components/Sidebar/Sidebar';
import AdminList from './AdminList';
import './Admins.scss';
import NavHeaderAdmin from '../../components/NavHeader/NavHeaderAdmin';
import Modal from 'react-modal';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateAdminForm} from  './../../utils/formValidation';
import {getCurrentUser} from  './../../utils/common';
import {renderField} from "../ReduxField/index";
import { Scrollbars } from 'react-custom-scrollbars';

let isFormEdited = false;

const validate = values => {
  return validateAdminForm(values, isFormEdited);
};

const selector = formValueSelector('adminCreate');
@connect(
  state => ({
    admin: state.admin,
    lastName: selector(state, 'lastName'),
    firstName: selector(state, 'firstName'),
    userName: selector(state, 'userName'),
    password: selector(state, 'password'),
    mobileNumber: selector(state, 'mobileNumber'),
    email: selector(state, 'email')
  }),
  ({ getListAdmin: token => AdminActions.getListAdmin(token),
    createAdminAccount: (input, token) => AdminActions.createAdminAcount(input, token),
    changeFieldValue: (field, value) => change('adminCreate', field, value),
    editAdmin: (data, token) => AdminActions.editAdmin(data, token),
    deleteAdmin: (id, token) => AdminActions.deleteAdmin(id, token)}
))

export default class Admins extends Component {
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
      admin: ''     
    }
  }

  static propTypes = { createClient: PropTypes.func,
    admin: PropTypes.object,
    getListAdmin: PropTypes.func,
    createAdmin: PropTypes.func,
    changeCreateToEditAdmin: PropTypes.func
  };

  componentWillMount() {
    if (getCurrentUser() === null) {
      browserHistory.push('/admin');
    } else {
      this.props.getListAdmin(getCurrentUser().token);
      this.setState({loadingUpload: true})
    }
  }

  openModal = () => {
    this.setState({modalIsOpen: true});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
  }

  handleCreate = (e) => {
    e.preventDefault();
    if(this.props.valid) {
      let { firstName, lastName, userName, mobileNumber, password, email} = this.props;
      let dataInput = {
        email: email,
        mobile: mobileNumber,
        username: userName,
        role: 'EADMIN',
        firstName: firstName,
        lastName: lastName,
        password: password,
        status: this.state.isActive ? 'Active' : 'Deactive',
        createMode: false
      }
      this.props.createAdminAccount(dataInput, getCurrentUser().token);
      this.setState({ clickCreate: true});
    }
  }
  handleEdit = () => {
    const {firstName, lastName, mobileNumber, userName, email, password, valid, editAdmin} = this.props;
    if(valid) {
      let dataInput = {
        'email': email,
        'mobile': mobileNumber,
        'username': userName,
        'role': 'EADMIN',
        'firstName': firstName,
        'lastName': lastName,
        'password': password || '',
        'id': this.state.editID,
        'status': this.state.isActive ? 'Active' : 'Deactive'
      }
      editAdmin(dataInput, getCurrentUser().token);
      this.setState({admin: userName});      
    }
  }

  handleCancelEdit = (e) => {
    this.setState({editID: ''});
    isFormEdited = false;
    this.props.reset();
  };

  handleDelete = (e) =>{
    if(this.props.valid){
      this.openModal();
    }
  };

  componentWillReceiveProps(nextProps) {
    const isCreatedAdmin = (nextProps.admin.adminCreated && this.props.admin.created !== nextProps.admin.created) || false;
    const { admin: nextAdmin } = nextProps;
    const {admin : admin} = this.props;
    if(isCreatedAdmin){
        this.setState({error: '', clickCreate: false, createMode: true});
        this.showAddedSuccessfullyModal();
        this.props.reset();
    }else if( admin.edited !== nextAdmin.edited && nextAdmin.editedAdmin){
      this.handleCancelEdit();
      this.setState({createMode: false, error: ''});
      this.showAddedSuccessfullyModal();
    }
    else if(nextAdmin.errorEdit){
        this.setState({error: nextAdmin.errorEdit});
    }else {
      this.setState({error: this.state.clickCreate ? nextAdmin.error : ''});
    }
    if(admin.loaded != nextAdmin.loaded && nextAdmin.listAdmin){
      this.setState({listAdmin: nextAdmin.listAdmin});
    }
    if(admin.created != nextAdmin.created && nextAdmin.listAdmin){
      this.setState({listAdmin: nextAdmin.listAdmin});
    }
    admin.loadingIcon != nextAdmin.loadingIcon && nextAdmin.loadingIcon == 1 ? this.setState({ loadingUpload: true}) : '';
    admin.loadingIcon != nextAdmin.loadingIcon && nextAdmin.loadingIcon != 1 ? this.setState({ loadingUpload: false}) : '';
  }

  componentDidMount(){
    this.setState({heightList : window.innerHeight - 80 - this.refs.createAdminForm.clientHeight});
  }

  actionSideBar = (input) => {
    this.setState({
      openSideBar: input
    });
  }

  changeToEditAdmin(data) {
    if (data) {
      const { changeFieldValue } = this.props;
      changeFieldValue('firstName', data.firstName);
      changeFieldValue('lastName', data.lastName);
      changeFieldValue('email', data.email);
      changeFieldValue('mobileNumber', data.mobile);
      changeFieldValue('userName', data.username);
      changeFieldValue('password', '');
      this.setState({
        editID: data.id,
        isActive: data.status === 'Active'
      });
      isFormEdited = true;
    }
  }

  deleteAdmin = () => {
    this.props.deleteAdmin(this.state.editID, getCurrentUser().token);
    this.closeModal();
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
          <Scrollbars autoHide style={{ height: window.innerHeight - 60 }} renderThumbVertical={({ style, ...props }) =>
          <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
          }>
          <div className="container-fluid">
              <div ref="createAdminForm" className="create-admin-form row-fluid">
                <form>
                  <div className="row">
                    <div className="col-md-12 col-lg-12 col-sm-12">
                      <span className="e-admin-title">E-ADMIN</span>
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="firstName" type="text"
                             label="First Name"
                             component={renderField}
                      />
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="lastName" type="text"
                             label="Last Name"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="mobileNumber" type="text"
                             label="Mobile Number"
                             component={renderField}
                      />
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="userName" type="text"
                             label="User Name"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="email" type="text"
                             label="Email"
                             component={renderField}
                      />
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="password" type="password"
                             label="Password"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row" style={{height: '20px', lineHeight: '20px'}}>
                    <div className="col-md-12 col-lg-12 col-sm-12">
                    {this.state.error && <p className="redux-form-error-message" style={{margin: '0 30px'}}>{this.state.error}</p>}
                    </div>
                  </div>
                  <div className="row">                
                    <div className="admin-status-wrapper">
                      <div className="admin-status">
                      <div className="col-md-6 col-lg-6 col-sm-6 pull-right">
                      <label className="activate btn-radio" style={{float: 'right'}}>
                          <input type="radio" name="activated" onChange={() => this.setState({ isActive:true })} checked={this.state.isActive}/>
                          <span className="title-list">Active</span>
                        </label>
                      </div>
                      <div className="col-md-6 col-lg-6 col-sm-6 pull-left">
                        <label className="deactivate btn-radio">
                          <input type="radio" name="inactivate" onChange={() => this.setState({ isActive:false })} checked={!this.state.isActive}/>
                          <span className="title-list">Inactive</span>
                        </label>
                      </div>  
                        
                      </div>
                    </div>
                    </div>
                    <div className="row">
                    <div className="inputrow button-wrapper">
                      {this.state.editID === '' ?
                        <span className="float-right create-button" onClick={(e) => this.handleCreate(e)}
                              style={disableButtonStyle}>Create</span> :
                        <div className="edit-admin-button-wrapper">
                          <span className="update-button" onClick={(e) => this.handleEdit(e)}
                                style={disableButtonStyle}>Update</span>
                          {/* <span className="delete-button" onClick={(e) => this.handleDelete(e)}
                                style={disableButtonStyle}>Delete</span> */}
                          <span className="cancel-button" onClick={(e) => this.handleCancelEdit(e)}>Cancel</span>
                        </div>
                      }
                    </div>
                  </div>
                </form>
              </div>
          <AdminList loadingUpload={this.state.loadingUpload} changeCreateToEditAdmin={(data) => this.changeToEditAdmin(data)} heightList={this.state.heightList} listAdmin={this.state.listAdmin} />
          </div>
          </Scrollbars>
          </div>
          
        </div >

        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
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
          contentLabel="Example Modal"
        >

        <form className='form-confirm'>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12">
              <span className='title-confirm-popup'>Are you sure you want to delete?</span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12">
              <div className="inputrow-confirm-popup">
                <span className="yes-button" onClick={this.deleteAdmin}>YES</span>
                <span className="no-button" onClick={this.closeModal}>NO</span>
              </div>
            </div>
          </div>
        </form>
        </Modal>
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
                <span className='title-confirm-popup'>{this.state.createMode ? "New EADMIN has been added" : "Admin "+this.state.admin+" info has been updated"}</span>
              </div>
            </div>
          </form>
        </Modal>
    </div>
    );
  }
}

Admins = reduxForm({
  form: 'adminCreate',
  validate
})(Admins);
