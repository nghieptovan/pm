import React, {Component, PropTypes} from 'react';
import './Clients.scss';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ClientActions from '../../redux/actions/client';
import * as AdminActions from '../../redux/actions/admin';
import Sidebar from '../Sidebar/Sidebar';
import ReportList from './ReportList';
import NavHeader from '../NavHeader/NavHeader';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateClientForm} from  './../../utils/formValidation';
import {renderField} from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import {getCurrentUser} from "../../utils/common";

const validate = values => {
  return validateClientForm(values);
};

const selector = formValueSelector('clientCreate');
@connect(
  state => ({
    client: state.client,
    admin: state.admin,
    branchName: selector(state, 'branchName'),
    lastName: selector(state, 'lastName'),
    firstName: selector(state, 'firstName'),
    mobileNumber: selector(state, 'mobileNumber'),
    userID: selector(state, 'userID'),
    password: selector(state, 'password'),
    entribeREP: selector(state, 'entribeREP'),
    startDate: selector(state, 'startDate'),
    endDate: selector(state, 'endDate'),
    email:  selector(state, 'email')
  }),
  ({  getList: token => ClientActions.getList(token),
    createClient: (data, token) => ClientActions.createClient(data, token),
    searchClient: (data, token) => ClientActions.searchClient(data, token),
    changeFieldValue: (field, value) => change('clientCreate', field, value),
    getChallengesReport: (token) => AdminActions.getChallengesReport(token)}
  )
)

export default class Report extends Component {
  constructor(props){
    super(props);
    this.state = {
      listClient: [],
      listSearch: [],
      reportList: [],
      modalIsOpen: false,
      error: '',
      openSideBar: false,   
    }
  }

  static propTypes = { client: PropTypes.object,
    getList: PropTypes.func,
    createClient: PropTypes.func,
    searchClient: PropTypes.func,
    router: React.PropTypes.object
  };

  componentWillMount(){
    if(getCurrentUser() === null){
      browserHistory.push('/admin');
    }else{
      this.props.getList(getCurrentUser().token);
    }
  }

  openModal = () => {
    this.setState({modalIsOpen: true, error: ''});
    this.props.change('clientCreate', 'branchName', '');
    this.props.changeFieldValue('startDate', moment().format('MM-DD-YYYY'));
  };

  afterOpenModal = () => {
    this.setState({error: ''});
  };
  componentDidMount(){
    const { token } = getCurrentUser();
    this.props.getChallengesReport(token);        
    this.setState({loadingUpload: true});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
  }
  componentWillReceiveProps(nextProps) {
    let client = nextProps.client;
    this.props.client.created !== client.created && client.createdClient !== null ? this.closeModal() : this.setState({error: client.error});
    this.props.admin.getReport !== nextProps.admin.getReport && nextProps.admin.reportList ?  this.setState({reportList: nextProps.admin.reportList, listAll: nextProps.admin.reportList})
    : '';
    this.props.admin.loadingIcon !== nextProps.admin.loadingIcon && nextProps.admin.loadingIcon == 1  ? this.setState({loadingUpload: true}): '';
    this.props.admin.loadingIcon !== nextProps.admin.loadingIcon && nextProps.admin.loadingIcon != 1  ? this.setState({loadingUpload: false}): '';
    nextProps.admin.error ? this.setState({error: nextProps.admin.error}) : this.setState({error: ''});
  }

  closeModal = () => {
    this.setState({modalIsOpen: false});
    this.props.reset('clientCreate');
  };

  createClient(event){
    event.preventDefault();
    if(this.props.valid) {
      let { branchName, lastName, firstName, mobileNumber, userID, email, password, entribeREP, startDate, endDate} = this.props;
      let dataClient = {
        brand_name: branchName,
        firstName: firstName,
        start_date: moment(startDate, "MM-DD-YYYY").format('x'),
        end_date: moment(endDate, "MM-DD-YYYY").format('x'),
        lastName: lastName,
        email: email,
        mobile_number: mobileNumber,
        entribe_rep: entribeREP,
        password: password,
        username: userID
      }
      this.props.createClient(dataClient, getCurrentUser().token);
    }
  }

  searchClient = (input) => {
    this.props.searchClient(input, getCurrentUser().token)
  }

  exportClient = () => {
    this.setState({isExportClient: true});
  }

  actionSideBar = (input) => {
    this.setState({openSideBar: input});
  }
  handleSearch = (data) =>{
    this.setState({reportList: data});
  }
  render() {
    const { client, valid, pristine } = this.props;
    let disableButtonStyle = {cursor:'pointer'};
    if(!valid || pristine) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }   
  
    return (
      <div id="container">
      <div id="wrapper">
        {/* <Sidebar openSideBar={this.state.openSideBar} selected="parent---report"/> */}
        <Sidebar openSideBar={this.state.openSideBar} expanded={true} selected="report/reviewers"/>
        <NavHeader listAll={this.state.listAll} handleSearchReport={ data => this.handleSearch(data)} report={true} title="challenge" listClient={client.listClient} searchClient={(input) => this.searchClient(input)}
          exportClient={() => this.exportClient()} actionSideBar={(input) => this.actionSideBar(input)} />
        <div id="page-wrapper">
        <ReportList loadingUpload={this.state.loadingUpload} listClient={client.listClient} listSearch={client.listSearch} successSearch={client.successSearch} isExportClient={this.state.isExportClient} reportList={this.state.reportList}/>
        </div>
      </div >
      <Modal
        isOpen={this.state.modalIsOpen}
        onAfterOpen={this.afterOpenModal}
        onRequestClose={this.closeModal}
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
          <span className="edit-client">Create Client</span>
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
            <div className="inputrow col-md-6 col-lg-6 col-sm-6">
              <p className="text-danger">{this.state.error}</p>
              </div>
              <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                <span className="btn-create" style={disableButtonStyle} onClick={this.createClient.bind(this)}>Create</span>
              </div>
              </div>
          </form>
        </div>
      </Modal>
    </div>
    );
  }
}

Report = reduxForm({
  form: 'clientCreate',
  validate
})(Report);
