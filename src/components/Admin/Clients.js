import React, {Component, PropTypes} from 'react';
import './Clients.scss';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ClientActions from '../../redux/actions/client';
import Sidebar from '../Sidebar/Sidebar';
import ClientList from '../Admin/ClientList';
import NavHeader from '../NavHeader/NavHeader';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateClientForm} from  './../../utils/formValidation';
import {renderField} from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import {getCurrentUser} from "../../utils/common";
import Dropzone from 'react-dropzone';
import ModalModule from '../ModalModule';

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

export default class Clients extends Component {
  constructor(props){
    super(props);
    this.state = {
      listClient: [],
      listSearch: [],
      modalIsOpen: false,
      isAddedSuccessfullyModal: false,
      error: '',
      openSideBar: false,
      imageFileName: '',
      imageContent: '',
      searchList: [],
      searching: false,
      isFilterDate: false,
      typeModal: '',
      openModal: false    
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
      this.setState({loadingUpload: true});
    }
  }

  openModal = () => {  
    this.setState({openModal: true, typeModal: 'CreateClient', classModal: 'custom_after-open'});   
    // this.props.changeFieldValue('startDate', moment().format('MM-DD-YYYY'));
  };

  closeModal = () => {
    // this.setState({modalIsOpen: false, imageContent: '', imageFileName:'', contentError: ''});
    // this.props.reset();
    this.setState({openModal: false});
   
      // this.props.reset();
    //   this.props.closeWithData({
    //     className: 'customConfirm_after-open',
    //     timeOut: 1000,
    //     newModalClass: '',
    //     newModal: false  
    // });
  
};  
componentWillReceiveProps(nextProps){
  this.props.client.loadingIcon != nextProps.client.loadingIcon && nextProps.client.loadingIcon ==1 ? this.setState({loadingUpload: true}):'';
  this.props.client.loadingIcon != nextProps.client.loadingIcon && nextProps.client.loadingIcon !=1 ? this.setState({loadingUpload: false}):'';
}
  searchClient = (input) => {
    const { listClient } = this.props.client;    
        if(input.length > 0){               
          let listBrand = listClient.filter(data => data.brand_name.toLowerCase().includes(input.toLowerCase()));
          let listFirstName = listClient.filter(data => data.firstName.toLowerCase().includes(input.toLowerCase()));
          let listLastName = listClient.filter(data => data.lastName.toLowerCase().includes(input.toLowerCase()));
          let listEmail = listClient.filter(data => data.email.toLowerCase().includes(input.toLowerCase()));
          let listMobile = listClient.filter(data => data.mobile_number.toLowerCase().includes(input.toLowerCase()));
          let listStartDate = listClient.filter(data => moment(data.start_date).format("MM-DD-YYYY").includes(input.toLowerCase()));
          let listEndDate = listClient.filter(data => moment(data.end_date).format("MM-DD-YYYY").includes(input.toLowerCase()));         
          let searchList = _.union(listBrand, listFirstName, listLastName, listEmail, listMobile, listStartDate, listEndDate);
          this.setState({searchList, searching: true});
        }else{
          this.setState({searchList: [], searching: false});
        }
  }

  exportClient = () => {
    this.setState({isExportClient: true});
  }

  actionSideBar = (input) => {
    this.setState({openSideBar: input});
  }

  filterDate = (start, end) => {
    this.setState({isFilterDate: true})
    let list = this.props.client.listClient;
    let startDate = new Date(start);
    let endDate = new Date(end);
    startDate = startDate.getTime();
    endDate = endDate.getTime();
    list = list.filter( data => {
      return (
        !(data.start_date < startDate && data.end_date < startDate) &&
        !(data.start_date > endDate && data.end_date > endDate)
      );
    });
    this.setState({ listClient: list });
  }
  
  render() {
    const { client, valid, pristine } = this.props;
    
    return (
      <div id="container">
      <div id="wrapper">
        <Sidebar openSideBar={this.state.openSideBar} selected="clients" />
        <NavHeader title="clients" handleFilterDate={(start, end) => this.filterDate(start, end)} listClient={client.listClient} openModal={this.openModal} searchClient={(input) => this.searchClient(input)}
          exportClient={() => this.exportClient()} actionSideBar={(input) => this.actionSideBar(input)} />
        <div id="page-wrapper">
        <ClientList loadingUpload={this.state.loadingUpload} listClient={ this.state.isFilterDate ? this.state.listClient : client.listClient} searchList={this.state.searchList} searching={this.state.searching} successSearch={client.successSearch} isExportClient={this.state.isExportClient}/>
        
        <ModalModule 
        type={this.state.typeModal} 
        classModal={this.state.classModal} 
        openModal={this.state.openModal} 
        closeModal={this.closeModal}
        typeSuccess='createClient' />
        </div>
      </div >
    </div>
    );
  }
}

Clients = reduxForm({
  form: 'clientCreate',
  validate
})(Clients);
