import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import * as ReviewerActions from '../../redux/actions/reviewers';
import SidebarClient from '../../components/Sidebar/SidebarClient';
import ReviewerList from './ReviewerList';
import NavHeaderClient from '../../components/NavHeader/NavHeaderClient';
import Modal from 'react-modal';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateAdminForm } from './../../utils/formValidation';
import { getCurrentUser } from './../../utils/common';
import { renderField } from "../ReduxField/index";
import './Reviewers.scss';
import { Scrollbars } from 'react-custom-scrollbars';

let isFormEdited = false;

const validate = values => {
  return validateAdminForm(values, isFormEdited);
};

const selector = formValueSelector('reviewerCreate');
@connect(
  state => ({
    reviewers: state.reviewers,
    lastName: selector(state, 'lastName'),
    firstName: selector(state, 'firstName'),
    userName: selector(state, 'userName'),
    password: selector(state, 'password'),
    mobileNumber: selector(state, 'mobileNumber'),
    email: selector(state, 'email'),
  }),
  ({
    getListReviewers: (token, id) => ReviewerActions.getListReviewers(token, id),
    createReviewerAcount: (input, token) => ReviewerActions.createReviewerAcount(input, token),
    changeFieldValue: (field, value) => change('reviewerCreate', field, value),
    editReviewer: (data, token) => ReviewerActions.editReviewer(data, token),
    deleteReviewer: (id, token) => ReviewerActions.deleteReviewer(id, token)
  })
)

