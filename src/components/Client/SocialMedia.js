import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import DashboardBody from './DashboardBody';
import './SocialMedia.scss';
import Modal from 'react-modal';
import moment from 'moment';
import * as ClientActions from '../../redux/actions/client';
import * as AuthActions from '../../redux/actions/auth';
import CollapseView from '../CollapseView/CollapseView';
import FacebookLogin from 'react-facebook-login';
import classNames from 'classnames';
import { getCurrentUser, getCurrentUserFacebook } from './../../utils/common';
import TwitterLogin from 'react-twitter-auth';
import {hostname, facebookAppID} from '../../config';

@connect(
  state => ({
    client: state.client,
    auth: state.auth
  }),
  ({ 
    getTwitter: (access_token, clientId) => AuthActions.getTwitter(access_token, clientId),
    logoutTwitter: (clientId) => ClientActions.logoutTwitter(clientId),
    getSocialMediaFacebook: (clientId, token, facebook_token) => ClientActions.getSocialMediaFacebook(clientId, token, facebook_token),
    setFacebookPages: (token, facebook_token, listPages) => ClientActions.setFacebookPages( token, facebook_token, listPages)
    }
  )
)
export default class SocialMedia extends Component {
  constructor(props){
    super(props);
    this.state = {
      expandedFB: false,
      listPageFacebook: [],
      userData: '',
      listPage: [],
      clickSave: false,
      expandedTT: false,
      twitterInfo: null,
      error: ''
    }
  }
  componentDidMount(){
    const { facebookName, facebookPhoto, facebookToken, token, clientId, twitterName, twitterPhoto } = getCurrentUser();
    if(facebookName && facebookPhoto && facebookToken){
      var userData = {name: facebookName, picture: facebookPhoto, token: facebookToken};
      this.setState({userData: userData});
      this.props.getSocialMediaFacebook(clientId, token, facebookToken);
    } 
    if(this.props.params.twitterLogged && !this.props.auth.login){
      this.props.getTwitter(token, clientId);
    }
    if(twitterName && twitterPhoto){
      var twitterInfo ={ username: twitterName, profileImage: twitterPhoto};
      this.setState({twitterInfo: twitterInfo,  expandedTT: true});
    }
  }
  componentWillReceiveProps(nextProps) {
    const { getSocialMedia: nextSocialMedia , socialMediaResult: nextMediaResult, listPage: nextListPage } = nextProps.client;
    const { getSocialMedia: thisSocialMedia } = this.props.client;
    const { auth } = this.props.auth;
    const { auth: nextAuth } = nextProps.auth;
    if (nextSocialMedia !== thisSocialMedia && nextMediaResult)
      {
        let listSelected = []
        nextMediaResult.map( data => data.selected ? listSelected.push(data) : '' );             
        this.setState({listPageFacebook: nextMediaResult,  expandedFB: true,  listSelected: listSelected});        
      }
    nextListPage && this.state.clickSave ? this.setState({ openModal : true}, this.startTimer) : ''; 
    if (this.props.params.twitterLogged) {
      let isLogged = this.props.auth.login !== nextProps.auth.login && nextProps.auth.loginInfo;
      if (isLogged)
        {
          let user = getCurrentUser();
          user.twitterName = nextProps.auth.loginInfo.username;
          user.twitterPhoto = nextProps.auth.loginInfo.profileImage;
          sessionStorage.setItem('currentUser',JSON.stringify(user))
          this.setState({twitterInfo: nextProps.auth.loginInfo, expandedTT: true});
      } 
    }
    if(nextProps.client.error) {
      let error = nextProps.client.error;
      error.includes('(code 190, subcode 467)') ? error = 'Current Facebook account has been logged out on facebook side, please logout and login again!': '';
      this.setState({error: error})
    } else {
      this.setState({error: ''});
    }
  }

  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ openModal: false, clickSave:false })        
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  responseFacebook = response => {
    const {clientId, token} = getCurrentUser();      
    if(response.accessToken && !response.error){      
      this.props.getSocialMediaFacebook(clientId, token, response.accessToken);     
      response.token = response.accessToken;  
      let currentUser = getCurrentUser();
      currentUser.facebookName = response.name;
      currentUser.facebookToken = response.token;
      currentUser.facebookPhoto = response.picture.data.url;
      sessionStorage.setItem("currentUser",JSON.stringify(currentUser));  
      this.setState({userData: response });     
    }
  }
  closeModal = () => {
    this.setState({openModal: false});
  }
  logOutFacebook = () => {    
    let currentUser = getCurrentUser();
    currentUser.facebookName = null;
    currentUser.facebookToken = null;
    currentUser.facebookPhoto = null;
    sessionStorage.setItem("currentUser",JSON.stringify(currentUser));
    this.setState({userData: '', error: ''});
    this.props.setFacebookPages(currentUser.token, null, []);
  }
  logOutTwitter = () => {    
    let currentUser = getCurrentUser();
    currentUser.twitterName = null;    
    currentUser.twitterPhoto = null;
    sessionStorage.setItem("currentUser",JSON.stringify(currentUser));
    this.setState({twitterInfo: null});
    this.props.logoutTwitter(currentUser.clientId); 
  }
  pageSelected = (value) => {
    this.setState({ listPage: value, listSelected: value })
  }
  handleSave = () => {
    const { token, clientId } = getCurrentUser();
    let listPages = [];   
    this.state.listSelected && this.state.listSelected.map( data => {
      let page = { name: data.name, pageId: data.pageId};
      listPages.push(page);
     })
    this.props.setFacebookPages(token, this.state.userData.token, listPages);    
    this.setState({clickSave: true})
    }  

