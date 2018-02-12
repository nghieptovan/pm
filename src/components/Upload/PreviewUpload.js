import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import imgItem from '../../assets/img/no-img.png';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags, renderDropdownList, renderMaterialField } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ContentActions from '../../redux/actions/content';
import * as ChallengeActions from '../../redux/actions/challenge';
import Dropzone from 'react-dropzone';
import Multiselect from 'react-widgets/lib/Multiselect';
import DropdownList from 'react-widgets/lib/DropdownList'
import 'react-widgets/lib/scss/react-widgets.scss';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import dataMap from '../../utils/config';
import _ from 'lodash';
import VideoPlayer from '../VideoPlayer';
import ReactPlayer from 'react-player';
import ReactStars from 'react-stars';
import classNames from 'classnames';
import InputMask from 'react-input-mask';
import { s3URL } from '../../config/index';
import Slider from 'react-slick';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateChallengeForm(values, false);
};

const selector = formValueSelector('previewContent');

@connect(
  state => ({
    challenge: state.challenge,
    content: state.content,
    fields: selector(state, 'customRewardLevel', 'note', 'code')
  }),
  ({
    creatorUpload: (input, token, time) => ContentActions.creatorUpload(input, token, time),
    changeFieldValue: (field, value) => change('previewContent', field, value),
    contentReviewUpdate: (token, time, status, input, isAll) => ContentActions.contentReviewUpdate(token, time, status, input, isAll),
    getChallengeById: (token, id) => ChallengeActions.getChallengeById(token, id),
    getListUploads: (challengeId, token, status) => ContentActions.getListUploads(challengeId, token, status),
    contentRewardUpload: (token, time, status, input, isAll, mode) => ContentActions.contentRewardUpload(token, time, status, input, isAll, mode)
  }
  )
)

