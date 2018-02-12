import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import './index.scss';
import logoImg from '../../assets/logologin.png';
import {renderField, renderMaterialField, renderFieldAsync, renderFieldWidget} from "../ReduxField";
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateWidgetForm } from './../../utils/formValidation';
import asyncValidate from './../../utils/asyncValidate';
import { getCurrentUser } from './../../utils/common';
import { connect } from 'react-redux';
import * as WidgetActions from '../../redux/actions/widget';
import * as ChallengeActions from '../../redux/actions/challenge';
import Dropzone from 'react-dropzone';
import moment from 'moment';
import Modal from 'react-modal';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { TagBox } from 'react-tag-box';
import classNames from 'classnames';
import ReactLoading from 'react-loading';
import _ from 'lodash';
import {hostname} from '../../config';
import {s3URL} from '../../config';
const validate = values => {
  return validateWidgetForm(values, false);
};

const selector = formValueSelector('widget');
@connect(
  state => ({
    widget: state.widget,
    challenge: state.challenge,
    form: state.form,
    fields: selector(state, 'firstName', 'description', 'lastName', 'email', 'hashTags')
  }),
  ({
    upload: (access_time, data) => WidgetActions.uploadWidget(access_time, data),
    changeFieldValue: (field, value) => change('widget', field, value),
    checkEmail: (data) => WidgetActions.checkEmail(data),
    getChallenge: (id) => ChallengeActions.getChallengeForWidget(id)
  }
  )
)
export default class Widget extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      imageFileName: '',
      imageContent: null,
      openModal: false,
      tags: [],
      hashTags: '',   
      location: '',
      hideError: false,
      readOnly: false,
      currentEmail: '',
      emailError: '',
      clickUpload: true,
      emptyContent: true,
      emptyContentError: '',
      isSetEmail: false,
      existEmail: false,
      trustEmail: false,
      hashtagsArray: [],
      chl: null
    });
  }
  componentWillReceiveProps(nextProps) {
    const { widget, fields, form, challenge } = this.props;
    const { widget: nextWidget, form: nextForm, challenge: nextChallenge } = nextProps;
    (nextWidget.uploadStatus != widget.uploadStatus && nextWidget.uploadStatus == 1) ? this.setState({ loadingUpload: true }): '';
    if(widget.uploadStatus !== nextWidget.uploadStatus && nextWidget.uploadStatus == 2 && nextWidget.uploadData){
      this.props.reset();
      this.refs.agree.checked = false;
      this.setState({ loadingUpload: false,openModal: true, tags: [], readOnly: false, clickUpload: true });
      this.startTimer();
    }
    if(widget.uploadStatus !== nextWidget.uploadStatus && nextWidget.uploadStatus == 3 && nextWidget.error){
      this.setState({loadingUpload: false});
    }

    (widget.checkEmailStatus !== nextWidget.checkEmailStatus && nextWidget.checkEmailStatus == 1) ? this.setState({ loadingUpload: true }): '';
    if(widget.checkEmailStatus !== nextWidget.checkEmailStatus && nextWidget.checkEmailStatus == 2){
      this.setState({hideError: true, readOnly: true, loadingUpload: false, existEmail: true, trustEmail: true});
      nextWidget.checkEmail.firstName ? this.props.changeFieldValue('firstName', nextWidget.checkEmail.firstName): '';
      nextWidget.checkEmail.lastName ? this.props.changeFieldValue('lastName', nextWidget.checkEmail.lastName) : '';
    } 
    if(widget.checkEmailStatus !== nextWidget.checkEmailStatus && nextWidget.checkEmailStatus == 3){
      if(this.state.trustEmail){
        this.props.changeFieldValue('firstName', '');
        this.props.changeFieldValue('lastName', '');
        this.setState({trustEmail: false});
      }
      this.setState({hideError: false, readOnly: false, loadingUpload: false, existEmail: false});
    }   
    (form.widget.active != nextForm.widget.active &&  nextForm.widget.active == 'firstName') ? this.handleMouseOut(): '';
    if(challenge.getChallengeLoad != nextChallenge.getChallengeLoad && nextChallenge.challengeById){
      this.setState({chl: nextChallenge.challengeById, hashtagsArray: nextChallenge.challengeById.hashtags.split('==='), loadingUpload: false});

    } if (challenge.getChallengeLoad != nextChallenge.getChallengeLoad && nextChallenge.error){
      this.setState({error: nextChallenge.error, loadingUpload: false});
    } 
  }
  componentWillMount(){    
    let id = this.props.location.query.challengeId;
    this.props.getChallenge(id);
    this.setState({loadingUpload: true});
  }
  closeModal = () => {
    this.props.reset();
    this.refs.agree.checked = false;
    this.refs.email.value = '';
    this.setState({openModal: false, imageFileName: '', imageContent: null, currentEmail: '', trustEmail: false, errorTags: '', errorTag: '', valueHashtag: ''});
  }   
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.closeModal();
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  getLocation = () => {
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "http://ip-api.com/json", true);
      xhr.onload = () => {
          var result = JSON.parse(xhr.response);    
          this.setState({location: result})                                           
          resolve(xhr.responseText);
      }
      xhr.onerror = () => {         
          reject(xhr.statusText);
      } 
      xhr.send();
  });                             
  }
  onDrop = (files, type) => {
    const fileType = files[0].type.split('/')[0];
    const fileSplit = files[0].name.split('.');
    const fileExtension = fileSplit[fileSplit.length - 1];    
    this.getLocation();
    if (fileType === 'video' || fileType === 'image') {
      let name = files[0].name;
      if(name.length > 200){
        name = name.substr(0,name.length/2);
        name += "."+fileExtension;
      }
        this.setState({ imageContent: files[0],contentError: '', imageFileName: name, typeContent: fileType, emptyContent: false })
    } else {
      this.setState({ contentError: 'Please upload video or image.' });
    }
  }

  handleUpload = (e) => {
    e.preventDefault();
    const { challengeId, clientId } = this.props.location.query;
    if (this.props.valid) {
      const { fields } = this.props;
      const { challengeId, clientId } = this.props.location.query;
      let location = this.state.location;
      location = location.regionName+"-"+location.countryCode +"-"+(location.region  && location.region.length > 0? location.region : location.countryCode);
      if(this.state.imageFileName == ''){
        this.setState({emptyContent: true, emptyContentError: 'Missing content upload'});
      }
      let tags = this.state.tags ? this.state.tags[0] : '';
      this.state.tags ? this.state.tags.map(data => {
          data != tags ? tags += '===' + data : ''          
      }) : ''
      if(this.state.imageFileName != '' && fields.firstName != '' && fields.lastName != '' && this.refs.agree.checked == true && this.state.currentEmail != ''){
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          let file = new FormData();
          file.append("file",this.state.imageContent);
          file.append("hashtags", tags);
          file.append("description", fields.description ? fields.description : '');
          file.append("type", this.state.typeContent);
          file.append("location", location);
          file.append("email",this.state.currentEmail);
          file.append("firstName",fields.firstName);
          file.append("lastName",fields.lastName);
          xhr.open("POST", hostname+"/api/widget/upload/"+clientId+"/"+challengeId+"?access_time="+moment(), true);
          xhr.onload = () => {
              var result = JSON.parse(xhr.response); 
              resolve(xhr.responseText);             
              if(result.status.code == 200){  
                this.props.reset();
                this.refs.agree.checked = false;
                this.setState({ openModal: true, tags: [], readOnly: false, clickUpload: true, loadingUpload: false, error: '' });
                this.startTimer();
              } else {                
                this.setState({hideError: false, readOnly: false, loadingUpload: false, existEmail: false, error: result.error});
              }
          }
          xhr.onerror = () => {         
              reject(xhr.statusText);
              this.setState({hideError: false, readOnly: false, loadingUpload: false, existEmail: false});
          } 
          xhr.send(file);
          this.setState({loadingUpload: true,emptyContent: false, emptyContentError: ''}); 
      });                 
          
      }   
    }
  }
  handleAgree = () =>{
    this.setState({ agree: this.refs.agree.checked });
  }
  handleChange = (tags) => {
    this.setState({tags});   
  }  
  addHashtag  = (data) => {
    const {tags} = this.state;
    const checkExist = tags.includes(data);
    const index = _.findIndex(tags, function(x) { return x.toLowerCase() === data.toLowerCase(); })
    if(index < 0){        
      tags.push(data);      
    }else{
      const evens = _.remove(tags, function(x) { return x.toLowerCase() === data.toLowerCase(); })
    }
    this.setState({tags});
  }
  renderHashtagItem = (data) => {
    const checkExist = this.state.tags.includes(data);  
    return (
      <span className={classNames('react-tagsinput-tag', { 'selected': checkExist })} key={`addrewardlevel${data}`} onClick={() => this.addHashtag(data)}>
      {data}
      </span>
    )
  }
  handleChange = (e) =>{
    let email = this.refs.email;
    this.setState({currentEmail: email.value});
    setTimeout(() => {
      this.handleMouseOut();
    }, 2000);
  }
  handleMouseOut = () => {
    if(!this.state.currentEmail){
      if(this.state.trustEmail){
        this.props.changeFieldValue('firstName', '');
        this.props.changeFieldValue('lastName', '');
        this.setState({trustEmail: false, readOnly: false});
      }
      this.setState({emailError: 'This field is required', isSetEmail: false});
    }else{
      const emailPattern = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      if (!emailPattern.test(this.state.currentEmail)) {
        this.setState({emailError: 'Invalid email address', isSetEmail: false});
      }else{
        this.setState({emailError: '', isSetEmail: true});
        const { fields } = this.props;
        this.props.checkEmail(this.state.currentEmail);
      }
    }
    
  }
  handleKeyPressEmail = (e) =>{  
    const code = e.keyCode || e.which;  
  }
  updateInputValue = (event) => {
    this.setState({
      valueHashtag: event.target.value
    });
  }
  _handleKeyPress = (e) => {
    const {hashtagsArray, tags, valueHashtag} = this.state;    
      if (e.key === 'Enter') {
        if(hashtagsArray.length > 5){
          this.setState({errorTags: 'Maximum tags is 6.', valueHashtag: ''});
        }else{
          if(valueHashtag.trim().length == 0){
            this.setState({errorTag: 'Tag can not empty.', valueHashtag: ''});
          }else{
            const index = _.findIndex(hashtagsArray, function(x) { return x.toLowerCase() === valueHashtag.toLowerCase(); })
            if(index < 0){        
              tags.push(valueHashtag);
              hashtagsArray.push(valueHashtag);
              this.setState({hashtagsArray, tags, valueHashtag: '', errorTags: '', errorTag: '', errorTag: ''});    
            }else{
              this.setState({errorTag: 'Tag is duplicate.'});
            }             
          }          
        }
        e.preventDefault();               
      }
  }
