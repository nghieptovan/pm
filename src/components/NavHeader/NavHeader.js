import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import '../NavHeader/NavHeader.scss';
import { ButtonToolbar, DropdownButton, NavDropdown, MenuItem } from 'react-bootstrap';
import logoImg from '../../assets/logo-notext.png';
import imgUser from '../../assets/images1.png';
import Workbook from 'react-excel-workbook';
import { CSVDownload, CSVLink } from 'react-csv';
import json2csv from 'json2csv';
import jsPDF from 'jspdf-autotable';
import * as ClientActions from '../../redux/actions/client';
import * as AdminActions from '../../redux/actions/admin';
import * as AuthActions from '../../redux/actions/auth';
import { getCurrentUser } from '../../utils/common';
import { Document, Page } from 'react-pdf';
import DatePickerCustomIcon from '../DatePickerCustom/DatePickerCustomIcon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dropzone from 'react-dropzone';
import Modal from 'react-modal';
import moment from 'moment';
import * as FileClientsActions from '../../redux/actions/fileclients';
import DatePickerComponent from '../DatePickerCustom/DatePickerComponent';
import '../DatePickerCustom/DatePickerCustomT02.scss';

@connect(
    state => ({
        client: state.client,
        auth: state.auth,
        admin: state.admin
    }),
    ({  exportClient: (token) => ClientActions.exportClient(token),
        exportExcelClient: (token) => ClientActions.exportExcelClient(token),
        exportCSVClient: (token) => ClientActions.exportCSVClient(token),
        logout: (token) => AuthActions.logout(token),
        exportChallenge: (token) => AdminActions.exportChallenge(token),
        exportTransaction: (clientId, token) => AdminActions.exportTransaction(clientId, token),
        exportRewardClient: (clientId, token, access_time) => FileClientsActions.exportRewardClient(clientId, token, access_time),
        importRewardClient: (clientId, dataInput, token, access_time) => FileClientsActions.importRewardClient(clientId, dataInput, token, access_time),
     }
    )
  )    

