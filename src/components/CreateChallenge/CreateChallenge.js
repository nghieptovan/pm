import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import _ from 'lodash';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm, normalizeSlash } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ChallengeActions from '../../redux/actions/challenge';
import * as ClientActions from '../../redux/actions/client';
import * as AuthActions from '../../redux/actions/auth';
import Dropzone from 'react-dropzone';
import Multiselect from 'react-widgets/lib/Multiselect'
import 'react-widgets/lib/scss/react-widgets.scss';
import dataConfig from '../../utils/config';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import facebookLogo from '../../assets/img/facebook-logo.png';
import twitterLogo from '../../assets/img/twitter-logo.png';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { TagBox } from 'react-tag-box';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactLoading from 'react-loading';
import classNames from 'classnames';
import CurrencyInput from 'react-currency-input';
import InputMask from 'react-input-mask';
import {hostname} from '../../config';
const validate = values => {
  return validateChallengeForm(values, false);
};

const selector = formValueSelector('challengeCreate');

@connect(
  state => ({
    challenge: state.challenge,
    client: state.client,
    auth: state.auth,
    fields: selector(state, 'challengeName', 'description', 'startDate', 'endDate', 'rewardType', 'socialPost')
    // socialPostContent: selector(state, 'socialPostContent'),   
  }),
  ({
    createChallenge: (input, token) => ChallengeActions.createChallenge(input, token),
    changeFieldValue: (field, value) => change('challengeCreate', field, value),
    getTwitter: (access_token, clientId) => AuthActions.getTwitter(access_token, clientId),
    postTwitter: (access_token, clientId) => ClientActions.postTwitter(access_token, clientId),
    postFacebook: (token, facebookToken, facebookContent) => ClientActions.postFacebook(token, facebookToken, facebookContent),
    getSocialMediaFacebook: (clientId, token, facebook_token) => ClientActions.getSocialMediaFacebook(clientId, token, facebook_token),
  }
  )
)
export default class CreateChallenge extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      defaultModalStatus: true,
      isAddedSuccessfullyModal: false,
      openCreateChallenge: false,
      error: '',
      openSideBar: false,
      name: '',
      status: '',
      imageContent: '',
      imageFileName: '',
      defaultImage: '',
      currentStep: 1,
      isBack: false,
      disableOverlay: false,
      clickCreate: false,
      titleStep: 'Challenge Details',
      rewardType: [
        { id: '1', value: 'Coupon' },
        { id: '2', value: 'Cash' }
      ],
      rewardLevel: [
      ],
      defaultRewardLevelCreate: dataConfig.dataRewardLevel.slice(0),
      userData: null,
      isShared:false,
      tags: [],
      tag: '',
      hashTags: '',
      loadingUpload: false,
      listPageFacebook: [],
      listSelected: [],
      errorTag: '',
      errorTags: '',
      loadingUpload: false,
      numberValueTotal: 0,
      requiredSocial: '',
      totalBudget: null
    });
  }
  static propTypes = {
    closeModal: PropTypes.func,
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
    clickDatePicker: PropTypes.func
  }
  componentWillMount(){
    const { facebookName, facebookPhoto, facebookToken, token, clientId, twitterName, twitterPhoto } = getCurrentUser();
    if(facebookName && facebookPhoto && facebookToken){
      const userData = {name: facebookName, picture: facebookPhoto, token: facebookToken};
      this.setState({userData: userData});
      this.props.getSocialMediaFacebook(clientId, token, facebookToken);
    }
    if(twitterName && twitterPhoto){
      const twitterData = {name: twitterName, picture: twitterPhoto};
      this.setState({twitterData: twitterData, postT: true});
      this.props.getTwitter(token,clientId);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { challenge: nextChallenge, auth: nextAuth, client: nextClient } = nextProps;
    const { challenge, auth, client } = this.props;
    const { getSocialMedia: nextSocialMedia , socialMediaResult: nextMediaResult} = nextProps.client;
    const { getSocialMedia: thisSocialMedia } = this.props.client;
    let postFacebookSuccess = nextProps.client.facebookContent && this.props.client.postFacebook !== nextProps.client.postFacebook;
    let postTwitterSuccess =nextProps.client.twitterContent && this.props.client.postTwitter !== nextProps.client.postTwitter;
    if((!this.props.fields.socialPost || this.props.fields.socialPost == '') && this.state.requiredSocial){
      this.setState({requiredSocial: 'Please fill in social post content'});
    }else{
      this.setState({requiredSocial: ''});
    }
    nextProps.client.socialError ?  
    this.setState({socialError: nextProps.client.socialError, clickShare: false}) : 
    (postFacebookSuccess || postTwitterSuccess ? this.showShared() :'');
    if(auth.login !== nextAuth.login && nextAuth.loginInfo){
      let dbData = nextAuth.loginInfo;
      let twitterData = { name: dbData.username, picture: dbData.profileImage};
    }    
    if (nextSocialMedia !== thisSocialMedia && nextSocialMedia === 1)
      {
        let listSelected = []
        nextMediaResult.map( data => {
            data.selected ? listSelected.push(data) : '';            
        })             
        this.setState({listPageFacebook: nextMediaResult, listSelected: listSelected});        
      }
    if (this.state.totalBudgetError || this.state.rewardTypeError || this.state.rewardLevelError) {
      nextProps.fields.rewardLevel = this.state.rewardLevel;
      this.checkCondition(nextProps.fields);
    }
    if (client.loadingPostTW !== nextClient.loadingPostTW && nextClient.loadingPostTW === 1){      
      this.setState({ loadingUpload: true });
    } 
    if (client.loadingPostTW !== nextClient.loadingPostTW && nextClient.loadingPostTW === 2){      
      this.setState({ loadingUpload: false });
    } 
    if (client.loadingPostFB !== nextClient.loadingPostFB && nextClient.loadingPostFB === 1){      
      this.setState({ loadingUpload: true });
    } 
    if (client.loadingPostFB !== nextClient.loadingPostFB && nextClient.loadingPostFB === 2){      
      this.setState({ loadingUpload: false });
    }   
    if (nextChallenge.createChallengeStatus !== challenge.createChallengeStatus && nextChallenge.createChallengeStatus === 1){      
      this.setState({ loadingUpload: true });
    }    
    if (nextChallenge.createChallengeStatus !== challenge.createChallengeStatus && nextChallenge.createChallengeStatus === 2) {
      if(nextChallenge.createdChallenge){
        this.setState({ loadingUpload: false });
        this.showAddedSuccessfullyModal();
      }
      if (nextChallenge.error) {
        let step;
        this.state.currentStep === 1 ? step = 1 : step = 2;
        if (this.state.isBack) {
          this.setState({ error: '', currentStep: step, clickCreate: false, loadingUpload: false });
        } else {
          this.setState({ error: nextChallenge.error, currentStep: step, clickCreate: false, loadingUpload: false });
        }
      }

    }   
  }
  closeModal = () => {
    this.props.reset();
    this.props.closeModal();
    let {defaultRewardLevelCreate} = this.state;
    _.forEach(defaultRewardLevelCreate, (value) => {
      value.active = false;
    });
    this.setState({ totalBudgetError: '', rewardLevelError: '', rewardTypeError: '', defaultRewardLevelCreate, rewardTypeSelect: null})
    if (this.state.currentStep === 3) {
      browserHistory.push(`/client/${this.props.shortName}/challenges`);
    }
  };
  
  afterOpenModal = () => {
    let {defaultRewardLevelCreate} = this.state;
    _.forEach(defaultRewardLevelCreate, (value) => {
      value.active = false;
    });
    this.props.reset();
    this.setState({
      defaultModalStatus: true,
      error: '',
      totalBudgetError: '',
      rewardTypeError: '',
      rewardLevelError: '',
      currentStep: 1,
      titleStep: 'Challenge Details',
      imageFileName: '',
      rewardLevel: [],
      defaultImage: '',
      defaultRewardLevelCreate,
      tags: [],
      tag: '',
      numberValueTotal: 0,
      totalBudget: ''
    });
    this.props.changeFieldValue('challengeName', '');
    this.props.changeFieldValue('description', '');
    this.props.changeFieldValue('startDate', moment().format('MM-DD-YYYY'));
  };
  renderDefaultRewardLevel = (data) => {    
    return (
      <div className="multiselect-tag" key={data.id} >
        {this.state.rewardTypeSelect != 'Coupon' ? <span onClick={() => this.addRewardLevel(!data.active ? data : '')}> {!data.active ? data.value : ''}
          {data.active && <i className="icon-check-icon"></i>}
        </span> :
      <span>{!data.active ? data.value : ''}
      {data.active && <i className="icon-check-icon"></i>}
    </span>}
      </div>
    )
  }
  updateStep = (step) => {
    if (step === 1 && this.state.error) {
      this.setState({ titleStep: 'Challenge Details', currentStep: step, isBack: true });
    } else if (step === 1) {
      this.setState({ titleStep: 'Challenge Details', currentStep: step });
    }
    if (step === 2 && this.state.isBack) {
      this.setState({ titleStep: 'Challenge Reward Details', currentStep: step, isBack: false });
    } else if (step === 2) {
      this.setState({ titleStep: 'Challenge Reward Details', currentStep: step })
    }
    step === 3 ? this.setState({ titleStep: 'Social Media Share', currentStep: step }) : '';
  }
  renderRewardLevel = (data) => {
    return (
      <div className="multiselect-tag" key={data.id}>
        <span>{data.value}</span>
        <div>
          {this.state.rewardTypeSelect != 'Coupon' &&
          <button type="button" className="btn" onClick={() => this.removeRewardLevel(data)}>
            <span aria-hidden="true">×</span>
          </button>
          }
        </div>
      </div>
    )
  }

  openDropdownList = (e) => {
    e.preventDefault();
    this.setState({ openDropdown: true });
  }
  openDropdownExport = (e) => {
    e.preventDefault();
    this.setState({ openDropdownEx: true });
  }
  openSideBar = () => {
    let status = !this.state.clickToLogo;
    this.setState({ clickToLogo: status });
    this.props.actionSideBar(status);
  }

  openCalendar = () => {
    this.setState({ isOpen: !this.state.isOpen });
  }
  handleclickDatePicker = () => {
    const clickToicondate = this.refs.icondate;
    clickToicondate.onInputClick();
  }
  onDrop = (files, type) => {
    const fileType = files[0].type.split('/')[0];
    if(fileType === 'image'){
      this.setState({ fileTypeError: '' });
      let reader = new FileReader();
      reader.readAsDataURL(files[0]);      
      reader.onload = () => {
        this.setState({ imageContent: reader.result.split(',')[1], imageFileName: files[0].name, defaultImage: `${files[0].preview}` })
      };
    }else{
      this.setState({ fileTypeError: 'Please upload image.' });
    }
  }
  updateDefaultRewardLevelCreate = (data, type) => {
    let { defaultRewardLevelCreate } = this.state;
    const index = _.findIndex(defaultRewardLevelCreate, {id: data.id});
    defaultRewardLevelCreate[index].active = type;
    // update state
    this.setState({
      defaultRewardLevelCreate,
    });
    
  }
  removeRewardLevel = (data) => {    
    let { numberValueTotal } = this.state;

    this.updateDefaultRewardLevelCreate(data, false);
    numberValueTotal -= data.numberValue;

    let beforeRemove = this.state.rewardLevel;
    let index = _.findIndex(beforeRemove, { id: data.id });
    let removeData = beforeRemove.splice(index, 1);
    this.setState({ rewardLevel: beforeRemove, numberValueTotal });
  }
  addRewardLevel = (data) => {
    let { numberValueTotal } = this.state;
    if(data){
      numberValueTotal += data.numberValue;
      this.updateDefaultRewardLevelCreate(data, true);
      this.setState({ numberValueTotal, rewardLevel: [...this.state.rewardLevel, data] }, () => { 
        if(this.state.rewardLevelError || this.state.totalBudgetError || this.state.rewardTypeError){      
          let values = {
            rewardLevel: this.state.rewardLevel,
            rewardType: this.props.fields.rewardType,
            totalBudget: this.state.totalBudget
          };
          this.checkCondition(values);        
        }
      });
    }
    
  }

  checkCondition = (data) => {
    const mobilePattern = new RegExp(/^\d+$/);
    let returnData = true;
    let errorStr = 'This field is required!';
    if(!data.tags || data.tags.length == 0){
      returnData = false;
      this.setState({ errorTag: errorStr });      
    } else{
      this.setState({ errorTag: '' });
    }
    if (!data.rewardType) {
      returnData = false;
      this.setState({ rewardTypeError: errorStr });
    } else {
      this.setState({ rewardTypeError: '' });
    }
    if ((typeof(data.totalBudget) == 'undefined' ||typeof(data.totalBudget) == 'object')&& !data.totalBudget) {
      returnData = false;
      this.setState({ totalBudgetError: errorStr });
    } else if (!mobilePattern.test(data.totalBudget)) {
      returnData = false;
      this.setState({ totalBudgetError: 'Total budget contains only digits!' });
    } else if(data.totalBudget < 0){
      returnData = false;
      this.setState({ totalBudgetError: 'Total budget >=0' });
    // }else if(data.rewardType.value == 'Cash' && data.totalBudget < this.state.numberValueTotal){
    //   this.setState({ totalBudgetError: 'Total budget must be over $' + this.state.numberValueTotal });
    //   returnData = false;
    } else {
        this.setState({ totalBudgetError: '' });      
      }    
    if (this.state.rewardTypeSelect == 'Cash' && !data.rewardLevel) {
      returnData = false;
      this.setState({ rewardLevelError: errorStr });
    }else {
      this.setState({ rewardLevelError: '' });      
    }    
    return returnData;
  }

  handleCreate = (e, type) => {
    e.preventDefault();   
    if (this.props.valid) {
      const { shortName, fields } = this.props;
      let rewardLevel;
      
      // Use map
      this.state.rewardLevel.map((reward, i) => {
        i === 0 ? rewardLevel = reward.value : rewardLevel += "," + reward.value;
      })
      fields.rewardLevel = rewardLevel;
      fields.tags = this.state.tags;
      fields.totalBudget = this.state.totalBudget;
      let tags = this.state.tags ? this.state.tags[0] : '';
      this.state.tags ? this.state.tags.map(data => {
          data != tags ? tags += '===' + data : ''          
      }) : ''     
      const isOk = this.checkCondition(fields);
      if (isOk) {
        const dataInput = {
          name: fields.challengeName.trim(),
          description: fields.description ? fields.description.trim(): '',
          startDate: moment(fields.startDate, "MM-DD-YYYY").format('x'),
          endDate: moment(fields.endDate, "MM-DD-YYYY").format('x'),
          imageContent: this.state.imageContent,
          imageFileName: this.state.imageFileName.replace(/\s/g, ''),
          rewardType: fields.rewardType.value,          
          totalBudget: this.state.totalBudget,
          // socialPostContent: socialPostContent,
          entribeUri: "/" + this.props.shortName.replace(/\s/g, '') + '/'+encodeURIComponent(this.props.fields.challengeName.trim().replace(/\s/g, '').replace(/\./g, 'dotC'))+'/detail',
          status: type,
          hashtags: tags
        }
        this.state.rewardTypeSelect == 'Cash' ? dataInput.rewardLevel = rewardLevel : '';
        this.props.createChallenge(dataInput, getCurrentUser().token);
        this.setState({ name: fields.challengeName, status: type, clickCreate: true });
      }
    }
  }
  showAddedSuccessfullyModal = () => {
    this.setState({ isAddedSuccessfullyModal: true });
    this.startTimer();
  }
  showShared = () => {
    this.setState({ isShared: true });
    this.startTimer2();
  }
  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {
        this.setState({ isAddedSuccessfullyModal: false, error: '', clickCreate: false });
        if (this.props.challenge.createdChallenge.status === 'SAVED') {
          if (!this.props.isDashboard) {
            this.props.changeChallengeType('SAVED')
            this.closeModal();
          } else {
            sessionStorage.setItem('isDashboard', this.props.isDashboard);
            browserHistory.push(`/client/${this.props.shortName}/challenges`);
          }
        } else if( this.props.challenge.createdChallenge.status === 'LIVE' ) {
          !this.props.isDashboard ? this.props.changeChallengeType('LIVE') : '';
          if (this.state.currentStep === 2) {
            this.updateStep(3);
            this.setState({ disableOverlay: false });
            // this.closeModal();
          }
        }
        else  if (this.props.challenge.createdChallenge.status === 'COMPLETED') {
          if (!this.props.isDashboard) {
            this.props.changeChallengeType('COMPLETED')
            this.closeModal();
          } else {
            sessionStorage.setItem('isDashboard2', this.props.isDashboard);
            browserHistory.push(`/client/${this.props.shortName}/challenges`);
          }
        }
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  startTimer2 = () => {
    this.setState({ timeCountDown: 2000 });
    let intervalId = setInterval(() => {
      if (this.state.timeCountDown < 0) {        
        this.setState({ isShared: false, socialError: '', clickShare: false }); 
        this.closeModal();
        browserHistory.push(`/client/${this.props.shortName}/challenges`);       
        clearInterval(intervalId);
      } else {
        let _timeCountDown = this.state.timeCountDown - 500;
        this.setState({ timeCountDown: _timeCountDown });
      }
    }, 500);
  }
  pageSelected = (value) => {
    this.setState({ listSelected: value })
  }
  handleShare = (e) => {
    e.preventDefault();
    const { token, clientId } = getCurrentUser();
    let listPages = [];
    if(!this.props.fields.socialPost || this.props.fields.socialPost == ''){
      this.setState({requiredSocial: 'Please fill in social post content'});
    }else{
    if(this.state.listSelected && this.state.listSelected.length > 0){
      this.state.listSelected.map( data => {
        let page = { name: data.name, pageId: data.pageId};
        listPages.push(page);
      })
      let facebookContent = {
        challengeId: this.props.challenge.createdChallenge.id, 
        listPages: listPages, 
        socialPostContent: this.props.fields.socialPost,
        entribeUri: "/" + this.props.shortName.replace(/\s/g, '') + '/'+encodeURIComponent(this.props.fields.challengeName.trim().replace(/\s/g, '').replace(/\./g, 'dotC'))+'/detail',
        embeddedCode: `testing`
      }
      this.props.postFacebook(token, this.state.userData.token, facebookContent);
    }
    if(this.refs.twitter.checked){
      let twitterContent = {
        challengeId: this.props.challenge.createdChallenge.id,          
        message: this.props.fields.socialPost,       
        clientId: clientId
      }
      this.props.postTwitter(token, twitterContent);
    }
    this.setState({clickShare: true, requiredSocial: ''});
  }
  }
  renderListPage = (page, index) =>{
    return (
        <div className="page-facebook page-content" key={index}>
        <div className="left-side">
          <Checkbox value={page}/>
          <img src={page.pagePicture} />      
          <span>{page.name}</span>          
        </div>
      
    </div>
    )
  }
  onChangeInput = tag => {
    tag.length > 20 ? this.setState({errorTag: 'Length of tag should be less than 20 characters.'}) : this.setState({errorTag: '', tag});
  }

  handleChange = (data) => {   
    const {tags, tag } = this.state;    
    const index = _.findIndex(tags, function(x) { return x.toLowerCase()=== tag.toLowerCase(); })
    if(index >= 0){ 
      this.setState({errorTags: 'Tag is duplicate.'});
    } else {
      data.length > 6 ? this.setState({errorTags: 'Maximum tags is 6.'} ) : this.setState({tags: data, errorTags: ''});
    }
  }  
  
  handleAll = () => {
   this.refs.all.checked ? this.setState({listSelected: this.state.listPageFacebook}) : this.setState({listSelected: []});
  }  
  handleTwitter = () => {
    this.refs.twitter.checked ? this.setState({postT: true}) : this.setState({postT: false});
  }
  onChangeTotalBudget = (event) => {
    const value = event.target.value;
    const totalBudget = value.split('$')[1];
    this.setState({totalBudget});
  }
   handleRewardType = (value )=>{
    this.setState({rewardTypeSelect: value.value})
}
  render() {   
   const { facebookToken } = getCurrentUser();
    const { valid, pristine } = this.props;
    let disableButtonNextStyle = { cursor: 'pointer' };
    let disableButtonSaveStyle = { cursor: 'pointer' };
    let disableButtonLiveStyle = { cursor: 'pointer' };
    let disableButtonBackStyle = { cursor: 'pointer' };
    let disableButtonShareStyle = { cursor: 'pointer' };
    disableButtonSaveStyle.marginRight = '20px';
    disableButtonBackStyle.marginRight = '20px';
    disableButtonLiveStyle.background = '#14974D';
    disableButtonShareStyle.marginRight = '20px';
    if (!valid || pristine) {
      disableButtonNextStyle.opacity = 0.5;
      disableButtonNextStyle.pointerEvents = 'none';
    }
    if (this.state.clickCreate) {
      disableButtonSaveStyle.opacity = 0.5;
      disableButtonLiveStyle.opacity = 0.5;
      disableButtonBackStyle.opacity = 0.5;
      disableButtonBackStyle.pointerEvents = 'none';
      disableButtonSaveStyle.pointerEvents = 'none';
      disableButtonLiveStyle.pointerEvents = 'none';
    }
    if (this.props.fields.startDate && this.props.fields.endDate && this.props.fields.endDate == this.props.fields.startDate){
      disableButtonLiveStyle.opacity = 0.5;
      disableButtonLiveStyle.pointerEvents = 'none';
    }
    if(new Date(this.props.fields.startDate).getTime() > new Date(moment(new Date()).format("MM-DD-YYYY")).getTime()) {
      disableButtonLiveStyle.opacity = 0.5;
      disableButtonLiveStyle.pointerEvents = 'none';
    }
    if((this.props.fields.socialPost && this.props.fields.socialPost.length > 140) || this.state.clickShare || (this.state.listSelected.length == 0 &&  !this.state.postT)){
      disableButtonShareStyle.opacity = 0.5;
      disableButtonShareStyle.pointerEvents = 'none';
    }
    return (
      <div>
        <Modal
          isOpen={this.props.openCreateChallenge}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={this.state.disableOverlay}
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

          <div className="text-center" style={{height: '50px', lineHeight: '50px', marginBottom: '5px'}}>
            <span className="edit-client">{this.state.titleStep}</span>
          </div>
          <div className="icon-thick-delete-icon" onClick={this.closeModal} />
          <div className="container-fluid" style={{marginTop: '5px'}}>
            <form>
              <div className={this.state.currentStep === 1 ? 'showStep' : 'hiddenStep'}>
                <div className="row">
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                    <Field name="challengeName" type="text"
                      label="Name of the challenge"
                      autoFocus={true}
                      component={renderField}
                      normalize={normalizeSlash}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '120px' }}>
                    <Field name="description" type="text"
                      label="Description(250 words Max)"
                      className="descriptionField"
                      component={renderTextArea}
                    />
                  </div>
                </div>
                <div className="row" style={{ height: '130px' }}>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-6 col-xs-6">
                    <div className="row">
                      <div className="inputrow2 col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '60px' }}>
                        <Field
                          name="startDate"
                          label='Start Date'
                          component={DatePickerCustom} />
                      </div>
                    </div>
                    <div className="row">
                      <div className="inputrow2 col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '60px' }}>
                        <Field
                          name="endDate"
                          label='End Date'
                          component={DatePickerCustom} />
                      </div>
                    </div>
                  </div>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-6 col-xs-6">
                    <div className="row">
                      <Dropzone onDrop={(files) => this.onDrop(files)} className="inputImage">
                        <div className="iconUpload">
                          <span className="nameFile">{this.state.imageFileName === '' ? 'Upload Challenge Image' : this.state.imageFileName}</span>
                          <span className="chooseFile">Browse</span>
                        </div>                        
                      </Dropzone>
                      <p className="text-danger">{this.state.fileTypeError}</p>
                    </div>
                    <div className="row">
                      {this.state.defaultImage && <div><img style={{ height: '60px', width: '60px' }} src={this.state.defaultImage} /></div>}
                    </div>
                  </div>
                </div>
                <div className="row" style={{ marginTop: '20px' }}>
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                    <span className="btn-create" style={disableButtonNextStyle} onClick={() => this.updateStep(2)}>Next</span>
                    {/* <span className="btn-create" onClick={() => this.updateStep(2)}>Next</span> */}
                  </div>
                </div>
              </div>

              <div className={this.state.currentStep === 2 ? 'showStep' : 'hiddenStep'}>

                <div className="row" style={{ marginTop: '20px' }}>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                    <Field
                      name="rewardType"
                      label="Reward Type"
                      component={renderDropdownList}
                      data={this.state.rewardType}
                      valueField="value"
                      textField="value"
                      onChange={value => this.handleRewardType(value)} />
                    <p className="text-danger">{this.state.rewardTypeError}</p>
                  </div>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                    <InputMask mask="$9999999" maskChar={null} placeholder="Total Budget" onChange={this.onChangeTotalBudget} />
                    <p className="text-danger">{this.state.totalBudgetError}</p>
                  </div>

                </div>
                {this.state.rewardTypeSelect != 'Coupon' && 
                <div className="row" style={{ height: 'auto', marginTop: '5px' }}>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12" style={{ height: '70px' }}>
                    <span>Reward Level</span>
                    <div className="contentReward2">
                      <div className="contentData row">
                        {this.state.defaultRewardLevelCreate && this.state.defaultRewardLevelCreate.map(this.renderDefaultRewardLevel, this, '')}
                      </div>
                    </div>            

                  </div>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12" style={{ height: 'auto' }}>
                    <div className="resultReward scroll-peihgn">
                      {this.state.rewardLevel && this.state.rewardLevel.map(this.renderRewardLevel, this, '')}
                    </div>
                    <p className="text-danger">{this.state.rewardLevelError}</p>
                  </div>
                </div>
                }               

                <div className="row" style={{ height: 'auto' }}>
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                    <div className="hashtag">
                      <TagsInput value={this.state.tags} inputValue={this.state.tag} onChangeInput={this.onChangeInput} onChange={this.handleChange} inputProps={{placeholder: "Add up to 6 hashtags recommendation"}} />                      
                    </div>
                    <p className="text-danger">{this.state.errorTag || this.state.errorTags}</p>
                  </div>
                </div>
                <div className="row" style={{ height: '30px', marginTop: '15px' }}>
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                    <p className="text-danger">{this.state.error}</p>
                  </div>
                </div>               
                <div className="row endline" style={{ marginTop: '10px' }}>               
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                    {/* <span className="btn-create" style={disableButtonStyle} onClick={() => this.updateStep(2)}>Next</span> */}
                    <span className="btn-create" style={disableButtonLiveStyle} onClick={(e) => this.handleCreate(e, 'LIVE')} >Go Live</span>
                    <span className="btn-create" style={disableButtonSaveStyle} onClick={(e) => this.handleCreate(e, 'SAVED')}>Save</span>
                    <span className="btn-create" style={disableButtonBackStyle} onClick={() => this.updateStep(1)}>Back</span>
                  </div>
                </div>
              </div>

              <div className={this.state.currentStep === 3 ? 'showStep' : 'hiddenStep'}>
                <div className="row social-share-row">
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 nopadding50 leftEmbedded" style={{ height: '135px', top: '30px', marginTop: '40px' }}>
                    <Field name="socialPost" type="text"
                      label="Social Media Post Content(140 words Max)"
                      autoFocus={true}
                      className="embeddedField"
                      component={renderTextArea}
                      readOnly ={this.state.listPageFacebook.length > 0 || this.state.twitterData ? false : true}
                    />
                    <p className="text-danger">{this.state.requiredSocial}</p>
                  </div>
                  <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12 nopadding50" style={{ height: '160px', marginTop: '40px' }}>
                    <label style={{ width: '100%', textAlign: 'center' }}>Embedded Code</label>
                    <div className="embeddedInfo scroll-peihgn rightEmbedded">
                      {this.props.challenge.createdChallenge && this.props.challenge.createdChallenge.embeddedCode}
                  </div>
                  </div>
                </div> 
                <div className="row social-share-row">                  
                  <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12 left-social-row">
                    <label className="social-title">Configured Social Media</label>
                    <div className="social-config">                     
                      <Scrollbars autoHide style={{ height: 140 }}>  
                      <div style={{ display: 'flex' }}>
                      {this.state.listPageFacebook && facebookToken ?                 
                          <div className="list-page" style={{width: '50%'}}>    
                                  <div className="page-facebook">
                                    <div className="left-side">
                                      <input type='checkbox' ref='all' checked={(this.state.listSelected && this.state.listSelected.length > 0) ? true : false} onChange={this.handleAll}/>
                                      <img src={facebookLogo} />                
                                    </div>                                 
                                  </div>                        
                                <CheckboxGroup
                                name="facebook"
                                onChange={this.pageSelected}
                                value={this.state.listSelected}>
                                    {this.state.listPageFacebook.map(this.renderListPage, this, '')}   
                                </CheckboxGroup>                           
                          </div> : <div></div>
                        }
                        {this.state.twitterData ?
                        <div className="list-page" style={{width: '50%'}}>    
                          <div className="page-facebook">
                            <div className="left-side">
                              <input type='checkbox' ref='twitter' checked={this.state.postT ? true : false} onClick={this.handleTwitter}/>
                              <img src={twitterLogo} />                                           
                            </div>                                                          
                          </div> 
                          <div className="page-facebook page-content">
                            <div className="left-side">                        
                              <img src={this.state.twitterData.picture} />      
                              <span>{this.state.twitterData.name}</span>          
                            </div>      
                          </div> 
                        </div> : <div></div>}
                        </div>
                      </Scrollbars>                      
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12 left-social-row">
                    <label className="entribe-uri">{this.props.challenge.createdChallenge && `${window.location.protocol}//${window.location.hostname}${this.props.challenge.createdChallenge.entribeUri}`}</label>   
                  </div>
                  <div className="account-error col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  {this.state.twitterData ? <div></div> : <div>Please config Twitter account in settings first</div>}
                  {this.state.listPageFacebook && facebookToken ? <div></div> : <div>Please config Facebook account in settings first</div>}
                  </div>
                </div>
                 
                <div className="row social-error">
                {this.state.socialError &&                
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12">                    
                    {this.state.socialError}
                  </div>
                }
                </div>                              
                <div className="row">
                  <div className="col-md-12 col-lg-12 col-sm-12">
                    <span className="btn-create" style={disableButtonShareStyle} onClick={(e) => this.handleShare(e)}>Share</span>
                  </div>
                </div>
              </div>
              {this.state.loadingUpload && 
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }
            </form>
          </div>
        </Modal>
        <Modal
          isOpen={this.state.isAddedSuccessfullyModal}
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
                <span className='title-confirm-popup'>{this.state.name + " challenge " + (this.state.status === 'LIVE' ? "is now Live" : "is saved")}</span>
              </div>
            </div>
          </form>
        </Modal>
        <Modal
          isOpen={this.state.isShared}
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
                <span className='title-confirm-popup'>{this.state.name + " challenge has been shared on selected social networks!"}</span>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
}
CreateChallenge = reduxForm({
  form: 'challengeCreate',
  validate
})(CreateChallenge);