export default class PreviewUpload extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      defaultModalStatus: true,
      disableOverlay: false,
      challengeError: '',
      contentError: '',
      uploadStatus: true,
      flags: [],
      favourites: false,
      star: null,
      reviewed: false,
      openModalReward: false,
      rewardType: ['Coupon', 'Cash'],
      challengeDetail: null,
      totalReward: 0,
      selectRewardType: '',
      selectRewardLevel: null,
      customError: null,
      rewarded: false,
      errorReward: '',
      defaultNote: true,
      customRewardValue: null,
      rotation: 0,
      width: '',
      minHeight: '',
      currentIndex: 0,
      currentUpload: this.props.currentUploadPreview,
      currentUploadPreview: {},
      hideLeft: false,
      hideRight: false
    });
  }
  static propTypes = {
    creatorUpload: PropTypes.func,
    closeModalReward: PropTypes.func,
    changeChallengeType: PropTypes.func,
    isDashboard: PropTypes.bool,
    createChallenge: PropTypes.func,
    disabled: PropTypes.bool,
    dropup: PropTypes.bool,
    group: PropTypes.bool,
    isOpen: PropTypes.bool,
    tag: PropTypes.string,
    tether: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    toggle: PropTypes.func,
    clickDatePicker: PropTypes.func,
    contentReviewUpdate: PropTypes.func,
    currentUploadPreview: PropTypes.object,
  }


  componentWillReceiveProps(nextProps) {
    const { status, challengeId } = this.props;
    const { token } = getCurrentUser();
    const { currentUploadPreview, content, challenge } = this.props;
    const { currentUploadPreview: nextUploadPreview, content: nextcontent, challenge: nextchallenge } = nextProps;
    currentUploadPreview !== nextUploadPreview ? this.setState({
      favourites: nextUploadPreview.favourites ? nextUploadPreview.favourites : '',
      flags: nextUploadPreview.flagged ? nextUploadPreview.flagged.split(',') : [],
      star: nextUploadPreview.star ? nextUploadPreview.star : null
    }) : '';
    this.state.defaultNote && nextProps.fields.note && nextProps.fields.note !== this.props.currentUploadPreview.comment ? this.setState({defaultNote: false}) : '';
    if (content.updatedReview !== nextcontent.updatedReview && nextcontent.updatedReviewContent) {
      this.props.reset();
      this.setState({ reviewed: true, star: null });
      setTimeout(() => {
        this.closeModal();
      }, 1000);
    }
    if(challenge.loadingChallengeById != nextchallenge.loadingChallengeById &&  nextchallenge.loadingChallengeById == 2) {    
      this.setState({
        openModalReward: true, 
        rewarded: false, 
        errorReward: '',
        challengeDetail: nextchallenge.challengeById,
        selectRewardType: nextchallenge.challengeById.rewardType
      });
      this.props.changeFieldValue('customRewardLevel', nextchallenge.challengeById.rewardType);
    }
    content.loadingIcon != nextcontent.loadingIcon && nextcontent.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';
    content.loadingIcon != nextcontent.loadingIcon && nextcontent.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';
        
    content.updatedRewardStatus !== nextcontent.updatedRewardStatus && nextcontent.updatedRewardStatus === 2 ? this.setState({errorReward : nextcontent.errorRewardNow, rewarded: false, isReward: false}) : '';
    if(content.updatedRewardStatus !== nextcontent.updatedRewardStatus && nextcontent.updatedRewardStatus === 1){
      this.setState({ rewarded: true, selectRewardLevel: null, customRewardValue: null, errorReward: '', isReward:false });
      this.props.changeFieldValue('code', null);
      setTimeout(() => {
        this.setState({ openModalReward: false });
      }, 1000);
    }
  }
  closeModal = () => {
    this.props.closeModal();
    this.props.reset();
    this.setState({
      favourites: this.state.currentUpload.favourites ? this.state.currentUpload.favourites : '',
      flags: this.state.currentUpload.flagged ? this.state.currentUpload.flagged.split(',') : [],
      star: this.state.currentUpload.star ? this.state.currentUpload.star : null,
      rewarded: false,
      defaultNote: true,
      rotation: 0,
      width: '',
      minHeight: '',
      hideLeft: false,
      hideRight: false
    })
  };
 
  closeModal2 = () => {
    this.props.changeFieldValue('code', null);
    this.setState(prevState => ({
      openModalReward: false,
      selectRewardLevel: null
    }));

  };

  afterOpenModal = () => {
    this.props.reset();
    const { challenge: { listLiveChallenges }, currentUploadPreview, listUploads } = this.props;
    let currentUploadPreviewIndex = _.indexOf(listUploads, currentUploadPreview);
    this.setState({
      challengeError: '',
      contentError: '',
      reviewed: false,
      currentUpload: currentUploadPreview,
      currentIndex: currentUploadPreviewIndex,
    });
    currentUploadPreviewIndex === 0 && this.setState({hideLeft: true});
    currentUploadPreviewIndex === (listUploads.length - 1) && this.setState({hideRight: true});
    listUploads.length == 1 && this.setState({hideLeft: true, hideRight: true });
  };
  flagsChanged = (newFlags) => {
    this.setState({
      flags: newFlags
    });
  }

  renderItemCheck = (tag, data) => {
    return (
      <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 flag-checkbox" key={`checkbox1${data}`}>
        <Checkbox key={tag.text} value={tag.text} />
        <span>{tag.text}</span>
      </div>
    )
  }

  actionFavourite = () => {
    this.setState(prevState => ({
      favourites: !prevState.favourites
    }));
  }
  ratingChanged = (newRating) => {
    this.setState({ star: newRating });
  }
  actionSave = () => {
    const { status } = this.props;
    let currentUploadPreview = this.state.currentUpload;
    let comment = this.state.currentUpload.comment ? this.state.currentUpload.comment : '';
    const { token } = getCurrentUser();
    let flagsReturn;
    this.state.flags.length > 0 ? flagsReturn = _.join(this.state.flags, ',') : flagsReturn = '';
    const access_time = moment();
    const dataInput = {
      id: currentUploadPreview.id,
      favourites: this.state.favourites,
      flagged: flagsReturn,
      comment: this.props.fields.note ?  this.props.fields.note : comment 
    };
    this.setState({defaultNote: true, loadingUpload: true});
    this.state.star ? dataInput.star = this.state.star : '';
    this.props.contentReviewUpdate(token, access_time, status, dataInput, this.props.isAll);
  }
  actionReward = () => {
    const { token } = getCurrentUser();   
    this.props.getChallengeById(token, this.state.currentUpload.challengeId);    
  }
  renderRewardLevel = (data) => {
    const rewardDefault = data.split(',');
    return (
      <div>
        {
          rewardDefault.map(item => <div key={item} className={classNames('multiselect-tag', { selected: this.state.selectRewardLevel === item })} ><span onClick={() => this.chooseReward(item)}>{item}</span></div>)
        }
      </div>
    )
  }
  chooseReward = (item) => {
    const value = this.state.selectRewardLevel === item ? null : item;
    this.setState({
      selectRewardLevel: value
    })
  }
  changeValueReward = (value) => {
    this.setState({
      selectRewardType: value
    })
  }
  handleReward = (mode) => {
    let rewardLevelValue;    
    const dataContent = [];
    const { fields, status } = this.props;
    let currentUploadPreview = this.state.currentUpload;
    const re = /^[0-9]+$/;
    const access_time = moment();
    const { token } = getCurrentUser();
    if(mode == 'Now'){
    if (this.state.customRewardValue) {
      if (this.state.selectRewardLevel) {
        rewardLevelValue = this.state.selectRewardLevel;
        this.setState({ customError: '' });
      } else {  
        if(this.state.customRewardValue <= 0){
          this.setState({ customError: 'Reward value must > 0' });
        } else {
          rewardLevelValue = `$${this.state.customRewardValue}`;
          this.setState({ customError: '' });
        }    
      }
    } else {
      if (this.state.selectRewardLevel) {
        rewardLevelValue = this.state.selectRewardLevel;
        this.setState({ customError: '' });
      } else {
        this.setState({ customError: 'Reward is required.' });
      }
    }
    if(!this.props.fields.code || this.props.fields.code.length ==0){
      this.setState({ codeError: 'Coupon code is required.' });
    }
    if (rewardLevelValue || this.props.fields.code) {
      const dataInput = {
        id: currentUploadPreview.id,
        rewardLevel: rewardLevelValue,
        rewardType: this.state.selectRewardType,
        challengeId: currentUploadPreview.challengeId,
        couponCode: this.props.fields.code
              }
      dataContent.push(dataInput);
      this.props.contentRewardUpload(token, access_time, status, dataContent, this.props.isAll, mode);
      this.setState({isReward: true});
    }
  }
    else {
      const dataInput = {
        id: currentUploadPreview.id,      
        challengeId: currentUploadPreview.challengeId,
        rewardType: this.state.selectRewardType        
      }
      dataContent.push(dataInput);
      this.props.contentRewardUpload(token, access_time, status, dataContent, this.props.isAll, mode);
      this.setState({isReward: true});
    }
  }
  actionDownload = () => {
    window.open(`${s3URL}${this.state.currentUpload.contentUri}`);
  }
  onChangeTotalBudget = (event) => {
    const value = event.target.value;
    
    const customRewardValue = value.split('$')[1];
    this.setState({customRewardValue});
  }
  rotate = () => {
    let img = new Image();
    img.src = s3URL+this.state.currentUpload.contentUri;
    let newRotation = this.state.rotation + 90;
    let width = this.state.width;
    let minHeight = this.state.minHeight;
    if(newRotation >= 360){
      newRotation =- 360;
    }
    const windowH =  window.innerHeight -269;
    if(img.width > img.height){
      
      if(Math.abs(newRotation)/90 == 1 || Math.abs(newRotation)/90 == 3){
        if(img.width > windowH){
          width = windowH;
          minHeight = windowH;
        } else {
          width = img.width;
          minHeight = img.width;
        }
      } else {
        width = '';
        
        minHeight = '';
      }
    } else if (img.width == img.height){
      if(img.width > windowH){
        width = windowH;
        minHeight = windowH;
      } else {
        width = img.width;
        minHeight = img.width;
      }
    } else {
      if(Math.abs(newRotation)/90 == 0 || Math.abs(newRotation)/90 == 2){
        if(img.height > windowH){
          width = windowH;
          minHeight = windowH;
        } else {
          width = img.width;
          minHeight = img.width;
        }
      } else {
        width = '';
        minHeight = '';                
      }
    }    
    this.setState({rotation: newRotation, width, minHeight});
  }
  renderHashtagItem = (data) => {    
    return (
      <span className={classNames('react-tagsinput-tag', { 'selected': true })} key={`addrewardlevel${data}`} onClick={() => this.addHashtag(data)}>
      {data}
      </span>
    )
  }

  arrowClick = (isRightArrow) => {
    let { currentIndex, hideLeft, hideRight, star, favourites, flags } = this.state;
    const { listUploads } = this.props;
    this.props.changeFieldValue('note', null);
    this.props.changeFieldValue('code', null);
    if (isRightArrow) {
      if (currentIndex < listUploads.length - 1) {
        currentIndex++;
        flags = listUploads[currentIndex].flagged ? listUploads[currentIndex].flagged.split(',') : [];
        star = listUploads[currentIndex].star ? listUploads[currentIndex].star : null;
        favourites = listUploads[currentIndex].favourites ? listUploads[currentIndex].favourites : null;
        hideRight = currentIndex == listUploads.length - 1 ? true : false;
        this.setState({ defaultNote: true, currentIndex, currentUpload: listUploads[currentIndex], flags, star, favourites, hideRight, hideLeft: false, rotation: 0, width: '', minHeight: '' });
      }
    }
    if (!isRightArrow) {
      if (currentIndex > 0) {
        currentIndex--;
        flags = listUploads[currentIndex].flagged ? listUploads[currentIndex].flagged.split(',') : [],
        star = listUploads[currentIndex].star ? listUploads[currentIndex].star : null;
        favourites = listUploads[currentIndex].favourites ? listUploads[currentIndex].favourites : null;
        hideLeft = currentIndex == 0 ? true : false;
        this.setState({ defaultNote: true, currentIndex, currentUpload: listUploads[currentIndex], flags, star, favourites, hideLeft, hideRight: false, rotation: 0, width: '', minHeight: '' });
      }
    }
  }

  render() {
    let { valid, pristine, idChallengeSet, nameChallengeSet, challenge: { listLiveChallenges }, challengeId, disableEdit, listUploads } = this.props;
    let currentUploadPreview = this.state.currentUpload || this.props.currentUploadPreview;
    let comment = this.state.defaultNote ? (currentUploadPreview.comment ? currentUploadPreview.comment : '') : this.props.fields.note; 
    let imageUri;
    let location ='';
    if (currentUploadPreview.location){
      location=currentUploadPreview.location.split("-");
      location= location[0] +" "+ location[1]  + " - ";
    } 
    let tags = currentUploadPreview.hashtags ?currentUploadPreview.hashtags.split('==='):[];
    challengeId = currentUploadPreview.challengeId;
    imageUri = currentUploadPreview.type === 'video' ? currentUploadPreview.thumbnail : currentUploadPreview.contentUri;
    const imagePreview = imageUri ? `${s3URL}${imageUri}` : imgItem;
    let disableButtonSaveStyle = { cursor: 'pointer', marginTop: '21px' };
    let disableButtonRewardStyle = { cursor: 'pointer' };
    let disableButtonRewardLaterStyle = { cursor: 'pointer', marginRight: '20px'  };
    if(!this.props.fields.note && !this.state.star && !this.state.selectRewardLevel && !this.state.favourites && this.state.flags.length == 0){
      disableButtonSaveStyle.opacity = 0.5;
      disableButtonSaveStyle.pointerEvents = 'none';
    }
    if(this.state.isReward){
      disableButtonRewardStyle.opacity = 0.5;
      disableButtonRewardStyle.pointerEvents = 'none';
      disableButtonRewardLaterStyle.opacity = 0.5;
      disableButtonRewardLaterStyle.pointerEvents = 'none';
    }
    
    return (
      <div>
        <Modal
          isOpen={this.props.openModalPreview}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={false}
          className={{
            base: 'custom_Modal',
            afterOpen: this.state.reviewed ? 'custom_after-open-reward' : 'custom_after-open-preview',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Example Modal"
        >       
          {this.state.reviewed && <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                <span className="title-success-message">Saved Uploaded</span>
              </div>
            </div>           
          </form>
          }
          {!this.state.reviewed &&
            <div className="container-fluid">
              <div className="icon-thick-delete-icon" onClick={() => this.closeModal()} />
              <div className="row header-preview">
                <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  <p className="title pull-left" style={{fontSize: '18px'}}>{currentUploadPreview.challengeName}</p>
                  <p className="title pull-left" style={{fontSize: '9px'}}>{location + moment(currentUploadPreview.uploadDate).format('ll')}</p>
                </div>               
              </div>
              <div className="row img-preview" style={{ height: 'auto' , maxHeight: window.innerHeight - 269 }}>
              {!this.state.hideLeft && <span className="icon-arrow-left arrow-icons" onClick={() => this.arrowClick(false)}></span>}
                <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12 video-content" style={{ height: 'auto' , maxHeight: window.innerHeight - 269 }}>
                  {currentUploadPreview.type === 'video' &&
                    <ReactPlayer url={`${s3URL}${currentUploadPreview.contentUri}`}
                      playing={false}
                      height={window.innerHeight - 269}  
                      controls={true}
                    />
                  }
                  {currentUploadPreview.type === 'image' && <img src={imagePreview}  style={{ maxHeight: window.innerHeight - 269,objectFit: 'contain' ,minHeight: this.state.minHeight, transform: `rotate(${this.state.rotation}deg)`, width: this.state.width }}/>}
                </div>
                {!this.state.hideRight && <span className="icon-arrow-right arrow-icons" onClick={() => this.arrowClick(true)}></span>}
              </div>              
              <div className="row footer-preview">
                <div className="col-lg-5 col-md-5 col-sm-12 col-xs-12" style={{marginTop: '8px'}}>
                  <div className="info">
                    <div className="header">
                      <div className="info-user">
                        <p className="name">{currentUploadPreview.firstName + ' ' + currentUploadPreview.lastName}</p>
                        <p className="email">{currentUploadPreview.email ? currentUploadPreview.email : ''}</p>
                      </div>
                      <div className="rating" style={{marginTop: '-10px'}}>
                      {!disableEdit && <ReactStars
                          className={'star'}
                          count={5}
                          value={this.state.star}
                          half={false}
                          onChange={this.ratingChanged}
                          size={24}
                          color2={'#f9c81a'}
                          marginRight={'1px'}
                        />}
                        {disableEdit && <ReactStars
                          className={'star'}
                          count={5}
                          value={this.state.star}
                          half={false}
                          onChange={this.ratingChanged}
                          size={24}
                          edit={false}
                          color2={'#f9c81a'}
                          marginRight={'1px'}
                        />}
                      </div>
                    </div>
                    <div className="body">
                      <div className="content-body">
                        <div className="description"><b>Description:</b> {currentUploadPreview.description ? currentUploadPreview.description : ''}</div>
                        <div className="hashtags" style={{marginTop: '10px'}}><b>Tags:</b> {tags.length > 0 ? tags.map(this.renderHashtagItem, this, '') : 'No tag'}</div>
                      </div>
                    </div>                   
                  </div> 
                </div>
                <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12">
                  <div className="info border-left">
                    <div className="header">
                      <div className="flag">
                        <i className="icon-flag-icon"></i>FLAG
                            </div>
                    </div>
                    <div className="body">
                      <div className="body-checkbox">
                        <CheckboxGroup
                          name="flags"
                          value={this.state.flags}
                          onChange={this.flagsChanged}>
                          {dataMap.dataTag && dataMap.dataTag.map(this.renderItemCheck, this, '')}
                        </CheckboxGroup>
                      </div>

                    </div>
                   
                  </div>
                </div>
                <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12">
                <form style={{marginTop: '0px'}}>         
                  <div className="info border-left save-div">
                    <div className="header">
                      {!disableEdit && <div className="flag">
                        <i className="icon-note-icon"></i>NOTE
                                <div className="group-social">
                          {currentUploadPreview.type === 'image' &&<span className="icon-flip-image" style={{cursor: 'pointer', fontSize: 25 + 'px', marginRight: 5 + 'px'}} onClick={this.rotate}>
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                              <span className="path5"></span>
                              <span className="path6"></span>
                              <span className="path7"></span>
                          </span>}
                          <i className="icon-download-icon" style={{cursor: 'pointer'}} onClick={this.actionDownload}></i>
                          <i onClick={this.actionFavourite}
                            className={!this.state.favourites ? 'icon-heart-icon' : 'icon-heart-icon loved'}
                          ></i>
                        </div>
                      </div>}
                        
                      {disableEdit && <div className="flag">
                          <i className="icon-note-icon"></i>NOTE
                          <div className="group-social">
                            {currentUploadPreview.type === 'image' &&<i className="icon-rotate-icon" style={{cursor: 'pointer'}} onClick={this.rotate}></i>}
                          {/* {currentUploadPreview.type === 'image' &&<span className="icon-flip-image" style={{cursor: 'pointer', fontSize: 25 + 'px', marginRight: 5 + 'px'}} onClick={this.rotate}>
                              <span className="path1"></span>
                              <span className="path2"></span>
                              <span className="path3"></span>
                              <span className="path4"></span>
                              <span className="path5"></span>
                              <span className="path6"></span>
                              <span className="path7"></span>
                          </span>} */}
                            <i className="icon-download-icon" style={{cursor: 'pointer'}}></i>
                            <i className={!this.state.favourites ? 'icon-heart-icon' : 'icon-heart-icon loved'}></i>
                          </div>
                      </div>}
                      
                    </div>                           
                    <Field name="note" defaultValue={comment}
                        component={renderTextArea} className='body'>
                    </Field>                       
                    {(currentUploadPreview.challengeStatus !== "ARCHIVED" && !disableEdit) &&       
                    <div className="action-btn">                             
                      <div className="action save" style={disableButtonSaveStyle} >
                        <span onClick={() => this.actionSave()}><i className="icon-save-icon"></i>Save</span>
                      </div>     
                      <div className="action reward" onClick={() => this.actionReward(currentUploadPreview.challengeId)}>                   
                        <span ><i className="icon-rewards"></i>Reward</span>
                      </div>                                    
                    </div>
                    
                  }
                  </div>
                  </form>
                </div>               
              </div>  
            </div>
          }
        </Modal>
        <Modal
            isOpen={this.state.openModalReward}
            shouldCloseOnOverlayClick={false}
            className={{
              base: 'custom_Modal',
              afterOpen: this.state.rewarded ? 'custom_after-open-reward' : 'custom_after-open-reward-single',
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
              {this.state.rewarded &&
                <form className='form-confirm'>
                  <div className="row">
                    <div className="col-md-12 col-lg-12 col-sm-12 icon">
                      <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12 col-lg-12 col-sm-12">
                      <span className='title-confirm-popup'>Rewarded Success</span>
                    </div>
                  </div>
                </form>
              }
              {!this.state.rewarded &&
                <form>
                  <div className="icon-thick-delete-icon" onClick={() => this.closeModal2()} />
                  <div>
                    <div className="row" style={{ marginTop: '20px' }}>
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                        <span>Reward Type</span>
                        {this.state.challengeDetail &&
                          <DropdownList
                            name="rewardType"
                            data={this.state.rewardType}
                            value={this.state.selectRewardType}
                            placeholder={this.state.selectRewardType}
                            onChange={value => this.changeValueReward(value)}
                          />

                        }
                        <p className="text-danger">{this.state.rewardTypeError}</p>
                      </div>                   
                      {this.state.selectRewardType === 'Coupon' &&
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12" style={{marginTop: '22px'}}>  
                          <Field name="code" type="text"
                          placeholder="Coupon code" 
                          component={renderMaterialField}
                        />                        
                        <p className="text-danger">{this.state.codeError}</p>
                      </div>
                    }
                      {this.state.selectRewardType === 'Cash' && this.state.challengeDetail.rewardLevel &&
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                        <span>Reward Level</span>
                        <div className="contentReward2">
                          <div className="contentData row">
                            {this.state.challengeDetail  &&
                              this.renderRewardLevel(this.state.challengeDetail.rewardLevel)
                            }
                          </div>
                        </div>
                      </div>
                    }  
                    {this.state.selectRewardType === 'Cash' && !this.state.challengeDetail.rewardLevel &&
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                        <InputMask style={{margin: '27px 0px'}} mask="$9999999" maskChar={null} placeholder="Custom reward level" readOnly={this.state.selectRewardLevel ? true : false} onChange={this.onChangeTotalBudget} />
                        <p className="text-danger">{this.state.customError}</p>
                      </div>
                    }                 
                    </div>
                    {this.state.selectRewardType === 'Cash' && this.state.challengeDetail.rewardLevel &&
                    <div className="row" style={{ marginTop: '20px' }}>
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 pull-right reward-label">
                        <InputMask mask="$9999999" maskChar={null} placeholder="Custom reward level" readOnly={this.state.selectRewardLevel ? true : false} onChange={this.onChangeTotalBudget} />
                        <p className="text-danger">{this.state.customError}</p>
                      </div>
                    </div>
                    }
                    <div className="row endline" style={{ marginTop: '20px', marginBottom: '5px' }}>
                      <div className="col-md-12 col-lg-12 col-sm-12 col-xs-12">
                      <p className="text-danger">{this.state.errorReward}</p>
                      </div>
                      </div>
                      {this.state.selectRewardType === 'Coupon' && <div className="row" style={{padding: '10px 10px 10px 0px'}}>
                        <div>
                        <span className="btn-create" style={disableButtonRewardStyle} onClick={(e) => this.handleReward("Now", e)}>Reward Now</span>
                        </div>
                        <div>
                          <span className="btn-create"  style={disableButtonRewardLaterStyle} onClick={(e) => this.handleReward("Later",e)}>Reward Later</span>
                        </div>
                    </div>}
                    {this.state.selectRewardType === 'Cash' && <div className="row" style={{padding: '10px 10px 10px 0px'}}>
                        <div>
                          <span className="btn-create" style={disableButtonRewardStyle} onClick={(e) => this.handleReward("Now", e)}>Reward</span>
                        </div>                       
                    </div>}
                  </div>
                </form>
              }

            </div>

          </Modal>
      </div>
    )
  }
}
PreviewUpload = reduxForm({
  form: 'previewContent',
  validate
})(PreviewUpload);