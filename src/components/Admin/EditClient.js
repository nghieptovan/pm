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
import ReactLoading from 'react-loading';


const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

const validate = values => {
  return validateClientForm(values, true);
};

class EditClient extends Component {
  constructor(props) {
    super(props);
    this.state = {
        errorEdit: '',
        imageFileName:null,
        imageContent: null,
        isClickEdit: false,
        loading: false
    }
  }
  componentWillReceiveProps(nextProps) {
    const { client } = this.props;
    const { client : nextClient } = nextProps;

    if(client.loadingEditClient != nextClient.loadingEditClient && nextClient.loadingEditClient == 1){
        this.setState({loading: true});
    }else if(client.loadingEditClient != nextClient.loadingEditClient && nextClient.loadingEditClient == 2){
        this.setState({loading: false});
        this.closeModal();
    }else if(client.loadingEditClient != nextClient.loadingEditClient && nextClient.loadingEditClient == 3){
        this.setState({loading: false, error: nextClient.error}); 
    }
  }
  submitEdit(){
    const {valid, fields, clientID, comment } = this.props;
    if(valid) {
      const dataInput = {
        id: clientID,
        brand_name: fields.branchName,
        firstName: fields.firstName,
        start_date: moment(fields.startDate, "MM-DD-YYYY").format('x'),
        end_date: moment(fields.endDate, "MM-DD-YYYY").format('x'),
        lastName: fields.lastName,
        email: fields.email,
        mobile_number: fields.mobileNumber,
        entribe_rep: fields.entribeREP,
        password: fields.password,
        username: fields.userID,       
        comment: comment        
      }
      this.state.imageContent ? dataInput.logo = this.state.imageContent : '';
      this.state.imageFileName ? dataInput.logoName = this.state.imageFileName : '';
      this.props.editClient(dataInput, currentUser.token);
      this.setState({isClickEdit: true});
    }
  }
  onDrop = (files) => {
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.setState({ imageContent: reader.result.split(',')[1], imageFileName: files[0].name})
    };
  }

  closeModal = () => {
    this.props.reset();
    this.props.closeWithData({
        className: 'custom_after-open-upload-creator-success',
        timeOut: 0,
        newModalClass: 'customConfirm_after-open',
        newModal: true,
        newModalType: 'SuccessModal'  
    }) 
}

  render() {
    let { closeModal, listClient, searchList, searching, errorEdit, edited, valid, isExportClient, listSearch, successSearch } = this.props;

    let disableButtonStyle = {cursor:'default'};
    if(!valid) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    return (
        <div>            
            <div className="text-center">
            <span className="edit-client">Edit Client</span>
            </div>
            <div className="icon-thick-delete-icon" onClick={closeModal}/>
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
        </div>
    )
  }
}

EditClient.PropTypes = {
    // listClient: PropTypes.array,
    editClient: PropTypes.func,
    // listSearch: PropTypes.array,
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

EditClient = reduxForm({
  form: 'clientEdit',
  validate
})(EditClient);

export default connect(mapStateToProps, mapDispatchToProps)(EditClient);
