import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import CoverImage from '../../assets/img/no-img.png';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { previewContent } from './../../utils/formValidation';
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
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {SampleNextArrow, SamplePrevArrow} from '../SlideSlick';
import Carousel from 'nuka-carousel';
import CustomScroll from 'react-custom-scroll';
import 'react-custom-scroll/dist/customScroll.css';
import { Scrollbars } from 'react-custom-scrollbars';
import LazyLoad from 'react-lazy-load';
import InputMask from 'react-input-mask';
import { login } from '../../redux/actions/auth';
import { s3URL } from '../../config/index';
import ReactLoading from 'react-loading';
const validate = values => {
  return previewContent(values, false);
};

const selector = formValueSelector('previewContent');
@connect(
  state => ({
    challenge: state.challenge,
    content: state.content,
    fields: selector(state, 'customRewardLevel', 'code')
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

export default class RewardMultiUpload extends Component {
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
      defaultMulti: null,
      selectedMulti: null,
      rewardAllNow: false,
      selectRewardType: this.props.activeChallenge && this.props.activeChallenge.rewardType ? this.props.activeChallenge.rewardType :'Cash',
      selectRewardLevel: null,
      rewardType: ['Coupon', 'Cash'],
      rewarded: false,
      errorReward: '',
      customRewardValue: null,
      openAddCoupon: false,
      couponList: [],
      valueInput: '',
      isNotFullList: false,
      selectedData: [],
      checkedAll: false
    });
  }
  static propTypes = {
    creatorUpload: PropTypes.func,
    closeModal: PropTypes.func,
    closeModalMultiReward: PropTypes.func,
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
    content.loadingIcon != nextcontent.loadingIcon && nextcontent.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';
    content.loadingIcon != nextcontent.loadingIcon && nextcontent.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';
    content.updatedRewardStatus !== nextcontent.updatedRewardStatus && nextcontent.updatedRewardStatus === 2 ? this.setState({errorReward : nextcontent.errorRewardNow, rewarded: false, isRewarded: false}) : '';
    if(content.updatedRewardStatus !== nextcontent.updatedRewardStatus && nextcontent.updatedRewardStatus === 1){
      this.setState({rewardAllNow: true, rewarded: true, selectRewardLevel: null, errorReward: '', checkedAll: false , isRewarded: false});
      setTimeout(() => {
        this.closeRewardAllNow();
        this.props.closeModalMultiReward();
        this.props.rewardDone();
      }, 1000);
    }
    this.props.activeChallenge != nextProps.activeChallenge && nextProps.activeChallenge.rewardType == 'Cash' ? this.setState({selectRewardType: 'Cash'}) :'';
    this.props.activeChallenge != nextProps.activeChallenge && nextProps.activeChallenge.rewardType == 'Coupon' ? this.setState({selectRewardType: 'Coupon'}) :'';
  }
  componentWillMount(){
    const { token } = getCurrentUser();
    const { challengeId } = this.props;
    this.props.getChallengeById(token, challengeId);
    this.setState({loadingUpload :true});
  }

  renderMultiItem = (upload, data) => {
    const {selectedData, couponList} = this.state;
    const imageUri = upload.type === 'video' ? upload.thumbnail : upload.contentUri;
    const imagePreview = imageUri ? `${s3URL}${imageUri}` : CoverImage;
    return (  
      <div className="item-slider-multi" key={`multiitem${data}`}> 
        <div className="img-item">   
          <Checkbox value={upload} className="checkbox-list-creator" />
          <LazyLoad height={90} key={'itemupload'+data}>
            <img src={imagePreview} onClick={() => this.updatePosition(data)} />              
          </LazyLoad>
          <div className="rating-item">
            <ReactStars
              count={5}
              value={upload.star ? upload.star : 0}
              half={false}
              size={17}
              edit={false}
              color2={'#ffd700'}
            />
          </div>
        </div>    
        <div className="coupon-item"> 
          { (couponList[data] && couponList[data].value != '') &&
          <InputMask key={`keyinput${data}`} className="input-coupon" mask="**********" maskChar={null} value={this.state.couponList[data].value} placeholder="Coupon code" onChange={e => this.updateInputValue(e, upload.id)} />
          //  <input type="text" placeholder="Coupon code" value={this.state.couponList[data].value} onChange={(e) => this.handleKeyChange(e, upload.id)} className="input-coupon" onKeyUp={e => this.updateInputValue(e, upload.id)} />
          }
          { (couponList[data] && couponList[data].value == '') &&
          <InputMask key={`keyinput${data}`} className="input-coupon" mask="**********" maskChar={null} value={this.state.couponList[data].value} placeholder="Coupon code" onChange={e => this.updateInputValue(e, upload.id)} />
          //  <input type="text" placeholder="Coupon code" value={this.state.couponList[data].value} onChange={(e) => this.handleKeyChange(e, upload.id)} className="input-coupon" onKeyUp={e => this.updateInputValue(e, upload.id)} />
          }
        
        </div>
      </div>
    )
  }
  handleKeyChange = (e, id) => {
    let {couponList} = this.state;
    const currentVal = {id: id, value: e.target.value};

    const index = _.findIndex(couponList, {id: id});
    if(index != -1){
      couponList[index] = currentVal;
    }
    this.setState({couponList});
  }
  updateInputValue = (e, id) => {
    const currentVal = {id: id, value: e.target.value};
    let {couponList} = this.state;

    const index = _.findIndex(couponList, {id: id});
    couponList[index] = currentVal;
    this.setState({couponList});
  }
  updateInputValueAll = (e) => {
    let {selectedData, couponList} = this.state;

    if(selectedData.length > 0){
      _.forEach(selectedData, (value) => {
        const index = _.findIndex(couponList, {id: value.id});
        if(index != -1){
          couponList[index].value = e.target.value;
        }       
      })
    } 
    this.setState({couponList});
  }
  updatePosition = (defaultMulti) => {
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
    this.setState({defaultMulti, selectedMulti : data[defaultMulti]});
  }
  renderFirstItem = () => {
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
    if(data){
      const position = this.state.defaultMulti ? this.state.defaultMulti : 0;
      const item = data[position] || {};

      const imageUri = item.type === 'video' ? item.thumbnail : item.contentUri;
      const imagePreview = imageUri ? `${s3URL}${imageUri}` : CoverImage;
      return(
          <LazyLoad className="cover-img" key={'itemuploadFirst'} style={{ height: '100%' }}>
            <img className="img-upload" src={imagePreview} style={{maxHeight: window.innerHeight - 253}} />   
          </LazyLoad>                      
      )
    }    
  }
  closeModal = () => {   
    this.setState({rewardAllNow: false, selectRewardType: this.props.activeChallenge.rewardType ? this.props.activeChallenge.rewardType : 'Cash', selectRewardLevel : null }); 
    this.closeRewardAllNow();
    this.props.closeModalMultiReward();
    this.props.rewardDone();
      
  };
  rewardAllNow() {
    const dataContent = [];
    const { fields, currentUploadPreview, status, rate, data, activeChallenge } = this.props;
    const re = /^[0-9]+$/;
    const {couponList} = this.state;
    const access_time = moment();
    const { token } = getCurrentUser();

    const statusCheck = this.checkBeforeRewardAll();
    switch (statusCheck) {
      case 1 : {
        data.map((item) => {
          let index = _.findIndex(this.state.couponList, {id: item.id});
          const dataInput = {
            id: item.id,
            rewardLevel: '',
            rewardType: 'Coupon',
            challengeId: item.challengeId,
            couponCode: index !== -1 ? this.state.couponList[index].value : ''         
          }
          dataContent.push(dataInput);
        })  
        this.props.contentRewardUpload(token, access_time, status, dataContent, this.props.isAll, 'Now');        
        break;
      }
      case 2 : {
        this.props.changeFieldValue('customRewardLevel', '');
        this.props.changeFieldValue('code', '');      
        this.setState({rewardAllNow: true, rewarded: false, errorReward: ''});
        break;
      }
      case 3 : {
        this.setState({isNotFullList: true});
        break;
      }
      default: { 
        break;              
     } 
    }
  }
  checkBeforeRewardAll(){    
    const {couponList} = this.state;
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
    let countEmpty = 0;       
    _.forEach(couponList, (value) => {
      if(value.value !== ''){
        countEmpty++;
      }
    })
    if(countEmpty == couponList.length){
      return 1;
    }else if(countEmpty == 0){
      return 2;
    }else{
      return 3;
    }
  }
  closeRewardAllNow() {
    this.setState({rewardAllNow: false, selectRewardType: this.props.activeChallenge.rewardType ? this.props.activeChallenge.rewardType : 'Cash', selectRewardLevel : null });
  }
  changeValueReward = (value) => {
    this.setState({
      selectRewardType: value
    })
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
  rewardNow = (mode) => {
    let rewardLevelValue;
    const dataContent = [];
    const { fields, currentUploadPreview, status, rate, data, activeChallenge } = this.props;
    const re = /^[0-9]+$/;
    const access_time = moment();
    const { token } = getCurrentUser();
    if(this.state.selectRewardType == 'Cash'){
      if (this.state.customRewardValue) {
        if (this.state.selectRewardLevel) {
          rewardLevelValue = this.state.selectRewardLevel;
          this.setState({ customError: '' });
        } else {       
          if(this.state.customRewardValue <= 0){
            this.setState({ customError: 'Reward value must > 0' });
          } else {
            rewardLevelValue = `$${this.state.customRewardValue}`
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
      let rewardType = this.state.selectRewardType;
      rewardType = null ? rewardType = this.state.rewardType[1] : rewardType;
      if (rewardLevelValue) {
        data.map((item) => {
          const dataInput = {
            id: item.id,
            rewardLevel: rewardLevelValue,
            rewardType: this.state.selectRewardType ? rewardType : activeChallenge.rewardType,
            challengeId: item.challengeId         
          }
          dataContent.push(dataInput);
        })      
        this.props.contentRewardUpload(token, access_time, status, dataContent, this.props.isAll, mode);
        this.setState({isRewarded: true , loadingUpload: true });
      }
    }else{
      this.setState({customError: ''});
      data.map((item) => {
        let index = _.findIndex(this.state.couponList, {id: item.id});
        const dataInput = {
          id: item.id,
          rewardLevel: '',
          rewardType: 'Coupon',
          challengeId: item.challengeId,
          couponCode: fields.code ? fields.code : ''         
        }
        dataContent.push(dataInput);
      })      
      this.props.contentRewardUpload(token, access_time, status, dataContent, this.props.isAll, mode); 
      this.setState({isRewarded: true , loadingUpload: true});
    }   
  }
  onChangeTotalBudget = (event) => {
    const value = event.target.value;
    const customRewardValue = value.split('$')[1];
    this.setState({customRewardValue});
  }
  actionCoupon = () => {       
    this.setState(prevState => ({
      openAddCoupon: !this.state.openAddCoupon      
    }));
  }
  closeisNotFullList = () => {
    this.setState(prevState => ({
      isNotFullList: false
    }));
  }
  datasChanged = (newFlags) => {
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
    this.setState({
      selectedData: newFlags,
      checkedAll: newFlags.length != data.length ? false : ''
    });
  }
  selectAll = () => {
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
      const selectAll = this.refs.checkToSelectAll;
      selectAll.checked ? this.setState({selectedData : data, selectAll: true, checkedAll: true}) : this.setState({selectedData : [], selectAll: false, checkedAll: false});
  }
  afterOpenModal = () => {
    let couponList = [];

    let {data} = this.props;
    data = _.uniqBy(data, 'id');

    _.forEach(data, (value) => {
      // const index = _.findIndex(couponList, {id: value.id});
      // index == -1 ? couponList.push({id: value.id, value: ''}): couponList[index].value = '';  
      couponList.push({id: value.id, value: ''});    
    })
    this.setState({couponList, openAddCoupon: false, selectedData: [], checkedAll: false});
  };

  render() {
    const { rate, openModalReward, activeChallenge,valid, pristine} = this.props;
    let {data} = this.props;
    data = _.uniqBy(data, 'id');
    console.log(this.state.selectRewardType)
    const firstItem = this.state.selectedMulti ? this.state.selectedMulti : (data ? data[0] : '');    
      let disableButtonNextStyle = { cursor: 'pointer' };
    if ((!valid || pristine ) && this.state.selectRewardType !== 'Cash') {
      disableButtonNextStyle.opacity = 0.5;
      disableButtonNextStyle.pointerEvents = 'none';
    }
    let disableButtonRewardStyle = { cursor: 'pointer' };
    if (this.state.isRewarded) {
      disableButtonRewardStyle.opacity = 0.5;
      disableButtonRewardStyle.pointerEvents = 'none';
      disableButtonNextStyle.opacity = 0.5;
      disableButtonNextStyle.pointerEvents = 'none';
    }
    let location ='';
    if (firstItem && firstItem.location){
      location=firstItem.location.split("-");
      location= location[0] +" "+ location[1] + " - ";
    } 
    return (
      <div>          
          <Modal
            isOpen={openModalReward}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            shouldCloseOnOverlayClick={true}
            className={{
              base: 'custom_Modal',
              afterOpen: 'custom_after_rewardMultiContent',
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
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12" style={{padding: '0px', height: window.innerHeight - 253 + 'px'}}>
                      {this.renderFirstItem()}                                  
                    </div>               
                </div>
                <div className={classNames('slider-upload', { isOpen: this.state.openAddCoupon })} style={{padding: '0px', height: window.innerHeight - 258 + 'px'}}>  
                  <div className="open-coupon" onClick={this.actionCoupon}>
                    <i className={classNames({ 'icon-arrow-right' : this.state.openAddCoupon, 'icon-arrow-left' : !this.state.openAddCoupon })}></i>
                  </div>
                  <div className="header-item">
                    <div className="left-header">
                      <input type="checkbox" className="checkbox-list-creator" checked={this.state.checkedAll} onChange={this.selectAll} ref="checkToSelectAll" />
                      <span>
                      Select All
                      </span>
                    </div>
                    <div className="right-header">
                      {/* <input type="text" name="abc" onKeyUp={e => this.updateInputValueAll(e)} placeholder="Enter code to apply to all" /> */}
                      <InputMask key={`keyinput${data}`}mask="**********" maskChar={null} placeholder="Enter code to apply to all"
                       onChange={e => this.updateInputValueAll(e)} />
                    </div>
                  </div>
                  <Scrollbars style={{ height: window.innerHeight - 293}} renderThumbVertical={({ style, ...props }) =>
                    <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', marginRight: '-2px' }}/>
                    }>    
                    <CheckboxGroup
                      name="selectedData"
                      value={this.state.selectedData}
                      onChange={this.datasChanged}>
                      {data && data.map(this.renderMultiItem, this, '')}      
                    </CheckboxGroup>      
                                                  
                  </Scrollbars>              
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center" style={{padding: '0px'}}>
                    {firstItem && <div className="title-img">                      
                        <h3>{firstItem.firstName + ' ' + firstItem.lastName}</h3>
                        <p style={{margin: '0px'}}>{location + moment(firstItem.uploadDate).format("ll")}</p>
                        <div className="rating">
                            <ReactStars
                              count={5}
                              value={firstItem.star ? firstItem.star : 0}
                              half={false}
                              size={24}
                              edit={false}
                              color2={'#ffd700'}
                            />
                          </div>
                    </div>}                   
                    
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">
                      <button onClick={() => this.rewardAllNow()} className="reward-all">{this.props.data && this.props.data.length > 1 ? 'Reward All Now' :'Reward Now'}</button>
                    </div>
                </div>
            </div>
          
          </Modal>
        <Modal
          isOpen={this.state.rewardAllNow}       
          shouldCloseOnOverlayClick={false}
          className={{
            base: 'custom_Modal',
            afterOpen: this.state.rewarded ? 'custom_after-open-reward' : 'custom_after_rewardAllNow',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Example Modal"
        >
          {this.state.rewarded &&
            <form className='form-confirm'>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                  <button style={{margin: '20px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
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
            <div className="container-fluid">
            <form>
              <div className="icon-thick-delete-icon" onClick={() => this.closeRewardAllNow()} />
              <div>
                <div className="row" style={{ marginTop: '20px' }}>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                    <span>Reward Type</span>
                    {activeChallenge && activeChallenge.rewardType &&
                      <DropdownList
                        name="rewardType"
                        data={this.state.rewardType}
                        defaultValue={activeChallenge.rewardType}
                        onChange={value => this.changeValueReward(value)}
                      />
                    }
                    {activeChallenge && !activeChallenge.rewardType &&
                      <DropdownList
                        name="rewardType"
                        data={this.state.rewardType}
                        defaultValue={this.state.rewardType[1]}
                        onChange={value => this.changeValueReward(value)}
                      />
                    }
                    <p className="text-danger">{this.state.rewardTypeError}</p>
                  </div>
                  {
                    (activeChallenge && activeChallenge.rewardLevel && this.state.selectRewardType == 'Cash') &&
                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                      <span>Reward Level</span>
                      <div className="contentReward2">
                        <div className="contentData row">
                        {this.renderRewardLevel(activeChallenge.rewardLevel)}                      
                        </div>
                      </div>
                    </div> 
                  }
                  {
                    (activeChallenge && this.state.selectRewardType == 'Coupon') &&
                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                      <Field name="code" type="text" className="customReward"
                      label="Coupon code" 
                      component={renderField} />
                    </div> 
                  }
                  {(activeChallenge && !activeChallenge.rewardLevel && this.state.selectRewardType == 'Cash') &&
                      <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                      <InputMask mask="$9999999" maskChar={null} className="customReward" 
                        placeholder="Custom reward level" readOnly={this.state.selectRewardLevel ? true : false} 
                        onChange={this.onChangeTotalBudget} /> 
                        <p className="text-danger">{this.state.customError}</p>              
                    </div>
                  }
                   {(activeChallenge && activeChallenge.rewardLevel && this.state.selectRewardType == 'Cash') &&
                <div className="row">
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 pull-right reward-label">
                    <InputMask mask="$9999999" maskChar={null} className="customReward" 
                      placeholder="Custom reward level" readOnly={this.state.selectRewardLevel ? true : false} 
                      onChange={this.onChangeTotalBudget} /> 
                      <p className="text-danger">{this.state.customError}</p>              
                  </div>
                </div>
                }              
                  {/* {(activeChallenge && !activeChallenge.rewardType && this.state.selectRewardType == 'Cash') &&
                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 pull-right reward-label">
                      <InputMask mask="$9999999" maskChar={null} className="customReward" 
                        placeholder="Custom reward level" readOnly={this.state.selectRewardLevel ? true : false} 
                        onChange={this.onChangeTotalBudget} /> 
                        <p className="text-danger">{this.state.customError}</p>              
                    </div>
                  } */}
                  {/* {(activeChallenge && !activeChallenge.rewardType && this.state.selectRewardType == 'Coupon') &&
                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 pull-right reward-label">
                      <Field name="code" type="text" className="customReward"
                      label="Coupon code" 
                      component={renderField} />              
                    </div>
                  } */}                  
                </div>               
                <div className="row endline" style={{ marginTop: '20px', marginBottom: '5px', height: '30px' }}>
                  <div className="col-md-6 col-lg-6 col-sm-6 col-xs-12">
                      <p className="text-danger">{this.state.errorReward}</p>
                  </div>
                  <div className="col-md-6 col-lg-6 col-sm-6 col-xs-12 reward-multi">
                  {this.state.selectRewardType == 'Coupon' && 
                    <span className="btn-rewardLater" style={disableButtonRewardStyle} onClick={() => this.rewardNow('Later')}>Reward Later</span>
                  }
                    <span className="btn-rewardNow"  style={disableButtonNextStyle} onClick={() => this.rewardNow('Now')}>Reward Now</span>
                  </div>                 
                </div>
              </div>
            </form>
            </div>
          }
        </Modal>
        <Modal
          isOpen={this.state.isNotFullList}          
          shouldCloseOnOverlayClick={false}
          className={{
            base: 'customConfirm_Modal',
            afterOpen: 'custom_after_isNotFullList',
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
            <div className="icon-thick-delete-icon" onClick={this.closeisNotFullList} />
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button key="buttonCloseWarning" style={{margin: '10px'}} className="btn btn-warning btn-circle btn-lg" type="button"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></button>
              </div>
            </div>            
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Please fill coupon code for all contents</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
}
RewardMultiUpload = reduxForm({
  form: 'previewContent',
  validate
})(RewardMultiUpload);