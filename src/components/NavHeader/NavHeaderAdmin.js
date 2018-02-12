import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import './NavHeader.scss';
import {connect} from 'react-redux';
import { getCurrentUser } from '../../utils/common';
import * as AuthActions from '../../redux/actions/auth';
import {ButtonToolbar, Dropdown, DropdownButton, MenuItem, NavDropdown} from 'react-bootstrap';
import logoImg from '../../assets/logo-notext.png';
import Modal from 'react-modal';
@connect(
    state => ({     
        auth: state.auth
    }),
    ({ 
        logout: (token) => AuthActions.logout(token)
     }
    )
  )    
export default class NavHeaderAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = ({
        clickToLogo: false,
        showLogout: false
    });
  }
  static PropTypes = {
    openModal: PropTypes.func,
  }
  componentWillReceiveProps(nextProps) {   
    const { auth } = this.props;
    const { auth: nextAuth } = nextProps;
    if(auth.logout != nextAuth.logout  && nextAuth.logoutMsg) {
        sessionStorage.removeItem('currentUser');
        browserHistory.push("/admin");
    } else if (nextAuth.error){
        this.setState({error: nextAuth.error});
    }
    }   
  
  componentWillMount() {
    const errorCode = sessionStorage.getItem('errorStatus');
    if (errorCode == 201) {
        this.setState({showLogout: true});
    }
    !getCurrentUser().token ? browserHistory.push('/client') : '';
  }
  actionExpire = () => {
        const { token } = getCurrentUser();
        sessionStorage.clear();
        localStorage.clear();
        this.props.logout(token);
    }

  ClickToCreate(){
      this.props.openModal();
  }
  logout(e){
    e.preventDefault();
    const { token } = getCurrentUser();
    let currentUser = sessionStorage.getItem('currentUser');
    if(currentUser !== undefined) {
    
      this.props.logout(token);
    }
  }
  openSideBar = () => {
    let status = !this.state.clickToLogo;
    this.setState({clickToLogo: status});
    this.props.actionSideBar(status);
}
    handleChangePwd = () =>{
        browserHistory.push('/admin/change-pwd')
    }
  render() {
    return (
        <nav className="navbar navbar-default navbar-static-top m-b-0">
            <div className="headernav navbar-header">
                <div className="top-left-part">
                    <a onClick={() => this.openSideBar()} className={this.state.clickToLogo ? 'logo logoHeader marginLogo' : 'logo logoHeader closemarginLogo'}>
                        <img src={logoImg} style={{ height: '30px'}}  className="dark-logo"/>
                    </a>
                </div>
                <ul className="nav navbar-top-links navbar-right pull-right">
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
                                        <a href="/admin/change-pwd" onClick={this.handleChangePwd}>
                                            Change Password
                                         </a>
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