export default class NavHeader extends Component {
  constructor(props) {
    super(props);    
    this.state = ({
        inputSearch: '',
        openDropdown: false,
        openDropdownEx: false,
        clickToLogo: false,
        downloadCSV: false,
        isOpen: false,
        showLogout: false
    });
  }
  static propTypes = {
    openModal: PropTypes.func,
    searchClient: PropTypes.func,
    exportClient: PropTypes.func,
    exportCSVClient: PropTypes.func,
    exportExcelClient: PropTypes.func,
    disabled: PropTypes.bool,
    dropup: PropTypes.bool,
    group: PropTypes.bool,
    isOpen: PropTypes.bool,
    tag: PropTypes.string,
    tether: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    toggle: PropTypes.func,
    clickDatePicker: PropTypes.func,
  }
  componentWillMount() {    
    // const errorCode = sessionStorage.getItem('errorStatus');
    // if (errorCode == 201) {
    //     this.setState({showLogout: true});
    // }
    !getCurrentUser().token ? browserHistory.push('/admin') : '';
  }
  componentWillReceiveProps(nextProps) {
    const errorCode = sessionStorage.getItem('errorStatus');
    if (errorCode == 201) {
        this.setState({showLogout: true});
    }
    let nextClient = nextProps.client;
    let thisClient = this.props.client;
    const { auth } = this.props;
    const { auth: nextAuth } = nextProps;
    const { admin } = this.props;
    const { admin: nextAdmin } = nextProps;
    if(auth.logout != nextAuth.logout  && nextAuth.logoutMsg) {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('token');
        browserHistory.push("/admin");
    } else if (nextAuth.error){
        this.setState({error: nextAuth.error});
    }
    if(thisClient.exportStatus !== nextClient.exportStatus && this.props.title !== 'transaction' && this.props.title !== 'challenge' ){
        switch (nextClient.exportType || '') {
            case 'pdf':
            case 'xlsx':
            case 'csv': {
                //convert to save file from base64, code copy
                const byteCharacters = atob(nextClient.exportResult);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
                const fileName1 = `EnTribe_Client_List ${moment().format('MMDDYY hhmm')}.${nextClient.exportType}`;
                nextClient.exportStatus  === 2 ? this.saveAs(blob1, fileName1) : '';
                break;
            }      
            default: { 
              break;              
           } 
        }
    } 
    if (admin.export !== nextAdmin.export && nextAdmin.exportResult && this.props.title =='transaction'){
        const byteCharacters = atob(nextAdmin.exportResult);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
        const fileName1 = `EnTribe_${this.props.name}_Transaction_Report ${moment().format('MMDDYY hhmm')}.xlsx`;
        nextAdmin.export ? this.saveAs(blob1, fileName1) : '';
    }
     if (admin.export !== nextAdmin.export && nextAdmin.exportResult && this.props.title == 'challenge'){
        const byteCharacters = atob(nextAdmin.exportResult);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
        const fileName1 =`EnTribe_Challenges_Report ${moment().format('MMDDYY hhmm')}.xlsx`;
        nextAdmin.export ? this.saveAs(blob1, fileName1) : '';
    }    
  }
  actionExpire = () => {
    const { token } = getCurrentUser();
    sessionStorage.clear();
    localStorage.clear();
    this.props.logout(token);
    }
  saveAs = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;
    document.body.appendChild(anchorElem);
    anchorElem.click();
    document.body.removeChild(anchorElem);
    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
}
  ClickToCreate = (e) => {
    e.preventDefault();
    let name = this.refs.inputsearch;
    name.value = '';
    this.props.openModal();
  }
  ClickToExport = () => {
    this.props.exportClient();
  }  
 
  handleChange = (e) =>{
    let name = this.refs.inputsearch;
    this.setState({inputSearch: name.value});
  }
  handleSearch = (e) => {      
      if(this.props.title == 'challenge'){          
            let listSearch = this.props.listAll;          
            listSearch = listSearch.filter( data => {return data.brandName.toLowerCase().includes(this.state.inputSearch.toLowerCase())});
            this.props.handleSearchReport(listSearch);
      } else if (this.props.title == 'report'){
        this.props.searchClient(this.state.inputSearch);     
      } else if (this.props.title == 'reward'){       
        this.props.searchReward(this.state.inputSearch);
      } else if (this.props.title == 'clients') {
        this.props.searchClient(this.state.inputSearch);
      } else if (this.props.title == 'transaction') {
        this.props.searchClient(this.state.inputSearch);
      }
  }

  handleSearchByDate = (start, end) => {  
    this.props.handleFilterDate(start, end);
  }

  _handleKeyPress (e) {       
    if (e.key === 'Enter') {
        e.preventDefault();       
        this.handleSearch()
    }
}
  
   
    logout = (e) =>{
        e.preventDefault();
        const { token } = getCurrentUser();
        if (getCurrentUser()) {           
            this.props.logout(token);            
        }
    }
    openDropdownList = (e) =>{
        e.preventDefault();
        this.setState({openDropdown: true});
    }
    openDropdownExport = (e) =>{
        e.preventDefault();
        this.setState({openDropdownEx: true});
    }
    openSideBar = () => {
        let status = !this.state.clickToLogo;
        this.setState({clickToLogo: status});
        this.props.actionSideBar(status);
    }
    exportCSV = () => {
        this.setState({downloadCSV: true});
    }
    openCalendar = () => {
        this.setState({isOpen: !this.state.isOpen});
    }
    renderHTML = (data) => {
    return (
        <table>
        <thead>
                <tr>
                    <th>SI No</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th className="text-center">Username</th>
                    <th className="text-center">Mobile</th>
                    <th className="text-center">Email</th>
                    <th className="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
            {data && data.map(this.renderItemHTML, this, '')}
            </tbody>
        </table>
    )
  }
  renderItemHTML = (input) => {
    return (
        <tr key={input}>
        <td>{input + 1}</td>
        <td className="txt-oflo">{input.firstName}</td>
        <td className="txt-oflo">{input.lastName}</td>
        <td className="text-center">{input.username}</td>
        <td className="text-center txt-oflo">{input.mobile}</td>
        <td className="text-center"><span>{input.email}</span></td>
        <td className="text-center">{input.status}</td>
    </tr>
    );
  }
    exportExcelChallenge = () => {
        this.props.exportChallenge(getCurrentUser().token);
    }
    exportExcelTransaction = () => {
        this.props.exportTransaction(getCurrentUser().token, this.props.id);
    }
    exportPDF = () => {
        this.props.exportClient(getCurrentUser().token);
    }
    exportExcel = () => {
        this.props.exportExcelClient(getCurrentUser().token);
    }
    exportCSV = () => {
        this.props.exportCSVClient(getCurrentUser().token);
    }
    handleclickDatePicker = () => {
        const clickToicondate = this.refs.icondate;
        clickToicondate.onInputClick();      
    }
    importExcel=() =>{
        this.refs.fileUploader.click();
    }
    onDrop = (files, type) =>{
        this.props.onDrop(files, type);
    }

    handleChangePwd = () => {
        browserHistory.push("/admin/change-pwd");
    }
  exportExcel2 =() =>{
    const { token } = getCurrentUser();
    const clientId = this.props.id;
    const access_time = moment();
    this.props.exportRewardClient(clientId, token, access_time);
    }
  render() {
    let dropzoneRef;
    let { listClient, title } = this.props;
    const headers  = ['Brand Name', 'First Name', 'Last Name', 'Email', 'Mobile Number', 'Start Date', 'End Date', 'Status'] ;
    const fields = ['brand_name', 'firstName', 'lastName', 'email', 'mobile_number', 'start_date', 'end_date', 'status'];
    let result = json2csv({ data: listClient, fields: fields });
    
    return (
        <nav className="navbar navbar-default navbar-static-top m-b-0">
            <div className="headernav navbar-header">
                <div className="top-left-part">
                    <a onClick={() => this.openSideBar()} className={this.state.clickToLogo ? 'logo logoHeader marginLogo' : 'logo logoHeader closemarginLogo'}>                       
                        <img src={logoImg} style={{ height: '30px'}}  className="dark-logo"/>
                    </a>
                </div>
                <ul ref="HTMLtoPDF" className="nav navbar-top-links navbar-right pull-right">
                   {this.props.newTransaction && 
                    <li className="create-transaction" onClick={this.props.newTransaction}>
                        <span>NEW TRANSACTION</span>
                    </li>
                   }                   
                    <li>
                        <form role="search" className="app-search hidden-sm hidden-xs m-r-10">
                            <input type="text" ref="inputsearch" placeholder="Search..." className="form-control" 
                            onChange={() => this.handleChange()} onKeyPress={(e) => this._handleKeyPress(e)} /> 
                            <a onClick={() => this.handleSearch()}><i className="fa fa-search"></i></a> 
                        </form>
                    </li>
                    {
                        title === 'clients' &&
                    <li>
                        <DatePickerComponent searchCallendar={this.handleSearchByDate}/>
                    </li>
                    }             
                          { (title == 'clients') && 
                    <li><a><button className="btn btn-default btn-create" onClick={(event) => this.ClickToCreate(event)}>+ Create</button></a></li>
                    }
                    {title !== 'transaction' && title !== 'challenge' && title !== 'reward' &&                           
                    <li className="dropdown">   
                     <a><button className="btn btn-default btn-create">Export  <span className="caret"></span></button></a>                  
                      <ul className="dropdown-menu dropdown-menu-default dropdown-export">
                          <li>
                            <span onClick={() => this.exportExcel()}>EXCEL</span>                           
                          </li>
                          <li>
                            <span onClick={() => this.exportPDF()}>PDF</span></li>
                          <li>
                            <span onClick={() => this.exportCSV()}>CSV</span>
                          </li>
                      </ul>                   
                    </li>} 
                    {title == 'transaction' &&                   
                    <li className="dropdown">                   
                        <a><button className="btn btn-default btn-create" onClick={this.exportExcelTransaction}>Export</button></a> 
                    </li>    
                    }               
                    {title == 'reward' && <li className="dropdown">   
                    <a><button className="btn btn-default btn-create" onClick={() => this.exportExcel2()}>Export  <span className="caret1"></span></button></a>                  
                    </li>
                }  
                
                    {title == 'reward' &&   
                    <li className="dropdown">   
                        <Dropzone style={{ display: 'none'}} ref={(node) => { dropzoneRef = node; }} onDrop={(files) => this.onDrop(files)}/>
                            <a><button className="btn btn-default btn-create" onClick={() => { dropzoneRef.open() }}>Import  <span className="caret1"></span></button></a>                  
                        </li>
                        }
                        
                    {title == 'challenge' &&   
                    <li className="dropdown"> 
                        <a><button className="btn btn-default btn-create" onClick={this.exportExcelChallenge}>Export  </button></a>              
                    </li>             
                    }   
                    
                    {(getCurrentUser().firstName && getCurrentUser().lastName) && 
                    <li>
                        <a>{getCurrentUser().firstName + " " + (getCurrentUser().lastName.includes('ereviewer.') ? getCurrentUser().lastName.split('ereviewer.')[1] : getCurrentUser().lastName)}</a>
                    </li>
                    }                   
                    
                    <li className="dropdown">
                        <a className="profile-pic img-circle">
                            <button className="btn btn-circle btn-profile"><i className="icon-user"></i></button>                                
                        </a>
                        <ul className="dropdown-menu dropdown-menu-default nav-dropdown-menu">
                            <li>
                                <a href="#" onClick={this.handleChangePwd}>
                                    Change Password </a>
                            </li>
                            <li>
                                <a href="#" onClick={(event) => this.logout(event)}>
                                    Log Out </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>   
            <Modal
                    isOpen={this.state.showLogout}       
                    shouldCloseOnOverlayClick={false}
                    className={{
                        base: 'custom_Modal',
                        afterOpen: 'custom_after_token_expired',
                        beforeClose: 'custom_before-close'
                    }}
                    overlayClassName={{
                        base: 'custom_Overlay',
                        afterOpen: 'customOverlay_after-open',
                        beforeClose: 'customOverlay_before-close'
                    }}
                    contentLabel="Example Modal"
                    >
                    <div className="container-fluid">
                   
                    <form className='form-confirm'>
                    <div className="row">
                        <div className="col-md-12 col-lg-12 col-sm-12">
                            <span className='title-confirm-popup'>For your security you have been logged out due to inactivity, please login again.</span>
                            <span className='confirm-logout' onClick={this.actionExpire}>OK</span>
                        </div>
                    </div>
                    </form>
                </div>
          </Modal>         
                        
        </nav>       
    )
  }
}
