import React, {Component, PropTypes} from 'react';
import './ClientList.scss';
import moment from 'moment';
import Modal from 'react-modal';
import * as ClientActions from '../../redux/actions/client';
import {connect} from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Field, reduxForm, formValueSelector, reset } from 'redux-form';
import DatePickerCustom from './../../components/DatePickerCustom/DatePickerCustom';
import {renderField} from "../ReduxField";
import {validateClientForm} from  '../../utils/formValidation';
import {USER_DATA_DEFAULT} from './../../redux/constants/FieldTypes';
import Dropzone from 'react-dropzone';
import ModalModule from '../ModalModule';
import ReactLoading from 'react-loading';

const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const validate = values => {
  return validateClientForm(values, true);
};

class ClientList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
      id: '',
      comment: '',
      errorEdit: '',
      heightWindow: '',
      errorSearch: '',
      isEditedSuccessfullyModal: false,
      isExportClient: this.props.isExportClient,
      isClickEdit: false,
      imageFileName:null,
      imageContent: null,
      typeModal: '',
      classModal: ''
    }
    this.openEditModal = this.openEditModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.sortTable = this.sortTable.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    let client = nextProps.client;    
    if(this.props.client.edited  !== client.edited && client.edited && client.editedClient ){
    //   this.showEditedSuccessfullyModal();
    //  this.closeModal();
    }else{
      this.setState({edited: false ,errorEdit: this.state.isClickEdit ? client.errorEdit : ''});
    }
    if(client.successSearch && client.listClient.length === 0){
      this.setState({errorSearch: `We couldn't find anything for this key.`});
    }
    if(client.successSearch && client.listClient.length > 0){
      this.setState({errorSearch: ``});
    }
  }
  componentDidMount(){
    this.setState({ heightWindow: window.innerHeight - 60 });
    var html = this.refs.listClientPage.innerHTML; //Some HTML String from code above 
  }

  openEditModal() {
    this.setState({modalIsOpen: true, typeModal: 'EditClient', classModal: 'custom_after-open'});
  }

  afterOpenModal() {
    this.setState({errorEdit: ``, isClickEdit: false});
  }

  closeModal() {
    this.setState({modalIsOpen: false, imageContent: null, imageFileName:null});
    this.props.reset();
  }

  clicktoBranch(user){   
    this.setState({
      id: user.id,
      comment: 'This is for testing for ' + user.brand_name,
      errorEdit: ''
    });
    USER_DATA_DEFAULT.branchName = user.brand_name;
    USER_DATA_DEFAULT.lastName = user.lastName;
    USER_DATA_DEFAULT.firstName = user.firstName;
    USER_DATA_DEFAULT.mobileNumber = user.mobile_number;
    USER_DATA_DEFAULT.userID = user.username;
    USER_DATA_DEFAULT.entribeREP = user.entribe_rep;
    USER_DATA_DEFAULT.email = user.email;
    USER_DATA_DEFAULT.password = '';
    USER_DATA_DEFAULT.startDate = moment(user.start_date).format("MM-DD-YYYY");
    USER_DATA_DEFAULT.endDate = moment(user.end_date).format("MM-DD-YYYY");
    this.openEditModal();
  }
  onDrop = (files) => {
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.setState({ imageContent: reader.result.split(',')[1], imageFileName: files[0].name})
    };
    // this.setState({
    //   files
    // });
  }
  showEditedSuccessfullyModal = () => {
    this.setState({ isEditedSuccessfullyModal: true });
    this.startTimer();
  }
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isEditedSuccessfullyModal: false });        
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);   
  }
  // submitEdit(){
  //   const {valid, fields} = this.props;
  //   if(valid) {
  //     const dataInput = {
  //       id: this.state.id,
  //       brand_name: fields.branchName,
  //       firstName: fields.firstName,
  //       start_date: moment(fields.startDate, "MM-DD-YYYY").format('x'),
  //       end_date: moment(fields.endDate, "MM-DD-YYYY").format('x'),
  //       lastName: fields.lastName,
  //       email: fields.email,
  //       mobile_number: fields.mobileNumber,
  //       entribe_rep: fields.entribeREP,
  //       password: fields.password,
  //       username: fields.userID,       
  //       comment: this.state.comment        
  //     }
  //     this.state.imageContent ? dataInput.logo = this.state.imageContent : '';
  //     this.state.imageFileName ? dataInput.logoName = this.state.imageFileName : '';
  //     this.props.editClient(dataInput, currentUser.token);
  //     this.setState({isClickEdit: true});
  //   }
  // }

  sortTable(n, dir) {
    let table, rows, switching, i, x, y, shouldSwitch, switchcount = 0;
    table = document.getElementById("clientTable");
    switching = true;
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName("TR");
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        let child1 = x.innerHTML;
        let child2 = y.innerHTML;
        if (dir === "asc") {
          if (n === 6 || n === 7) {
            if (new Date(child1.replace(/-/g,'/')) > new Date(child2.replace(/-/g,'/'))) {
              shouldSwitch= true;
              break;
            }
          } else if (child1.toLowerCase() > child2.toLowerCase()) {
            shouldSwitch= true;
            break;
          }
        } else if (dir === "desc") {
          if (n === 6 || n === 7) {
            if (new Date(child1.replace(/-/g,'/')) < new Date(child2.replace(/-/g,'/'))) {
              shouldSwitch= true;
              break;
            }
          } else if (child1.toLowerCase() < child2.toLowerCase()) {
            shouldSwitch= true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      }
    }
  }
  renderItemUser(user, data){
    return (
      <tr key={user.id} className="row brand_value" onClick={this.clicktoBranch.bind(this, user)}>
        <td className="col-client-4 text-center">{data + 1}</td>
        <td className="col-client-12 text-overflow"><span>{user.brand_name}</span></td>
        <td className="col-client-12 text-overflow">{user.firstName}</td>
        <td className="col-client-12 text-overflow">{user.lastName}</td>
        <td className="text-center col-client-12 text-overflow"><span>{user.email}</span></td>
        <td className="text-center col-client-12 text-overflow">{user.mobile_number}</td>
        <td className="text-center col-client-12 text-overflow">{moment(user.start_date).format("MM-DD-YYYY")}</td>
        <td className="text-center col-client-12 text-overflow">{moment(user.end_date).format("MM-DD-YYYY")}</td>
        {user.status === 'Active' &&
        <td className="col-client-12 text-center"><button type="button" className="btn btn-success btn-circle"/><p style={{ display: 'none'}}>{user.status}</p></td>
        }
        {user.status === 'Deactive' &&
        <td className="col-client-12 text-center"><button type="button" className="btn btn-success btn-circle btn-error2"><p style={{ display: 'none'}}>{user.status}</p></button></td>
        }
      </tr>
    );
  }

  render() {
    let { listClient, loadingUpload, searchList, searching, errorEdit, edited, valid, isExportClient, listSearch, successSearch } = this.props;

    let disableButtonStyle = {cursor:'default'};
    if(!valid) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    return (
        <div className="dashboard container-fluid" style={{ height: this.state.heightWindow + 'px', overflowY: 'hidden'}}>          

          <div ref="listClientPage" className="table-clientlist-admin">
        
              <div className="table-responsive">
                  <table className="table" id='clientTable'>
                    <thead>
                      <tr>
                          <th className="col-client-4 text-center">#</th>
                          <th className="col-client-12 item-sort">
                            <span>Brand Name</span>
                            <div className="sort-area">
                            <div className='triangle triangle-top' onClick={this.sortTable.bind(this, 1, 'asc')}/>
                            <div className='triangle triangle-bottom' onClick={this.sortTable.bind(this, 1, 'desc')}/>
                            </div>
                          </th>
                          <th className="col-client-12 item-sort">
                            <span>First Name</span>
                            <div className="sort-area">
                            <div className='triangle triangle-top' onClick={this.sortTable.bind(this, 2, 'asc')}/>
                            <div className='triangle triangle-bottom' onClick={this.sortTable.bind(this, 2, 'desc')}/>
                            </div>
                          </th>
                          <th className="col-client-12 item-sort">
                            <span>Last Name</span>
                            <div className="sort-area">
                            
                              <div className='triangle triangle-top' onClick={this.sortTable.bind(this, 3, 'asc')}/>
                              <div className='triangle triangle-bottom' onClick={this.sortTable.bind(this, 3, 'desc')}/>
                            </div>
                          </th>
                          <th className="col-client-12">Email</th>
                          <th className="col-client-12">Mobile</th>
                          <th className="col-client-12 item-sort">
                            <span>Start Date</span>
                            <div className="sort-area">
                            <div className='triangle triangle-top' onClick={this.sortTable.bind(this, 6, 'asc')}/>
                            <div className='triangle triangle-bottom' onClick={this.sortTable.bind(this, 6, 'desc')}/>
                            </div>
                          </th>
                          <th className="col-client-12 item-sort">
                          <span>End Date</span>
                            <div className="sort-area">
                            <div className='triangle triangle-top' onClick={this.sortTable.bind(this, 7, 'asc')}/>
                            <div className='triangle triangle-bottom' onClick={this.sortTable.bind(this, 7, 'desc')}/>
                            </div>
                          </th>
                          <th className="text-center col-client-12">Status</th>
                      </tr>
                    </thead>                   
                    <tbody style={{ height: this.state.heightWindow - 80 }}>
                    {searching && (searchList && searchList.length > 0) ? searchList.map(this.renderItemUser, this, ''): ''}
                    {searching&& !this.props.loadingUpload && (searchList && searchList.length == 0) ? <tr className="brand_value">
                        <td colSpan="9">We couldn't find anything for this key.</td>
                        </tr>: ''}
                    {!searching && (listClient && listClient.length > 0) ? listClient.map(this.renderItemUser, this, ''): ''}
                    {!searching && !this.props.loadingUpload &&(listClient && listClient.length === 0) ? <tr className="brand_value">
                        <td colSpan="9">No data</td></tr>: '' }
                    </tbody>                 
                  </table>
                  {this.props.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                }
              </div>
          </div>
      
            {/* <Modal
              isOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              onRequestClose={this.closeModal}
              shouldCloseOnOverlayClick={true}
              className={{
                base: 'custom_Modal',
                afterOpen: 'custom_after-open',
                beforeClose: 'custom_before-close'
              }}
              overlayClassName={{
                base: 'custom_Overlay',
                afterOpen: 'customOverlay_after-open',
                beforeClose: 'customOverlay_before-close'
              }}
              contentLabel="Example Modal"
              >
              <div className="text-center">
                <span className="edit-client">Edit Client</span>
              </div>
              <div className="icon-thick-delete-icon" onClick={this.closeModal}/>
              <div className="container-fluid">
                <form>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6 "><p>Brand Details</p>
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6"><p>Point of Contact</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="branchName" type="text"
                             label="Brand Name"
                             autoFocus = {true}
                             component={renderField}
                      />
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="firstName" type="text"
                             label="First Name"
                             component={renderField}
                      />
                    </div>

                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="userID" tfieldsype="text"
                             label="UserID"
                             component={renderField}
                             readOnly={true}
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
                      <Field name="password" type="password"
                             label="Password"
                             component={renderField}
                      />
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="mobileNumber" type="text"
                             label="Mobile Number"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field
                        name="startDate"
                        label='Start Date'
                        component={DatePickerCustom}/>
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="email" type="text"
                             label="Email"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field
                        name="endDate"
                        label='End Date'
                        component={DatePickerCustom}/>
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <Field name="entribeREP" type="text"
                             label="Entribe REP"
                             component={renderField}
                      />
                    </div>
                  </div>
                  <div className="row">
                  <div className="inputrow col-md-6 col-lg-6 col-sm-6 col-xs-6">
                          <Dropzone onDrop={(files) => this.onDrop(files)} className="inputImage">
                            <div className="iconUpload">
                              <span className="nameFile">{!this.state.imageFileName ? 'Upload Client logo' : this.state.imageFileName}</span>
                              <span className="chooseFile">Browse</span>
                            </div>
                          </Dropzone>
                        </div>
                  </div>
                  <div className="row">
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <p className="text-danger">{this.state.errorEdit}</p>
                    </div>
                    <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                      <span className="btn-create" style={disableButtonStyle} onClick={this.submitEdit.bind(this)}>Save</span>
                    </div>
                  </div>
                </form>
              </div>
            </Modal> */}
            <ModalModule 
            type={this.state.typeModal} 
            classModal={this.state.classModal} 
            openModal={this.state.modalIsOpen} 
            closeModal={this.closeModal} 
            clientID={this.state.id}
            comment={this.comment}
            typeSuccess='editClient' />
            {/* <Modal
          isOpen={this.state.isEditedSuccessfullyModal}         
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
                <span className='title-confirm-popup'>{"Client info has been updated"}</span>
              </div>
            </div>
          </form>
        </Modal> */}
        </div>
    )
  }
}

ClientList.PropTypes = {
  listClient: PropTypes.array,
  editClient: PropTypes.func,
  listSearch: PropTypes.array,
}

const selector = formValueSelector('clientEdit');
const mapStateToProps = (state) => {
  return {
    client: state.client,
    fields: selector(state, 'branchName', 'lastName', 'firstName', 'mobileNumber', 'userID', 'password', 'entribeREP', 'startDate', 'endDate', 'email'),
    initialValues: USER_DATA_DEFAULT
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    editClient: (data, token) => dispatch(ClientActions.editClient(data, token))
  }
};

ClientList = reduxForm({
  form: 'clientEdit',
  validate
})(ClientList);

export default connect(mapStateToProps, mapDispatchToProps)(ClientList);
