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

export default class AddClientSuccessful extends Component {
  constructor(props){
    super(props);
    this.state = {     
        
    }
  }
  static propTypes = { 
      
  }; 
  
  
  render() {   
    return (
        <form className='form-confirm'>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12 icon">
              <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-check" aria-hidden="true"></i></button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12">
              <span className='title-confirm-popup'>{"New client has been added"}</span>
            </div>
          </div>
        </form>    
    );
  }
}

AddClientSuccessful = reduxForm({
  form: 'AddClientSuccessful',
  validate
})(AddClientSuccessful);
