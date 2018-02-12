import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
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
import '../Admin/AdminList.scss';
import { Scrollbars } from 'react-custom-scrollbars';
import { b64toBlob } from './../../utils/common';
import { Link } from 'react-router';
import logoImg from '../../assets/logologin.png';
import defaultshoe from '../../assets/img/no-img.png';
import imgItem from '../../assets/img/no-img.png';
import OwlCarousel from 'react-owl-carousel';
import DataMap2 from '../../utils/config';
import './ChallengesList.scss';
import ReactStars from 'react-stars';
import LazyLoad from 'react-lazy-load';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import facebookLogo from '../../assets/img/facebook-logo.png';
import twitterLogo from '../../assets/img/twitter-logo.png';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { TagBox } from 'react-tag-box';
import {s3URL} from '../../config';
import ReactLoading from 'react-loading';
import InputMask from 'react-input-mask';
import PreviewUpload from '../Upload/PreviewUpload';
const validate = values => {
    return validateChallengeForm(values, true);
};

const selector = formValueSelector('createChallenge');

@connect(
    state => ({
        challenge: state.challenge,
        client: state.client,
        auth: state.auth,
        fields: selector(state, 'challengeName', 'description', 'startDate', 'endDate', 'rewardType', 'socialPost', 'status')
        // socialPostContent: selector(state, 'socialPostContent'),   
    }),
    ({
        editChallenge: (input, token) => ChallengeActions.editChallenge(input, token),
        changeStatusChallenge: (id, status, token, access_time) => ChallengeActions.changeStatusChallenge(id, status, token, access_time),
        changeFieldValue: (field, value) => change('createChallenge', field, value),
        getTwitter: (access_token, clientId) => AuthActions.getTwitter(access_token, clientId),
        postTwitter: (access_token, clientId) => ClientActions.postTwitter(access_token, clientId),
        postFacebook: (token, facebookToken, facebookContent) => ClientActions.postFacebook(token, facebookToken, facebookContent),
        getSocialMediaFacebook: (clientId, token, facebook_token) => ClientActions.getSocialMediaFacebook(clientId, token, facebook_token),
    }
    )
)