loginTwitter = () =>{
  const { token, clientId } = getCurrentUser();
  const apiURI = hostname+'/api/social/twitter/'+clientId+'/signin?access_token='+token+'&redirectUri='+window.location.href.split('/logged')[0];
  window.open(apiURI,"_self");  
}
openFacebook = () => {
  this.setState({expandedFB: !this.state.expandedFB})
}
openTwitter = () => {
  this.setState({expandedTT: !this.state.expandedTT})
}
  render() {   
    const { token, clientId } = getCurrentUser();
    const { params: {shortName}, valid, pristine } = this.props;
    let fbData = this.state.userData; 
    const twitterInfo = this.state.twitterInfo;     
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName = {shortName} expanded={true} selected="settings/socialmedia"/>
          <NavHeaderClient title='' isShowedCreateChallenge={false}/>
          <div id="page-wrapper">           
              <div className="social-media" style={{height: window.innerHeight - 70 + 'px'}}>
                <div className="content">
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div className="social-area">
                        <div className="facebook">
                          {!fbData &&
                            <FacebookLogin
                            appId={facebookAppID}                           
                            ref="clickToLoginFB"
                            fields="name,email,first_name,last_name,picture"
                            cssClass="loginFB"
                            callback={this.responseFacebook}
                            icon="fa-facebook"
                            reAuthenticate={false}
                          />
                          }
                          {fbData &&
                            <button type="button" className="loginFB" onClick={this.logOutFacebook}> <i className="fa fa-facebook" aria-hidden="true"></i>Log out</button>
                          }                          
                        </div>
                        <div className="collapse-icon" onClick={ this.openFacebook }>
                          {
                            fbData && <i className={classNames('fa', { 'fa-arrow-left': !this.state.expandedFB, 'fa-arrow-down': this.state.expandedFB })} aria-hidden="true"></i>
                          }                        
                        </div>                                             
                      </div>
                      {
                        fbData && <CollapseView listSelected={this.state.listSelected} pageSelected={this.pageSelected} userData={fbData} expanded={this.state.expandedFB} listPageFacebook={this.state.listPageFacebook} />
                      }                      
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div className="social-area">
                        <div className="twitter">                        
                          {!twitterInfo && <button type="button" onClick={this.loginTwitter} className="loginTwitter"><i className="fa fa-twitter" aria-hidden="true"></i>Login with Twitter</button>}
                          {twitterInfo && <button type="button" className="loginTwitter" onClick={this.logOutTwitter}><i className="fa fa-twitter" aria-hidden="true"></i>Log out</button>}
                        </div>
                        <div className="collapse-icon" onClick={this.openTwitter }>
                          {
                            twitterInfo && <i className={classNames('fa', { 'fa-arrow-left': !this.state.expandedTT, 'fa-arrow-down': this.state.expandedTT })} aria-hidden="true"></i>
                          }                        
                        </div> 
                        </div>       
                      {twitterInfo && <CollapseView userData={twitterInfo} expanded={this.state.expandedTT}/>}                      
                    </div>
                      </div>
                    <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div className="save-area">
                        <div className="save">
                        <span className="btn btn-create" onClick={this.handleSave}>Save</span>
                        </div>                        
                      </div>
                    </div>                   
                  </div>          
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                      <div className="save-area">
                        <div className="error">
                        {this.state.error}
                        </div>                        
                      </div>
                    </div>                   
                  </div>                 
                </div>                
              </div>  
            
          </div>
        </div>
        <Modal
          isOpen={this.state.openModal}
          onRequestClose={this.closeModal}
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
          contentLabel="Added Successfully Modal"
        >

          <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>{"Settings saved!"}</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    );
  }
}
