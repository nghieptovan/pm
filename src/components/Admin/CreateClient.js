import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ClientActions from '../../redux/actions/client';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateClientForm} from  './../../utils/formValidation';
import {renderField} from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import {getCurrentUser} from "../../utils/common";
import Dropzone from 'react-dropzone';
import ReactLoading from 'react-loading';

const validate = values => {
  return validateClientForm(values);
};

const selector = formValueSelector('clientCreate');
@connect(
  state => ({
    client: state.client,
    fields: selector(state, 'branchName', 'lastName', 'firstName', 'mobileNumber', 'userID', 'password', 'entribeREP', 'startDate', 'endDate', 'email')
  }),
  ({  getList: token => ClientActions.getList(token),
    createClient: (data, token) => ClientActions.createClient(data, token),
    searchClient: (data, token) => ClientActions.searchClient(data, token),
    changeFieldValue: (field, value) => change('clientCreate', field, value),}
  )
)

export default class CreateClient extends Component {
  constructor(props){
    super(props);
    this.state = {     
        isCreateClient: true,
        loading: false
    }
  }
  static propTypes = { 
      
  };
  
  componentWillReceiveProps(nextProps) {
    const { client } = this.props;
    const { client : nextClient } = nextProps;

    if(client.loadingCreateClient != nextClient.loadingCreateClient && nextClient.loadingCreateClient == 1){
        this.setState({loading: true});
    }else if(client.loadingCreateClient != nextClient.loadingCreateClient && nextClient.loadingCreateClient == 2){
        this.setState({loading: false});
        this.closeModal();
    }else if(client.loadingCreateClient != nextClient.loadingCreateClient && nextClient.loadingCreateClient == 3){
        this.setState({loading: false, error: nextClient.error}); 

    }
  }

  onDrop = (files) => {
    const fileType = files[0].type.split('/')[0];
    if(fileType === 'image'){
      this.setState({ contentError: '' });
      let reader = new FileReader();
      reader.readAsDataURL(files[0]);
      
      reader.onload = () => {
        const imageFileName = files[0].name;
        this.setState({ imageContent: reader.result.split(',')[1], imageFileName })
      };
    }else{
      this.setState({ contentError: 'Please upload image file.' });
    } 

  }

  createClient(event){
    event.preventDefault();
    if(this.props.valid) {
      let { fields } = this.props;
      const dataInput = {        
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
        imageFileName: this.state.imageFileName,
        imageContent: this.state.imageContent
      }
      this.props.createClient(dataInput, getCurrentUser().token);
    }
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
    const { client, valid, pristine} = this.props;
    let disableButtonStyle = {cursor:'pointer'};
    if(!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    } 
    return (
  

        <div>
            <div className="text-center">
                <span className="edit-client">Create Client</span>
            </div>
            <div className="icon-thick-delete-icon" onClick={this.props.closeModal}/>
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
                            <Field name="userID" type="text"
                                label="UserID"
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
                                <span className="nameFile">{this.state.imageFileName === '' ? 'Upload Client logo' : this.state.imageFileName}</span>
                                <span className="chooseFile">Browse</span>
                            </div>
                            </Dropzone>
                            <p className="text-danger">{this.state.contentError}</p>  
                        </div>
                    </div>
                    <div className="row">
                        <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                            <p className="text-danger">{this.state.error}</p>
                        </div>
                        <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                            <span className="btn-create" style={disableButtonStyle} onClick={this.createClient.bind(this)}>Create</span>
                        </div>
                    </div>
                </form>
            </div>         
        </div>
        
     
    );
  }
}

CreateClient = reduxForm({
  form: 'clientCreate',
  validate
})(CreateClient);