export default class ChallengesList extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            defaultModalStatus: true,
            isEditedSuccessfullyModal: false,
            modalIsOpen: false,
            error: '',
            openSideBar: false,
            isOk: false,
            name: '',
            status: '',
            imageContent: '',
            imageFileName: '',
            defaultImage: '',
            currentStep: 1,
            isBack: false,
            clickEdit: false,
            titleStep: 'Basic Challenge Details',
            rewardType: [
                { id: '1', value: 'Coupon' },
                { id: '2', value: 'Cash' }
            ],
            rewardLevel: [
            ],
            defaultRewardLevel: DataMap2.dataRewardLevel2.slice(0),
            twitterData: null,        
            listSelected: [],
            listPageFacebook: [],
            tags: [],
            tag: '',
            hashTags: '',        
            shown: false,
            numberValueTotal: 0,
            defaultNote: false,
            current: null,
            requiredSocial: '',
            totalBudget: null,
            openModalPreview: false,
            currentUploadPreview: {},
            listUploads: []
        });
    }
    static propTypes = {
        listChallenges: PropTypes.array,
        goLiveStatus: PropTypes.func,
    };
    componentWillMount() {
        this.props.isSort ? this.props.sortChallenge() : '';
        const { facebookName, facebookPhoto, facebookToken, token, clientId, twitterName, twitterPhoto } = getCurrentUser();
        if (facebookName && facebookPhoto && facebookToken) {
            const userData = { name: facebookName, picture: facebookPhoto, token: facebookToken };
            this.setState({ userData: userData });
            this.props.getSocialMediaFacebook(clientId, token, facebookToken);
        }
        if (twitterName && twitterPhoto) {
            const twitterData = { name: twitterName, picture: twitterPhoto };
            this.setState({ twitterData: twitterData, postT: true });
            this.props.getTwitter(token, clientId);
        }
        
    }
    componentWillReceiveProps(nextProps) {
        const { challenge: nextChallenge, auth: nextAuth } = nextProps;
        const { challenge, auth } = this.props;
        const { getSocialMedia: nextSocialMedia , socialMediaResult: nextMediaResult} = nextProps.client;
        const { getSocialMedia: thisSocialMedia } = this.props.client;
        let postFacebookSuccess = nextProps.client.facebookContent && this.props.client.postFacebook !== nextProps.client.postFacebook;
        let postTwitterSuccess = nextProps.client.twitterContent && this.props.client.postTwitter !== nextProps.client.postTwitter;
        nextProps.client.socialError ? 
        this.setState({socialError: nextProps.client.socialError, clickShare: false}) : 
        this.state.defaultNote && nextProps.fields.description && nextProps.fields.description !== this.state.current.description ? this.setState({defaultNote: false}) : '';
        ((postFacebookSuccess || postTwitterSuccess) && !this.state.shown ? this.showShared() :'');
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
        if (nextProps.isSort) {
            nextProps.sortChallenge();
        }
        if (this.state.totalBudgetError || this.state.rewardTypeError) {
            nextProps.fields.rewardLevel = this.state.rewardLevel;
            nextProps.fields.tags = this.state.tags;
            nextProps.fields.totalBudget = nextProps.fields.totalBudget ? nextProps.fields.totalBudget :this.state.totalBudget;
            this.checkCondition(nextProps.fields);
        }
        let today = new Date();
        today.setHours(0,0,0,0);
        let startOfDay = today.getTime();
        if (moment(nextProps.fields.endDate, "MM-DD-YYYY").format('x') < startOfDay && this.state.type == 'edit') {
            this.setState({ error: "End date is in the past, can't save", isOk: false });
        } else {
            this.setState({ error: '', isOk: true });
        }

        if (nextChallenge.editChallengeStatus !== challenge.editChallengeStatus && nextChallenge.editChallengeStatus === 1){
            this.setState({ loadingUpload: true });
        }        
        if (nextChallenge.editChallengeStatus !== challenge.editChallengeStatus && nextChallenge.editChallengeStatus === 2) {
            if (nextChallenge.editedChallenge) {
                this.setState({ loadingUpload: false });                
                if ( this.state.clickLive ){
                    this.showGoLiveSuccessfullyModal() }
                else if (this.state.clickUpdate && nextChallenge.editedChallenge.status == 'LIVE' && this.state.challengeStatus == 'SAVED') {
                    this.showEditedSuccessfullyModal();  
                    this.clicktoGoLive(nextChallenge.editedChallenge)                     
                } else if (this.state.clickUpdate && nextChallenge.editedChallenge.status == 'LIVE' && this.state.challengeStatus == 'LIVE') {
                    this.showEditedSuccessfullyModal();                               
                } else if ( this.state.clickUpdate && nextChallenge.editedChallenge.status == 'COMPLETED'){
                    this.setState({status: 'COMPLETED'});
                    this.showEditedSuccessfullyModal();
                } else if(this.state.clickUpdate && nextChallenge.editedChallenge.status == 'SAVED'){ 
                    this.setState({status: 'SAVED'});
                    this.showEditedSuccessfullyModal();
                }
            }
            if (nextChallenge.error) {
                let step;
                this.state.currentStep === 1 ? step = 1 : step = 2;
                if (this.state.isBack) {
                    this.setState({ error: '', currentStep: step, clickEdit: false, loadingUpload: false });
                } else {
                    this.setState({ error: nextChallenge.error, currentStep: step, clickEdit: false, loadingUpload: false });
                }
            }
        }
    }
   
    closeModal = () => {
        let { originalRewardLevel, defaultRewardLevel} = this.state;
        let temp = _.difference(defaultRewardLevel, originalRewardLevel);
        defaultRewardLevel.map( data => {           
                data.active = false;            
        })
        this.props.reset();
        this.setState({
            modalIsOpen: false,
            rewardLevel: [],
            defaultImage: '',
            tags: [],
            tag: '',
            errorTag: '',
            errorTags: '',
            defaultNote: true,
            totalBudgetError: '',
            rewardTypeError: '',
            rewardLevelError: '',
            numberValueTotal: 0
        });
    };
    renderDefaultRewardLevel = (data) => {
        return (
            <div className="multiselect-tag" key={'addrewardlevel' + data.id} >           
                <span onClick={this.state.type === 'edit' ? () => this.addRewardLevel(!data.active ? data : '') : ''}>{!data.active ? data.value : ''}
                    {data.active && <i className="icon-check-icon"></i>}
                </span>                       
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
        const ramdomID = Math.floor(Math.random() * (10000) + 1);
        return (
            <div className="multiselect-tag" key={ramdomID}>
                <span>{data.value}</span>
               {this.state.type == 'edit' && this.state.rewardTypeSelect !='Coupon' && <div>
                    <button type="button" className="btn" onClick={() => this.removeRewardLevel(data)}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>}
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
        if (fileType === 'image') {
            this.setState({ error: '' });
            let reader = new FileReader();
            reader.readAsDataURL(files[0]);
            reader.onload = () => {
                this.setState({ imageContent: reader.result.split(',')[1], imageFileName: files[0].name, defaultImage: `${files[0].preview}` })
            };
        } else {
            this.setState({ error: 'Please upload image.' });
        }
    }
    updateDefaultRewardLevelCreate = (data, type) => {
        let { defaultRewardLevel } = this.state;
        const index = _.findIndex(defaultRewardLevel, {id: data.id});
        defaultRewardLevel[index].active = type;
        // update state
        this.setState({
            defaultRewardLevel,
        });        
    }
    removeRewardLevel = (data) => {
        this.updateDefaultRewardLevelCreate(data, false);
        let beforeRemove = this.state.rewardLevel;
        let index = _.findIndex(beforeRemove, { id: data.id });
        let numberValueTotal = this.state.numberValueTotal;
        numberValueTotal -= parseInt(data.value.substring(1));
        let removeData = beforeRemove.splice(index, 1);
        this.setState({ rewardLevel: beforeRemove, numberValueTotal });
    }
    addRewardLevel = (data) => {
        let { numberValueTotal } = this.state;        
        if(data){
            numberValueTotal += data.numberValue;
            this.updateDefaultRewardLevelCreate(data, true);
            this.setState({ numberValueTotal, rewardLevel: [...this.state.rewardLevel, data] }, () => {
                let values = {
                    rewardLevel: this.state.rewardLevel,
                    rewardType: this.props.fields.rewardType,
                    totalBudget: this.props.fields.totalBudget ? this.props.fields.totalBudget :this.state.totalBudget,
                    tags: this.state.tags
                };             
                this.checkCondition(values);
            });
        }
        
    }
    checkCondition = (data) => {
        const mobilePattern = new RegExp(/^\d+$/);
        let returnData = true;
        let errorStr = 'This field is required!';
        if(!data.tags || data.tags.length == 0){
            returnData = false;
            this.setState({ errorTag: errorStr});      
        } else{
            this.setState({ errorTag: ''});
        }
        if (!data.rewardType) {
            returnData = false;
            this.setState({ rewardTypeError: errorStr});
        } else {
            this.setState({ rewardTypeError: ''});
        }
        if ((typeof(data.totalBudget) == 'undefined' ||typeof(data.totalBudget) == 'object')&& !data.totalBudget) {
            returnData = false;
            this.setState({ totalBudgetError: errorStr });
          }  else if (!mobilePattern.test(data.totalBudget)) {
            returnData = false;
            this.setState({ totalBudgetError: 'Total budget contains only digits!' });
        }  else if (!mobilePattern.test(data.totalBudget)) {
            returnData = false;
            this.setState({ totalBudgetError: 'Total budget contains only digits!' });
          } else if(data.totalBudget < 0){
            returnData = false;
            this.setState({ totalBudgetError: 'Total budget >=0' });
        //   } else if(data.rewardType.value == 'Cash' && data.totalBudget < this.state.numberValueTotal){
        //     this.setState({ totalBudgetError: 'Total budget must be over $' + this.state.numberValueTotal });
        //     returnData = false;
          } else  {
            let returnData = true;
              this.setState({ totalBudgetError: '' });      
            } 
        if ( this.state.rewardTypeSelect == 'Cash' && !data.rewardLevel) {
            returnData = false;
            this.setState({ rewardLevelError: errorStr });
        } else {
            this.setState({ rewardLevelError: '' });
        }
        return returnData;
    }

    handleEdit = (e, type) => {
        e.preventDefault();     
        const { shortName, fields } = this.props;
        let rewardLevel;        
        this.state.rewardLevel.map((reward, i) => {
            i === 0 ? rewardLevel = reward.value : rewardLevel += "," + reward.value;
        })
        fields.rewardLevel = rewardLevel;
        fields.tags = this.state.tags;
        fields.totalBudget = this.props.fields.totalBudget ? this.props.fields.totalBudget :this.state.totalBudget;           
        let tags = this.state.tags ? this.state.tags[0] : '';
        this.state.tags ? this.state.tags.map(data => {
            data != tags ? tags += '===' + data : ''          
        }) : '' 
        const isOk = this.checkCondition(fields);
        if (isOk && this.props.valid ) {           
            const dataInput = {
                id: this.state.id,
                name: fields.challengeName.trim(),
                description: fields.description ? fields.description.trim() : '',
                startDate: moment(fields.startDate, "MM-DD-YYYY").format('x'),
                endDate: moment(fields.endDate, "MM-DD-YYYY").format('x'),                    
                rewardType: !fields.rewardType.value ? this.state.challengeRewardType : fields.rewardType.value,
                totalBudget: this.props.fields.totalBudget ? this.props.fields.totalBudget :this.state.totalBudget,
                // socialPostContent: socialPostContent,
                entribeUri: "/" + this.props.shortName.replace(/\s/g, '') + '/'+encodeURIComponent(fields.challengeName.trim().replace(/\s/g, '').replace(/\./g, 'dotC'))+'/detail',
                status: type,
                hashtags: tags
            }
            this.state.rewardTypeSelect == 'Cash' ? dataInput.rewardLevel = rewardLevel : '';
            this.state.imageContent ? dataInput.imageContent = this.state.imageContent: '';
            this.state.imageFileName ? dataInput.imageFileName = this.state.imageFileName.replace(/\s/g, ''): '';
            this.props.editChallenge(dataInput, getCurrentUser().token);        
        }
        this.setState({ name: fields.challengeName, status: type, clickUpdate: true });
    }
    showEditedSuccessfullyModal = () => {
        this.setState({ isEditedSuccessfullyModal: true });
        this.startTimer();
        }    
    showGoLiveSuccessfullyModal = () => {
        this.setState({ isGoLiveSuccessfullyModal: true, status: 'LIVE' });
        this.startTimer();
    }
    showErrorModal = () => {
        this.setState({ isErrorModal: true, status: 'SAVED' });
        this.startTimer();
    }
    startTimer = () => {
        this.setState({ timeCountDown: 2000 });
        let intervalId = setInterval(() => {
            if (this.state.timeCountDown < 0) {
                this.setState({clickUpdate: false, isEditedSuccessfullyModal: false, isGoLiveSuccessfullyModal: false, isErrorModal: false, imageFileName: '', imageContent: '' });
                this.closeModal();                
                this.state.status === 'LIVE' ? this.props.goLiveStatus() : this.props.changeChallengeType(this.state.status);
                clearInterval(intervalId);
            } else {
                let _timeCountDown = this.state.timeCountDown - 500;
                this.setState({ timeCountDown: _timeCountDown });
            }
        }, 500);
    }
    clicktoGoLive(challenge) {
        if (challenge.endDate < Date.now()) {
            this.showErrorModal()
        } else {
            this.setState({ clickLive: true, name: challenge.name, currentChallenge: challenge, loadingUpload: true });
            this.props.changeStatusChallenge(challenge.id, 'LIVE', getCurrentUser().token, Date.now());
        }
    }
    clicktoEdit(editPos, type) {
        const { listChallenges } = this.props;
        const challenge = listChallenges[editPos];
        challenge.imageUri ? this.setState({ defaultImage: s3URL + challenge.imageUri }) : '';
        const arrayTags = challenge.hashtags.split('===');
        // challenge.hashtags ? this.setState({ tags: challenge.hashtags.split(',') }) : '';
        const challengeRewardLevel = challenge.rewardLevel ? challenge.rewardLevel.replace(/\s/g, '').split(","): [];  
        let valueRewardLevelBegin = [];
        let numberValueTotal = 0;
        challengeRewardLevel.map((reward) => {
            numberValueTotal += parseInt(reward.substring(1));
            this.state.defaultRewardLevel.map((defaultValue) => {
                if(reward == defaultValue.value){
                    defaultValue.active = true;
                    valueRewardLevelBegin.push(defaultValue);                   
                }
            });
        });       
        this.setState({
            rewardTypeSelect: challenge.rewardType,
            type,
            defaultModalStatus: true,
            error: '',
            totalBudgetError: '',
            rewardTypeError: '',
            rewardLevelError: '',
            currentStep: 1,
            titleStep: 'Basic Challenge Details',
            clickEdit: true,
            imageFileName: '',
            id: challenge.id,
            clickLive: false,
            rewardLevel: valueRewardLevelBegin,
            originalRewardLevel: valueRewardLevelBegin,
            tags: arrayTags ? arrayTags : [],   
            current: challenge,
            numberValueTotal,
            totalBudget: challenge.totalBudget,
            challengeRewardType: challenge.rewardType,
            challengeStatus: challenge.status
        });
        this.props.changeFieldValue('challengeName', challenge.name);  
        this.props.changeFieldValue('status', challenge.status);    
        this.props.changeFieldValue('description', challenge.description);     
        this.props.changeFieldValue('startDate', moment(challenge.startDate).format('MM-DD-YYYY'));
        this.props.changeFieldValue('endDate', moment(challenge.endDate).format('MM-DD-YYYY'));
        if(type === 'edit' && this.props.typeChallenge=='SAVED'){
            this.props.changeFieldValue('rewardType', challenge.rewardType === 'Cash' ? this.state.rewardType[1] : this.state.rewardType[0]);
        } else {         
            this.props.changeFieldValue('rewardType', challenge.rewardType);
        }
        this.props.changeFieldValue('rewardLevel', this.state.rewardLevel);
        this.setState({ modalIsOpen: true });
    }
    handleRewardType = (value )=>{
        this.setState({rewardTypeSelect: value.value})
    }
    renderTop6Image = (data) => {
        let imageUri;
        imageUri = data.type === 'video' ? data.thumbnail : data.contentUri;
        const imagePreview = imageUri ? s3URL+imageUri : imgItem;
        return (
            <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6" key={data.id}>
                <div className="image-top-6" onClick={() => this.openPreviewUpload(data)}>
                    {data.type === 'video' && <div className="video-icon">
                        <i className="icon-play-icon"></i>
                    </div>}
                    <LazyLoad height={90} className="image">
                        <img src={imagePreview} />
                    </LazyLoad>
                    <div className="info-footer">
                        <p className="top-footer">{data.name}</p>
                        <div className="bot-footer">
                            <div className="left-side">
                                <p>{moment(data.uploadDate).format('MM/DD/YYYY')}</p>
                            </div>
                            <div className="right-side">
                                <ReactStars
                                    count={5}
                                    value={data.star}
                                    half={false}
                                    size={10}
                                    edit={false}
                                    color2={'#ffd700'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    renderItemChallenge = (challenge, data) => {
        const { shortName, typeChallenge } = this.props
        let imgUrl = '';
        challenge.imageUri ? imgUrl = s3URL + challenge.imageUri : imgUrl = imgItem;
        let imageUri;
        imageUri = challenge.type === 'video' ? challenge.imageUri : challenge.contentUri;
        const imagePreview = imageUri ? s3URL + imageUri : imgItem;
        return (            
            <div className="mt-chall-arch-list" key={challenge.id + 'propkey'}>
                <div className="row">
                    <Link to={`/client/${shortName}/challenges/${challenge.id}`}>
                    <div className="col-lg-8 col-md-8 col-sm-12 col-xs-12">
                        <div className="chall-action-buttons ">
                            <span className="btn dark-blue">
                                {challenge.name}
                            </span>
                        </div>
                        <LazyLoad height={110} className="mt-chall-img">
                            <img src={imgUrl} />
                        </LazyLoad>
                        <div className="mt-chall-body">
                            <div className="mt-comment-text">{challenge.description}</div>
                        </div>
                    </div>
                    </Link>
                    <div className="col-lg-4 col-md-4 col-sm-12 col-xs-12 counting">
                        <div className="action-area">
                            {typeChallenge === 'SAVED' &&
                                <div>
                                    <button className="btn btn-view" onClick={() => this.clicktoEdit(data,'view')}>View</button>
                                    <button className="btn btn-edit" onClick={() => this.clicktoEdit(data,'edit')}>Edit</button>
                                    <button className="btn btn-golive" onClick={() => this.clicktoGoLive(challenge)}>Go Live</button>
                                </div>
                            }
                            {typeChallenge === 'LIVE' && 
                                <div>
                                <button className="btn btn-view" onClick={() => this.clicktoEdit(data,'view')}>View</button>
                                <button className="btn btn-edit" onClick={() => this.clicktoEdit(data,'edit')}>Edit</button>
                                </div>
                            }
                            {typeChallenge !== 'LIVE' && typeChallenge !== 'SAVED' &&
                            <div>
                                    <button className="btn btn-view" onClick={() => this.clicktoEdit(data,'view')}>View</button>
                            </div>
                            }
                        </div>
                        {(typeChallenge === 'COMPLETED' || typeChallenge === 'LIVE' ) && <div>

                            <div className="row total-submissions">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.totalUploads == 0 ? '5%' : '100%') }}><span>{challenge.totalUploads}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Total submissions</div>
                            </div>

                            <div className="row reviewed">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.reviewed == 0 ? '5%' : (challenge.reviewed / challenge.totalUploads) * 100 + '%') }}><span>{challenge.reviewed}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Reviewed</div>
                            </div>

                            <div className="row pending">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.pending == 0 ? '5%' : (challenge.pending / challenge.totalUploads) * 100 + '%') }}><span>{challenge.pending}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Pending Review</div>
                            </div>

                            <div className="row rewards">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.rewards == 0 ? '5%' : (challenge.rewards / challenge.totalUploads) * 100 + '%') }}><span>{challenge.rewards}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Rewards</div>
                            </div>

                        </div>}
                        {(typeChallenge === 'ARCHIVED') && <div>

                            <div className="row total-submissions">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.totalUploads == 0 ? '5%' : '100%') }}><span>{challenge.totalUploads}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Total submissions</div>
                            </div>
                            <div className="row pending">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.creators == 0 ? '5%' : (challenge.creators / challenge.totalUploads) * 100 + '%') }}><span>{challenge.creators}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Total creators</div>
                            </div>

                            <div className="row rewards">
                                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <div className="left-side" style={{ width: (challenge.rewards == 0 ? '5%' : (challenge.rewards / challenge.totalUploads) * 100 + '%') }}><span>{challenge.rewards}</span></div>
                                </div>
                                <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 right-side pull-left">Rewards</div>
                            </div>
                        </div>}
                    </div>

                </div>
                {((typeChallenge === 'COMPLETED' || typeChallenge === 'LIVE') && challenge.highContents && challenge.highContents.length > 0) &&
                    <div className="row" style={{ margin: '20px -15px 5px -15px' }}>
                        <div className="col-lg-10 col-md-10 col-sm-8 col-xs-8">
                            <div className="row">
                                {challenge.highContents.map(this.renderTop6Image, this)}
                            </div>
                        </div>
                        {challenge.highContents.length >0 &&
                        <div className="col-lg-2 col-md-2 col-sm-4 col-xs-4">                           
                            <Link to={`/client/${shortName}/uploads/${challenge.id}`} className="btn-show-more">
                                Show More
                        </Link>
                        </div>}
                    </div>
                }
            </div>
            

        )
    }
    startTimer2 = () => {
        this.setState({ timeCountDown: 2000 });
        let intervalId = setInterval(() => {
            if (this.state.timeCountDown < 0) {
                this.setState({ isShared: false, socialError: '', clickShare: false }, this.closeModalLive);
                browserHistory.push(`/client/${this.props.shortName}/challenges`);
                clearInterval(intervalId);
            } else {
                let _timeCountDown = this.state.timeCountDown - 500;
                this.setState({ timeCountDown: _timeCountDown });
            }
        }, 500);
    }
    closeModalLive = () => {
        this.setState({clickLive: false});
        this.props.reset();
    }
    pageSelected = (value) => {
        this.setState({ listSelected: value })
    }
    handleShare = (e) => {
        e.preventDefault();
        const { token, clientId } = getCurrentUser();
        let listPages = [];
        if (!this.props.fields.socialPost || this.props.fields.socialPost == '') {
            this.setState({ requiredSocial: 'Please fill in social post content' });
        } else {
            if (this.state.listSelected && this.state.listSelected.length > 0) {
                this.state.listSelected.map(data => {
                    let page = { name: data.name, pageId: data.pageId };
                    listPages.push(page);
                })
                let facebookContent = {
                    challengeId: this.state.currentChallenge.id,
                    listPages: listPages,
                    socialPostContent: this.props.fields.socialPost,
                }
                this.props.postFacebook(token, this.state.userData.token, facebookContent);
            }
            if (this.refs.twitter.checked) {
                let twitterContent = {
                    challengeId: this.state.currentChallenge.id,
                    message: this.props.fields.socialPost,
                    clientId: clientId
                }
                this.props.postTwitter(token, twitterContent);
            }
            this.setState({ clickShare: true, shown: false, requiredSocial: '', loadingUpload: true  });
        }
    }
    renderListPage = (page, index) => {
        return (
            <div className="page-facebook page-content" key={index}>
                <div className="left-side">
                    <Checkbox value={page} />
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
        this.refs.all.checked ? this.setState({ listSelected: this.state.listPageFacebook }) : this.setState({ listSelected: [] });
    }
    showShared = () => {
        this.setState({ isShared: true, shown: true });
        this.startTimer2();
    }
    handleTwitter = () => {
        this.refs.twitter.checked ? this.setState({postT: true}) : this.setState({postT: false});
    }
    onChangeTotalBudget = (event) => {
        const value = event.target.value;
        const totalBudget = value.split('$')[1];
        this.setState({totalBudget});
    }
    openPreviewUpload = (data) => {
        const { listChallenges } = this.props;
        let { listUploads } = this.state;
        let index = _.findIndex(listChallenges, {id : data.challengeId});
        listUploads = listChallenges[index].highContents;
        this.setState({
            listUploads,
            openModalPreview: true,
            currentUploadPreview: data,
        })
    }
    closeModalPreview = () => {
        this.setState({
            openModalPreview: false,
            currentUploadPreview: {}
        })
    }
        render() {    
        const { typeChallenge, valid, pristine } = this.props;
        const listChallenges = this.props.listChallenges;
        const {facebookToken} = getCurrentUser();
        let { listUploads } = this.state;
        let listUploadsPass = listUploads;
        const type = this.state.type;
        const checkWidth = (window.innerWidth > 993) ? 0 : 48; 
        let disableButtonNextStyle = { cursor: 'pointer' };
        let disableButtonShareStyle = { cursor: 'pointer' };
        if((this.props.fields.socialPost && this.props.fields.socialPost.length > 140) || this.state.clickShare || (this.state.listSelected.length == 0 &&  !this.state.postT)){
            disableButtonShareStyle.opacity = 0.5;
            disableButtonShareStyle.pointerEvents = 'none';
          }
        if (!valid || pristine) {
            disableButtonNextStyle.opacity = 0.5;
            disableButtonNextStyle.pointerEvents = 'none';
        }
        return (
            <div>
                {this.props.loadingUpload && 
                    <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                } 
                {!this.props.loadingUpload && 
                 <Scrollbars autoHide style={{ height: window.innerHeight - 118 - checkWidth }} renderThumbVertical={({ style, ...props }) =>
                 <div {...props} style={{ ...style, backgroundColor: '#fff' }}/>
                 }>
                     <div className="bortlet-body">                    
                         {(listChallenges && listChallenges.length > 0) ? listChallenges.map(this.renderItemChallenge, this, '') : 
                         <div className="mt-chall-arch-list nodata">
                             <div className="row">
                                 <span style={{ margin: '0px 10px' }}>No challenge found.</span>
                             </div>
                         </div>
                         }
                     </div> 
                 </Scrollbars>
                }            
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onRequestClose={this.closeModal}
                    onAfterOpen={this.afterOpenModal}
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
                    <div className="container-fluid">
                        <form>
                            <div className={this.state.currentStep === 1 ? 'showStep' : 'hiddenStep'}>
                                <div className="row">
                                    <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                                        {type === 'edit'  && typeChallenge == 'SAVED' ?
                                         <Field name="challengeName" type="text"
                                            label="Name of the challenge"
                                            autoFocus={true}
                                            component={renderField}
                                            normalize={normalizeSlash}
                                        /> :
                                        <Field name="challengeName" type="text"
                                            label="Name of the challenge"
                                            autoFocus={true}
                                            component={renderField}
                                            readOnly
                                        />}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '120px' }}>
                                    {type === 'edit' ?
                                     <Field name="description" type="text"
                                            defaultValue={this.state.defaultNote && this.state.current ? this.state.current.description : this.props.fields.description}
                                            label="Description(250 words Max)"
                                            className="descriptionField"
                                            component={renderTextArea}
                                        />:
                                    <Field name="description" type="text"
                                        defaultValue={this.state.defaultNote && this.state.current ? this.state.current.description : this.props.fields.description}
                                        label="Description(250 words Max)"
                                        className="descriptionField"
                                        component={renderTextArea}
                                        readOnly
                                        />}
                                    </div>
                                </div>
                                <div className="row" style={{ height: '130px' }}>
                                    <div className="inputrow col-md-6 col-lg-6 col-sm-6 col-xs-6">
                                        <div className="row">
                                            <div className="inputrow2 col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '60px' }}>
                                            {type === 'edit'  && typeChallenge == 'SAVED' ? 
                                            <Field
                                                    name="startDate"
                                                    label='Start Date'
                                                    component={DatePickerCustom}
                                                     />
                                                    :
                                            <Field
                                                    name="startDate"
                                                    label='Start Date'
                                                    component={renderField}
                                                    readOnly />}

                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="inputrow2 col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '60px' }}>
                                            {type === 'edit' ? 
                                            <Field
                                                    name="endDate"
                                                    label='End Date'
                                                    component={DatePickerCustom} />
                                                    : 
                                            <Field
                                                    name="endDate"
                                                    label='End Date'
                                                    component={renderField}
                                                    readOnly /> }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inputrow col-md-6 col-lg-6 col-sm-6 col-xs-6">
                                        <div className="row">
                                        {type === 'edit'  && typeChallenge == 'SAVED' ? <Dropzone onDrop={(files) => this.onDrop(files)} className="inputImage">
                                                <div className="iconUpload">
                                                    <span className="nameFile">{this.state.imageFileName === '' ? 'Upload Challenge Image' : this.state.imageFileName}</span>
                                                    <span className="chooseFile">Browse</span>
                                                </div>
                                            </Dropzone> :
                                            <Dropzone disabled onDrop={(files) => this.onDrop(files)} className="inputImage">
                                                <div className="iconUpload">
                                                    <span className="nameFile">{this.state.imageFileName === '' ? 'Upload Challenge Image' : this.state.imageFileName}</span>
                                                    <span className="chooseFile">Browse</span>
                                                </div>
                                            </Dropzone>
                                            }
                                        </div>
                                        <div className="row">
                                            {this.state.defaultImage && <div><img style={{ height: '60px', width: '60px' }} src={this.state.defaultImage} /></div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="row" style={{ marginTop: '20px' }}>
                                    <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                                        {type == 'edit' && typeChallenge == 'SAVED' ? <span className="btn-create" style={disableButtonNextStyle} onClick={() => this.updateStep(2)}>Next</span> :
                                        <span className="btn-create" onClick={() => this.updateStep(2)}>Next</span>}
                                        {/* <span className="btn-create" onClick={() => this.updateStep(2)}>Next</span> */}
                                    </div>
                                </div>
                            </div>

                            <div className={this.state.currentStep === 2 ? 'showStep' : 'hiddenStep'}>

                                <div className="row" style={{ marginTop: '20px' }}>
                                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                                    {type === 'edit' ? 
                                     <Field
                                            name="rewardType"
                                            label="Reward Type"
                                            component={renderDropdownList}
                                            data={this.state.rewardType}
                                            valueField="value"
                                            textField="value" 
                                            onChange={value => this.handleRewardType(value)} /> :
                                    <Field
                                            name="rewardType"
                                            label="Reward Type"
                                            component={renderField}                                           
                                            readOnly />
                                    }
                                        <p className="text-danger">{this.state.rewardTypeError}</p>
                                    </div>
                                    <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                                    {type === 'edit' ?  <InputMask defaultValue={this.state.totalBudget} mask="$9999999" maskChar={null} placeholder="Total Budget" onChange={this.onChangeTotalBudget} /> :
                                    <InputMask defaultValue={this.state.totalBudget} mask="$9999999" maskChar={null} placeholder="Total Budget" onChange={this.onChangeTotalBudget} readOnly/> }
                                        <p className="text-danger">{this.state.totalBudgetError}</p>
                                    </div>

                                </div>
                                {this.state.rewardTypeSelect == 'Cash' && 
                                    <div className="row">
                                        <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12">
                                            <span>Reward Level</span>
                                            <div className="contentReward2">
                                                <div className="contentData row">
                                                    {this.state.defaultRewardLevel && this.state.defaultRewardLevel.map(this.renderDefaultRewardLevel, this, '')}
                                                </div>
                                            </div>
                                        </div>
                                    
                                        <div className="inputrow col-md-6 col-lg-6 col-sm-12 col-xs-12" style={{height: 'auto', position: 'relative'}}>
                                            <div className="resultReward">
                                                {this.state.rewardLevel && this.state.rewardLevel.map(this.renderRewardLevel, this, '')}
                                            </div>
                                            <p className="text-danger">{this.state.rewardLevelError}</p>
                                        </div>
                                    </div>
                                }
                          
                                <div className="row">
                                    <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                                        <div className="hashtag">
                                        {type === 'edit' ? <TagsInput value={this.state.tags} inputValue={this.state.tag} onChangeInput={this.onChangeInput} onChange={this.handleChange} inputProps={{placeholder: "Add up to 6 hashtags recommendation"}} /> :
                                        <TagsInput value={this.state.tags} inputValue={this.state.tag} onChangeInput={this.onChangeInput} onChange={this.handleChange} inputProps={{placeholder: "Add up to 6 hashtags recommendation"}} disabled/>
                                        }                     
                                        </div>
                                        <p className="text-danger">{this.state.errorTag || this.state.errorTags}</p>
                                    </div>
                                </div>
                                <div className="inputrow col-md-6 col-lg-6 col-sm-6">
                                    <p className="text-danger">{this.state.error}</p>
                                    </div>
                                <div className="row endline" style={{ marginTop: '20px' }}>
                                    <div className="col-md-12 col-lg-12 col-sm-12">
                                      {type === 'edit' && typeChallenge == 'SAVED' && <span className="btn-create" onClick={(e) => this.handleEdit(e, 'SAVED')} >Update</span>}
                                      {type === 'edit' && typeChallenge == 'LIVE' && <span className="btn-create" onClick={(e) => this.handleEdit(e, 'LIVE')} >Update</span>}
                                       <span className="btn-create" style={{ marginRight: '40px' }} onClick={() => this.updateStep(1)}>Back</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                        {this.state.loadingUpload && 
                            <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                        }
                    </div>
                </Modal>
                <Modal
                    isOpen={this.state.clickLive}
                    onRequestClose={this.closeModalLive}
                    shouldCloseOnOverlayClick={false}
                    className={{
                        base: 'custom_Modal',
                        afterOpen: 'custom_share_challenge',
                        beforeClose: 'custom_before-close'
                      }}
                      overlayClassName={{
                        base: 'custom_Overlay',
                        afterOpen: 'customOverlay_after-open',
                        beforeClose: 'customOverlay_before-close'
                      }}
                    contentLabel='Share modal'
                >
                <div className="text-center">
                    <span className="edit-client">Social Media Share</span>
                </div>
                <div className="icon-thick-delete-icon" onClick={this.closeModalLive} />
                <form>
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
                                {this.state.currentChallenge && this.state.currentChallenge.embeddedCode}
                            </div>
                        </div>
                    </div>
                    <div className="row social-share-row">
                        <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12 left-social-row">
                            <label className="social-title">Configured Social Media</label>
                            <div className="social-config">                            
                                <Scrollbars autoHide style={{ height: 140 }}> 
                                    <div style={{ display: 'flex' }}>                  
                                    {this.state.listPageFacebook && facebookToken?                 
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
                                    </div>: 
                                    <div></div>
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
                                        </div> : 
                                        <div></div>
                                    }
                                    </div>
                                </Scrollbars>                                  
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12 left-social-row">
                            <label className="entribe-uri"> {this.state.currentChallenge && `${window.location.protocol}//${window.location.hostname}${this.state.currentChallenge.entribeUri}`}</label>
                        </div>
                        <div className="account-error col-md-12 col-lg-12 col-sm-12 col-xs-12">
                            {this.state.twitterData ? <div></div> : <div>Please config Twitter account in settings first</div>}
                            {this.state.listPageFacebook && facebookToken ? <div></div> : <div>Please config Facebook account in settings first</div>}
                        </div>
                    </div>
                    <div className="row social-error">
                        {this.state.socialError &&                
                        <div className="col-md-12 col-lg-12 col-sm-12" style={{padding: '0px 5px'}}>                    
                            {this.state.socialError}
                        </div>
                        }
                    </div>
                    {(this.state.listPageFacebook || this.state.twitterData) &&
                        <div className="row" style={{ marginTop: '20px' }}>
                            <div className="inputrow col-md-12 col-lg-12 col-sm-12">
                                <span className="btn-create" style={disableButtonShareStyle} onClick={(e) => this.handleShare(e)}>Share</span>
                            </div>         
                        </div>}
                    </form>
                        {this.state.loadingUpload && 
                            <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                        }
                </Modal>
                <Modal
                    isOpen={this.state.isEditedSuccessfullyModal}
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
                                <button style={{ margin: '10px' }} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12">
                                <span className='title-confirm-popup'>{this.state.name + " challenge has been updated"}</span>
                            </div>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.isErrorModal}
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
                            <div className="col-md-12 col-lg-12 col-sm-12">
                                <span className='title-confirm-popup'>{this.state.name + " challenge's end date is in the past. Can't go live!"}</span>
                            </div>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.isGoLiveSuccessfullyModal}
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
                                <span className='title-confirm-popup'>{this.state.name + " challenge is now Live"}</span>
                            </div>
                        </div>
                    </form>
                </Modal>
                <PreviewUpload listUploads={listUploadsPass} disableEdit={true} closeModal={this.closeModalPreview} isAll={false} 
                openModalPreview={this.state.openModalPreview} currentUploadPreview={this.state.currentUploadPreview} 
                challengeId="0" 
                activeChallenge={this.state.currentChallenge} status={this.state.activeType} />
                   
            </div>
        )
    }
}
ChallengesList = reduxForm({
    form: 'createChallenge',
    validate
})(ChallengesList);