render() {   
  let dropzoneRef;  
  const { valid, pristine } = this.props;  
  let uploadBtn = { cursor: 'pointer' };
  if (!valid || pristine || !this.refs.agree.checked || !this.state.clickUpload || !this.state.isSetEmail) {
    uploadBtn.opacity = 0.5;
    uploadBtn.pointerEvents = 'none';
  }
  return (
    <div>
      <div className="container-fluid widget-wrap">
        <div className="col-md-12 col-xs-12 col-sm-12 row">
          <div className="popup">
            <div className="header">             
                <div className="nsl-logo">
                  <img src={this.state.chl && this.state.chl.imageUri ? `${s3URL}${this.state.chl.imageUri}` : logoImg} alt="logo" />
                </div>
                <div className="title">
                  <p>{this.state.chl  ? this.state.chl.name : 'Entribe'}</p>
                </div>               
            </div>
            <div className="drag-file">
              <div className="drop-zone text-center">
                <Dropzone ref={(node) => { dropzoneRef = node; }} onDrop={(files) => this.onDrop(files)} className="inputImage">
                  <p>{this.state.imageFileName === '' ? 'Drag file to upload media' : this.state.imageFileName}</p>
                  <i className="fa fa-arrow-circle-o-up" aria-hidden="true"></i>
                </Dropzone>
                <p className="text-error">{this.state.contentError}</p>
              </div>
            </div>
            <div className="user-information">
              <form role="form" className="material-form" >
                <div className="col-md-12 col-sm-12 col-xs-12 widget-row">
                  <Field name="description" type="text" label="Description" component={renderFieldWidget} />                  
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12 widget-row">
                  <div>
                    <label className="label-new">Email</label>
                    <input type="text" ref="email" onChange={() => this.handleChange()} onKeyPress={(e) => this.handleKeyPressEmail(e)} />
                    {this.state.emailError && <span className="redux-form-error-message">{this.state.emailError}</span>}
                  </div>
                  {/* <Field name="email" type="text" label="Email" component={renderField} /> */}
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12 widget-row">
                  <Field name="firstName" type="text" label="First Name" component={renderFieldWidget} readOnly={this.state.readOnly} />
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12 widget-row">
                  <Field name="lastName" type="text" label="Last Name" component={renderFieldWidget} readOnly={this.state.readOnly} />
                </div>  
              </form>
                {this.state.hashtagsArray && <div className="col-md-12 col-sm-12 col-xs-12 hashtag">
                    <div className="react-tagsinput">
                      <span>                        
                        {this.state.hashtagsArray.map(this.renderHashtagItem, this, '')}     
                        <input type="text" maxLength="20" value={this.state.valueHashtag} onChange={this.updateInputValue} onKeyPress={(e) => this._handleKeyPress(e)} placeholder="Add up to 6 hashtags" />               
                      </span>
                    </div>
                  </div>
                }
                
                <div className="col-md-12 col-sm-12 col-xs-12 agree-row">
                  <input type="checkbox" ref="agree" onChange={this.handleAgree} className="form-check-input"/>
                  <span> I agree to <a href="http://www.entribe.com/terms" target="_blank">Terms & Conditions</a></span>
                </div>
                <div className="col-md-12 col-sm-12 col-xs-12 error">
                  {this.state.emptyContent && `${this.state.emptyContentError}`}
                  {this.state.error}
                  {this.state.errorTag || this.state.errorTags}
                </div>
            </div>
            {this.state.loadingUpload && <div className="loading-upload">
              <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              </div>                
            }
            <div className="button-upload">
              <div className="col-md-12 btn-center">
                <button className="btn btn-primary btn-popup" style={uploadBtn} onClick={this.handleUpload}>Upload</button>
              </div>
            </div>
            <div className="sign">
              <span>Powered by </span>
              <img src={logoImg} alt="logo" />
            </div>
          </div>
        </div>
      </div>
      <Modal
          isOpen={this.state.openModal}
          className={{
            base: 'customConfirm_Modal',
            afterOpen: 'custom_upload_widget_success',
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
                <span className='title-confirm-popup'>Success!<br/>Thanks for uploading</span>
              </div>
            </div>
          </form>
        </Modal>
    </div>
  )
}
}
Widget = reduxForm({
  form: 'widget',
  validate,
  asyncValidate
})(Widget);