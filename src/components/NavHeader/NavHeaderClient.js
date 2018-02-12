import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import './NavHeader.scss';
import { ButtonToolbar, Dropdown, DropdownButton, MenuItem, NavDropdown } from 'react-bootstrap';
import logoImg from '../../assets/logo-notext.png';
import imgUser from '../../assets/images1.png';
import { getCurrentUser } from '../../utils/common';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import { connect } from 'react-redux';
import DropdownList from 'react-widgets/lib/DropdownList';
import {s3URL} from '../../config';
import * as FileClientsActions from '../../redux/actions/fileclients';
import * as AuthActions from '../../redux/actions/auth';
import moment from 'moment';
import Dropzone from 'react-dropzone';
import Modal from 'react-modal';

const selector = formValueSelector('navHeaderClient');

@connect(
    state => ({
        challenge: state.challenge,
        challengeSelect: selector(state, 'challenge'),
        fileclients: state.fileclients,
        auth: state.auth
    }),
    ({
        exportExcelClient: (clientId, token, access_time) => FileClientsActions.exportRewardClient(clientId, token, access_time),
        importRewardClient: (clientId, dataInput, token, access_time) => FileClientsActions.importRewardClient(clientId, dataInput, token, access_time),
        changeStatusChallenge: (id, status, token, access_time) => ChallengeActions.changeStatusChallenge(id, status, token, access_time),
        logout: (token) => AuthActions.logout(token)        
    }
    )
)
export default class NavHeaderClient extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            clickToLogo: false,
            logoBranch: '',
            contentError: '',
            valueSearch: '',
            showLogout: false
        });
    }
    static propTypes = {
        createChallenge: PropTypes.func,
        searchReward: PropTypes.func,
    }
    componentWillReceiveProps(nextProps) {
        const errorCode = sessionStorage.getItem('errorStatus');
        if (errorCode == 201) {
            this.setState({showLogout: true});
        }
        const { auth } = this.props;
        const { auth: nextAuth } = nextProps;
        if(auth.logout != nextAuth.logout  && nextAuth.logoutMsg) {
            sessionStorage.clear();
            localStorage.clear();
            browserHistory.push("/client");
        } else if (nextAuth.error){
            this.setState({error: nextAuth.error});
        }        
        nextProps.challengeSelect !== this.props.challengeSelect ? this.props.handleSelect(nextProps.challengeSelect.id) : '';
    }

    componentWillMount() {
        // const errorCode = sessionStorage.getItem('errorStatus');
        // if (errorCode == 201) {
        //     this.setState({showLogout: true});
        // }
        const { token, logo } = getCurrentUser();
        !token ? browserHistory.push('/client') : '';
        logo ? this.setState({ logoBranch: s3URL+logo }) : '';        
    }

    actionExpire = () => {
        const { token } = getCurrentUser();
        sessionStorage.clear();
        localStorage.clear();
        this.props.logout(token);
    }
    
    logout = e => {
        e.preventDefault();
        const { token } = getCurrentUser();
        if (getCurrentUser()) {        
            this.props.logout(token);
        }
    }
    openSideBar = () => {
        let status = !this.state.clickToLogo;
        this.setState({ clickToLogo: status });
        this.props.actionSideBar(status);
    }
    createChallenge = () => {
        this.props.createChallenge();
    }
    render() {
        this.setState({ clickToLogo: status });
        this.props.actionSideBar(status);
    }
    importExcel(){
        this.refs.fileUploader.click();
    }
    exportExcel(){
        const { clientId, token } = getCurrentUser();
        const access_time = moment();
        this.props.exportExcelClient(clientId, token, access_time);
    }
    onDrop = (files, type) =>{
        this.props.onDrop(files, type);
    }
    handleChange = (e) =>{
        let name = this.refs.inputsearch;
        this.setState({valueSearch: name.value});
    }
    handleSearch = (e) => {
        this.props.searchReward(this.state.valueSearch);
    }
    _handleKeyPress = (e) => {    
        if (e.key === 'Enter') {
            this.props.searchReward(this.state.valueSearch);
            e.preventDefault();
        }
    }
    render() {
        let dropzoneRef;
        const { title, isShowedCreateChallenge, isShowedSelectChallenge, listChallenges, currentChallenge, showSearch } = this.props;
        return (
            <nav className="navbar navbar-default navbar-static-top m-b-0">
                <div className="headernav navbar-header">
                    <div className="top-left-part">
                        <a onClick={() => this.openSideBar()} className={this.state.clickToLogo ? 'logo logoHeader marginLogo' : 'logo logoHeader closemarginLogo'}>
                            <img src={logoImg} style={{ height: '30px' }} className="dark-logo" />
                        </a>
                    </div>
                    <ul className="nav navbar-top-links navbar-right pull-right">                       
                        <li className="title-admin">
                            <span>{title}</span>
                        </li>
                        {isShowedCreateChallenge &&
                            <li className="title-client" onClick={this.createChallenge}>
                                <span>+ Create Challenge</span>
                            </li>
                        }
                        {showSearch && <li>
                            <form role="search" className="app-search hidden-sm hidden-xs m-r-10">
                                <input type="text" ref="inputsearch" placeholder="Search..." className="form-control" 
                                onChange={() => this.handleChange()} onKeyPress={(e) => this._handleKeyPress(e)} /> 
                                <a onClick={() => this.handleSearch()}><i className="fa fa-search"></i></a> 
                            </form>
                        </li>}
                        
                        {showSearch && <li className="dropdown">   
                        <Dropzone style={{ display: 'none'}} ref={(node) => { dropzoneRef = node; }} onDrop={(files) => this.onDrop(files)}/>
                            <a><button className="btn btn-default btn-create" onClick={() => { dropzoneRef.open() }}>Import  <span className="caret1"></span></button></a>                  
                        </li>
                        }
                        {showSearch && <li className="dropdown">   
                            <a><button className="btn btn-default btn-create" onClick={() => this.exportExcel()}>Export  <span className="caret1"></span></button></a>                  
                            {/* <ul className="dropdown-menu dropdown-menu-default dropdown-export">
                                <li>
                                    <span onClick={() => this.exportExcel()}>EXCEL</span>                           
                                </li>
                                <li>
                                    <span onClick={() => this.exportPDF(listClient)}>PDF</span></li>
                                <li>
                                    <span onClick={() => this.exportCSV()}>CSV</span>
                                </li>
                            </ul>                    */}
                        </li>
                        }
                        {listChallenges &&
                            <li className="title-client dropdown-challenge">
                                {listChallenges.length >0 &&
                                <div className="dropdown-list">
                                    <DropdownList
                                        name="challenge"
                                        component={renderDropdownList}
                                        data={listChallenges}
                                        defaultValue={currentChallenge}
                                        valueField="id"
                                        textField="name" 
                                        onChange={this.props.handleSelect}/>
                                </div>
                                }
                            </li>
                        }
                        {
                            this.state.logoBranch && <li>
                                <a>
                                    <img src={this.state.logoBranch} height="36" />
                                </a>
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
                                    <a href="#" onClick={this.logout}>
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