export default class Reviewers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      heightList: '',
      clickCreate: false,
      openSideBar: false,
      isActive: true,
      editID: '',
      modalIsOpen: false,
      isAddedSuccessfullyModal: false,
      isUpdatedSuccessfullyModal: false,
      timeCountDown: 0,
      currentFirstName: '',
      currentLastName: '', 
    }
  }

  static propTypes = {
    reviewers: PropTypes.object,
    getListReviewers: PropTypes.func,
    createReviewer: PropTypes.func,
    changeCreateToEditReviewer: PropTypes.func
  };

  componentWillMount() {
    const {token, clientId} = getCurrentUser();
    if (!clientId) {
      browserHistory.push('/client');
    } else {      
      this.props.getListReviewers(token, clientId);
      this.setState({loadingUpload: true});
    }
  }

  openModal = () => {
    this.setState({ modalIsOpen: true });
  }

  closeModal = () => {
    this.setState({
      modalIsOpen: false,
      isAddedSuccessfullyModal: false,
      isUpdatedSuccessfullyModal: false
    });
  }

  handleCreate = e => {
    e.preventDefault();
    if (this.props.valid) {
      let { firstName, lastName, userName, mobileNumber, password, email } = this.props;
      let dataInput = {
        email: email.trim(),
        mobile: mobileNumber,
        username: userName.trim(),
        role: 'REVIEWER',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password: password,
        status: this.state.isActive ? 'Active' : 'Deactive',
        clientId: getCurrentUser().clientId
      }
      this.props.createReviewerAcount(dataInput, getCurrentUser().token);
      this.setState({ clickCreate: true });
    }
  }
  handleEdit = () => {
    const { firstName, lastName, mobileNumber, userName, email, password, valid, editReviewer } = this.props;
    if (valid) {
      let dataInput = {
        'email': email,
        'mobile': mobileNumber,
        'username': userName,
        'role': 'REVIEWER',
        'firstName': firstName,
        'lastName': lastName,
        'password': password || '',
        'id': this.state.editID,
        'status': this.state.isActive ? 'Active' : 'Deactive'
      }
      editReviewer(dataInput, getCurrentUser().token);      
    }
  }

  handleCancelEdit = e => {
    this.resetForm();
  }

  resetForm = () => {
    this.setState({ editID: '' });
    isFormEdited = false;
    this.props.reset();
  }

  handleDelete = e => {
    if (this.props.valid) {
      this.openModal();
    }
  }

  deleteReviewer = () => {
    this.props.deleteReviewer(this.state.editID, getCurrentUser().token);
    this.closeModal();
    this.resetForm();
  }

  componentWillReceiveProps(nextProps) {
    const isCreatedReviewer = (nextProps.reviewers.created && this.props.reviewers.created !== nextProps.reviewers.created) || false
    const {reviewers: nextReviewer } = nextProps;
    const {reviewers} = this.props;
    if (isCreatedReviewer) {
      this.setState({ error: '', clickCreate: false });
      this.props.reset();
      this.showAddedSuccessfullyModal();
    } else if (reviewers.edited !== nextReviewer.edited && nextReviewer.editedReviewer){
      this.setState({ error: ''});
      this.resetForm();
      this.showUpdatedSuccessfullyModal();
    } else if (nextReviewer.errorEdit){
      this.setState({ error: nextReviewer.errorEdit});
    }
    else {
      this.setState({ error: this.state.clickCreate ? nextReviewer.error : '' });
    }
    reviewers.loadingIcon !== nextReviewer.loadingIcon && nextReviewer.loadingIcon ==1  ? this.setState({loadingUpload: true}):'';
    reviewers.loadingIcon !== nextReviewer.loadingIcon && nextReviewer.loadingIcon !=1  ? this.setState({loadingUpload: false}):'';
  }
  componentDidMount() {
    let heightList = 0;
    getCurrentUser().role !== 'REVIEWER' ? heightList = window.innerHeight - 80 - this.refs.createReviewerForm.clientHeight : heightList = window.innerHeight - 80;
    this.setState({ heightList: heightList });
  }

  actionSideBar = input => {
    this.setState({
      openSideBar: input
    });
  }

  changeToEditReviewer = data => {
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

  showAddedSuccessfullyModal = () => {
    this.setState({
      isAddedSuccessfullyModal: true,
      currentFirstName: this.props.firstName,
      currentLastName: this.props.lastName,
    });
    this.startTimer();
  }

  showUpdatedSuccessfullyModal = () => {
    this.setState({
      isUpdatedSuccessfullyModal: true,
    });
    this.startTimer();
  }

  startTimer = () => {
    this.setState({ timeCountDown: 1500 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isAddedSuccessfullyModal: false, isUpdatedSuccessfullyModal: false });
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  };

  render() {
    const { reviewers, valid, pristine, params: { shortName } } = this.props;
    let disableButtonStyle = { cursor: 'pointer' };
    if (!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    return (
      <div id="container" style={{ maxHeight: window.innerHeight + 'px', overflow: 'hidden' }}>
        <div id="wrapper">
          <SidebarClient openSideBar={this.state.openSideBar} shortName={shortName} expanded={true} selected="settings/reviewers"  />
          <NavHeaderClient actionSideBar={(input) => this.actionSideBar(input)} title='Reviewer' isShowedCreateChallenge={false} />
          <div id="page-wrapper">
          <Scrollbars autoHide style={{ height: window.innerHeight - 70 }} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                  }>
            <div className="creator-client">
              { getCurrentUser().role !== 'REVIEWER' && <div ref="createReviewerForm" className="create-admin-form row-fluid">
                <form>
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
                    <div className="col-md-5 col-lg-5 col-sm-5 error-message">
                      {this.state.error && <p className="redux-form-error-message" style={{ margin: '0 30px' }}>{this.state.error}</p>}
                    </div>
                    <div className="admin-status-wrapper">
                      <div className="admin-status">
                        <label className="activate btn-radio">
                          <input type="radio" name="activated" onChange={() => this.setState({ isActive: true })} checked={this.state.isActive} />
                          <span className="title-list">Active</span>
                        </label>
                        <label className="deactivate btn-radio" >
                          <input type="radio" name="inactivate" onChange={() => this.setState({ isActive: false })} checked={!this.state.isActive} />
                          <span className="title-list">Inactive</span>
                        </label>
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
                          <span className="delete-button" onClick={(e) => this.handleDelete(e)}
                            style={disableButtonStyle}>Delete</span>
                          <span className="cancel-button" onClick={(e) => this.handleCancelEdit(e)}>Cancel</span>
                        </div>
                      }
                    </div>
                  </div>
                </form>
              </div> }
              
              <ReviewerList loadingUpload={this.state.loadingUpload} changeCreateToEditReviewer={(data) => this.changeToEditReviewer(data)}
                heightList={this.state.heightList}
                listReviewers={reviewers.listReviewers}
                reviewers={reviewers} />
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
          contentLabel="Delete Confirm Modal"
        >

          <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button className="btn btn-danger btn-circle btn-lg" type="button"><i className="fa fa-trash" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Are You Sure You Want To Remove This Reviewer?</span>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-6 col-sm-6 inputrow-confirm-popup">
                <span className="yes-button" onClick={this.deleteReviewer}>YES</span>
              </div>
              <div className="col-md-6 col-lg-6 col-sm-6 inputrow-confirm-popup">
                <span className="no-button" onClick={this.closeModal}>NO</span>
              </div>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={this.state.isAddedSuccessfullyModal}
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
                <span className='title-confirm-popup'>{this.state.currentFirstName + " " + this.state.currentLastName + " Has Been Added as Reviewer"}</span>
              </div>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={this.state.isUpdatedSuccessfullyModal}
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
                <span className='title-confirm-popup'>{"Reviewer Details Has Been Updated"}</span>
              </div>
            </div>
          </form>
        </Modal>

      </div>
    );
  }
};

Reviewers = reduxForm({
  form: 'reviewerCreate',
  validate
})(Reviewers);