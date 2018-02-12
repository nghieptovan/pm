import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory, Link } from 'react-router';
import './NavHeader.scss';
import { ButtonToolbar, Dropdown, DropdownButton, MenuItem, NavDropdown } from 'react-bootstrap';
import logoImg from '../../assets/logo-notext.png';
import imgUser from '../../assets/images1.png';
import {connect} from 'react-redux';
import { getCurrentUser } from '../../utils/common';
import {s3URL} from '../../config';
import * as AuthActions from '../../redux/actions/auth';
import Modal from 'react-modal';
import ModalModule from '../ModalModule';
@connect(
    state => ({     
        auth: state.auth
    }),
    ({ 
        logout: (token) => AuthActions.logout(token)
     }
    )
  )
export default class NavHeaderCreator extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            clickToLogo: false,
            logoBranch: '',
            showLogout: false,
            openModal: false,
            typeModal: '',
            classModal: ''
        });
    }
    static propTypes = {
        createChallenge: PropTypes.func,
        openUploadModal: PropTypes.func,
        closeWithData: PropTypes.func,
    }
    componentWillReceiveProps(nextProps) {   
        const { auth } = this.props;
        const { auth: nextAuth } = nextProps;
        if(auth.logout != nextAuth.logout  && nextAuth.logoutMsg) {           
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('token');
            browserHistory.push("/");
        } else if (nextAuth.error){            
            this.setState({error: nextAuth.error});
        }
    }   
    componentWillMount() {
        // const errorCode = sessionStorage.getItem('errorStatus');
        // if (errorCode == 201) {
        //     this.setState({showLogout: true});
        // }
        // const {token, logo} = getCurrentUser();
        // !token ? browserHistory.push('/') : '';
        // logo ? this.setState({logoBranch: s3URL+logo}) : '';
    }
    componentDidMount() {
        const errorCode = sessionStorage.getItem('errorStatus');
        if (errorCode == 201) {
            this.tokenExpire();
        }
    }
    tokenExpire = () => {
        this.setState(prevState => ({
            openModal: !this.state.openModal,
            typeModal: 'ExpireToken',
            classModal: 'custom_after_token_expired'
        }));
    }
    logout = e => {
        e.preventDefault();
        const { token } = getCurrentUser();
        if(getCurrentUser()) {           
            this.props.logout(token); 
        }
    }
    openSideBar = () => {
        let status = !this.state.clickToLogo;
        this.setState({clickToLogo: status});
        this.props.actionSideBar(status);
    }
    goMyUploads = () => {
        browserHistory.push(`/myuploads`);
    }

    openUploadModal = () => {
        this.setState(prevState => ({
            openModal: !this.state.openModal,
            typeModal: 'Upload',
            classModal: 'custom_after-open-upload'
        }));
        // this.props.openUploadModal();
    }
    createChallenge = () => {
        this.props.createChallenge();
    }

    loginAction = () => {
        this.setState(prevState => ({
            openModal: !this.state.openModal,
            typeModal: 'Login',
            classModal: 'login-social-form'
        }));
    }
    closeModal = () => {
        this.setState({openModal: false});
    }
    render() {
        const { title, isShowedCreateChallenge, openUpload } = this.props;
        const { token } = getCurrentUser();
        return (
            <nav className="navbar navbar-static-top m-b-0 header-creator">
                <div className="headernav">
                    <div className="top-left-part">
                        <Link to={`/`}>
                            <img src={logoImg} style={{ height: '22px' }} className="dark-logo" />
                            <span>ENTRIBE</span>
                        </Link>
                    </div>
                    {token && <ul className="nav navbar-top-links navbar-right pull-right">
                        <li>
                            <button onClick={() => this.goMyUploads()}>My Uploads</button>
                        </li>
                        {openUpload && <li>
                            <a className="uploadIcon" onClick={() => this.openUploadModal()}><i className="icon-camera-plus-icon" aria-hidden="true"></i></a>
                        </li>}
                        
                        <li>
                            <a>{getCurrentUser().firstName + ' ' + getCurrentUser().lastName}</a>
                        </li>
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
                    </ul>}
                    {!token && <ul className="nav navbar-top-links navbar-right pull-right">
                        <li>
                            <a onClick={this.loginAction} className="login-creator">Login</a>
                        </li>
                        
                    </ul>}

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
                <ModalModule type={this.state.typeModal} classModal={this.state.classModal} openModal={this.state.openModal} closeModal={this.closeModal} />
            </nav>

        )
    }
}

