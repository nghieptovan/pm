import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName, getClientId, getClientName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ContentActions from '../../redux/actions/content';
import * as ChallengeActions from '../../redux/actions/challenge';
import Dropzone from 'react-dropzone';
import Multiselect from 'react-widgets/lib/Multiselect'
import 'react-widgets/lib/scss/react-widgets.scss';
import './Upload.scss';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { TagBox } from 'react-tag-box';
import ReactLoading from 'react-loading';
import classNames from 'classnames';
import _ from 'lodash';
import DropdownList from 'react-widgets/lib/DropdownList';
import {hostname} from '../../config';
import InputMask from 'react-input-mask';
import { login } from '../../redux/actions/auth';
const validate = values => {
  return validateChallengeForm(values, false);
};

const selector = formValueSelector('uploadCreator');

@connect(
  state => ({
    challenge: state.challenge,
    content: state.content,
    fields: selector(state, 'challengeSelect', 'description')
  }),
  ({
    creatorUpload: (input, token, time) => ContentActions.creatorUpload(input, token, time),
    changeFieldValue: (field, value) => change('uploadCreator', field, value),
    getLiveChallenge: (token, page, maxRecords, clientId) => ChallengeActions.getLiveChallenge(token, page, maxRecords, clientId)
  }
  )
)

export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      defaultModalStatus: true,
      disableOverlay: false,
      challengeError: '',
      contentError: '',
      agreeError: '',
      imageFileName: null,
      imageContent: '',
      typeContent: '',
      uploadStatus: true,
      tags: [],
      tagsError: '',
      errorUpload: '', 
      hashtagsArray: [],
      location: '',
      valueChallenges: null,
      valueHashtag: ''
    });
  }
  static propTypes = {
    creatorUpload: PropTypes.func,
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
    clickDatePicker: PropTypes.func,
    closeWithData: PropTypes.func,
  }
  
  componentDidMount(){
      this.setState({uploadStatus: true});
      this.props.reset();
      const { idChallengeSet, nameChallengeSet, challenge : { listLiveChallenges } } = this.props;        
      this.getLocation();
      this.setState({
        challengeError: '',
        contentError: '',
        agreeError: '',
        loadingUpload: false,
        hashtagsArray: []
      });
      if(idChallengeSet !== 0){
        const index = _.findIndex(listLiveChallenges, function(x) { return x.id == idChallengeSet; })
        const hashtagsArray = listLiveChallenges[index].hashtags ? listLiveChallenges[index].hashtags.split('===') : [];
        this.setState({hashtagsArray});
        this.props.changeFieldValue('challengeSelect', nameChallengeSet);
      }   
  }
  componentWillReceiveProps(nextProps) {
    const { content: nextContent } = nextProps;
    const { content } = this.props;
    
    const { token, id: creatorID } = getCurrentUser();
    const clientId = getClientId();
  }
  
  closeModal = () => {
    // this.props.reset();
    this.props.closeWithData({
      className: 'custom_after-open-upload-creator-success',
      timeOut: 1000,
      newModalClass: '',
      newModal: false  
  });
  
    // this.props.closeModal();
    // this.setState({imageContent: null, imageFileName: null, tags: [], clickUpload: false, typeContent: '', valueChallenges: null, errorTags: '', errorTag: '', valueHashtag: ''});
  };
  tokenExpire = () => {
    this.props.closeWithData({
      className: 'custom_after-open-upload-creator-success',
      timeOut: 0,
      newModalClass: 'custom_after_token_expired',
      newModal: true,
      newModalType: 'ExpireToken'
  });
  }

  // afterOpenModal = () => {
  //   this.setState({uploadStatus: true});
  //   this.props.reset();
  //   const { idChallengeSet, challenge : { listLiveChallenges } } = this.props;        
  //   this.getLocation();
  //   this.setState({
  //     challengeError: '',
  //     contentError: '',
  //     agreeError: '',
  //     loadingUpload: false,
  //     hashtagsArray: []
  //   });
  //   if(idChallengeSet !== 0){
  //     const index = _.findIndex(listLiveChallenges, function(x) { return x.id == idChallengeSet; })
  //     const hashtagsArray = listLiveChallenges[index].hashtags ? listLiveChallenges[index].hashtags.split(',') : [];
  //     this.setState({hashtagsArray});
  //     this.props.changeFieldValue('challengeSelect', idChallengeSet)
  //   }    
  // };

  onDrop = (files, type) => {
    const fileType = files[0].type.split('/')[0];
    const fileSplit = files[0].name.split('.');
    if(fileType === 'video' || fileType === 'image'){     
      const fileExtension = fileSplit[fileSplit.length - 1];    
      let name = files[0].name;
      if(name.length > 200){
        name = name.substr(0,name.length/2);
        name += "."+fileExtension;
      }
        this.setState({ imageContent: files[0], imageFileName: name, typeContent: fileType,contentError: '' })
     
    }else{
      this.setState({ contentError: 'Please upload video or image.' });
    }    
  }

  handleUpload = (e) => {
    e.preventDefault();
    const {token } = getCurrentUser();
    const { fields, idChallengeSet, challenge : { listLiveChallenges } } = this.props;
    const clientId = getClientId();
    let idChallenge = 0;
    if(idChallengeSet !== 0){
      idChallenge = idChallengeSet;
    }else{
      idChallenge = this.state.valueChallenges ? this.state.valueChallenges.id : '';
      // fields.challengeSelect ? idChallenge = fields.challengeSelect.id : '';      
    }
    const index = _.findIndex(listLiveChallenges, function(x) { return x.id == idChallenge; })
      if(index != -1){
        const hashtagsArray = listLiveChallenges[index].hashtags ? listLiveChallenges[index].hashtags.split('===') : [];
        const agree = this.refs.agreecheckbox;
        const dataValid = {
          idChallenge: idChallenge,
          imageFileName: this.state.imageFileName,
          agreeTerm: agree.checked,
          description: fields.description
        }    
        const isOk = this.checkCondition(dataValid);
        const access_time = moment(); 
        let location = this.state.location;
        location = location.regionName+"-"+location.countryCode +"-"+(location.region  && location.region.length > 0? location.region : location.countryCode);
        let tags = this.state.tags.length >0 ? this.state.tags[0] : '';        
        this.state.tags ? this.state.tags.map(data => {
            data != tags ? tags += '===' + data : ''          
        }) : ''       
        if(isOk){         
          new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let file = new FormData();
            file.append("file",this.state.imageContent);
            file.append("hashtags", tags);
            file.append("description", fields.description ? fields.description : '');
            file.append("type", this.state.typeContent);
            file.append("location", location);
            xhr.open("POST", hostname+"/api/content/upload/"+idChallenge+"?access_token="+token+"&access_time="+moment(), true);
            xhr.onload = () => {
                var result = JSON.parse(xhr.response); 
                resolve(xhr.responseText);  
              if(result.status.code == 200){       
                const clientName= getClientName();   
                this.setState({ uploadStatus: false, loadingUpload: false, valueChallenges: null });
                this.props.getLiveChallenge('token', 0, 50, clientName);
                this.closeModal();                
              } else if(result.status.code == 201){
                // sessionStorage.setItem('errorStatus', result.status.code);                
                this.setState({ uploadStatus: false, loadingUpload: false, valueChallenges: null });
                this.tokenExpire();
              } else {
                this.setState({ errorUpload: result, loadingUpload: false, clickUpload: false });
              }
            }
            xhr.onerror = () => {         
                reject(xhr.statusText);
                this.setState({ errorUpload: nextContent.errorCreatorUpload, loadingUpload: false, clickUpload: false });
            } 
            xhr.send(file);
        });                 
          this.setState({clickUpload: true, loadingUpload: true, hashtagsArray});
        }
    } else {
      this.setState({challengeError: 'Please select challenge!'});
    }
  }

  checkCondition = (data) => {
    let returnData = true;
    let errorStr = 'This field is required!';

    if (!data.idChallenge) {
      returnData = false;
      this.setState({ challengeError: errorStr });
    } else {
      this.setState({ challengeError: '' });
    }

    if (!data.imageFileName) {
      returnData = false;
      this.setState({ contentError: errorStr });
    } else {
      this.setState({ contentError: '' });
    }

    if (!data.agreeTerm) {
      returnData = false;
      this.setState({ agreeError: errorStr });
    } else {
      this.setState({ agreeError: '' });
    }
    if(data.description && data.description.length > 250){
      returnData = false;
    }
    return returnData;
  }

  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
  }
  handleChange = (tags) => {
    tags.length > 6 ? this.setState({errorTags: 'Maximum tags is 6.'} ) : this.setState({tags, errorTags: ''});
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
  onChangeInput = tag => {
    tag.length > 20 ? this.setState({errorTag: 'Length of tag should be less than 20 characters.'}) : this.setState({errorTag: '', tag});
  }

  renderHashtagItem = (data) => {
    const checkExist = this.state.tags.includes(data);  
    return (
      <span className={classNames('react-tagsinput-tag', { 'selected': checkExist })} key={`addrewardlevel${data}`} onClick={() => this.addHashtag(data)}>
      {data}
      </span>
    )
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
  onSelect = (value) => {
    const hashtagsArray = value.hashtags ? value.hashtags.split('===') : [];
    this.setState({valueChallenges: value, hashtagsArray, challengeError: '', valueHashtag: ''});
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
    const { valid, pristine, idChallengeSet, nameChallengeSet, challenge : { listLiveChallenges } } = this.props;
    let disableButtonStyle = { cursor: 'pointer' };
    if (this.state.clickUpload) {
      disableButtonStyle.opacity = 0.5;     
      disableButtonStyle.pointerEvents = 'none';
    }        
    return (
        <div className="container-fluid">
          {this.state.uploadStatus && <form>
              <div className="row">
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">                  
                {idChallengeSet === 0 &&
                <DropdownList
                  data={listLiveChallenges}
                  textField='name'
                  valueField='id'
                  value={this.state.valueChallenges}
                  onChange={(value) => this.onSelect(value)}
                  placeholder='Select Challenges'
                  />                                                   
                }
                {idChallengeSet !== 0 && <Field name="challengeSelect" type="text"
                    label={nameChallengeSet}
                    autoFocus={true}
                    component={renderField}
                    readOnly={true}
                  />}
                  {this.state.challengeError && <p className="text-danger" style={{position: 'absolute'}}>{this.state.challengeError}</p> }
                </div>
              </div>
              <div className="row" style={{height: '130px'}}>
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  <Dropzone onDrop={(files) => this.onDrop(files)} className="inputImage">
                  <div className="upload-area">                  
                    <span className="title">{this.state.imageFileName ? this.state.imageFileName :'Drag and drop to upload media'} </span>
                    <div className="icon-file">
                      <div className="circle-item">
                        <i className="fa fa-long-arrow-up" aria-hidden="true"></i>
                      </div>   
                    </div>
                    <div className="choose-file">
                      <span>Choose File</span>
                    </div>               
                  </div>
                  </Dropzone>
                  <p className="text-danger">{this.state.contentError}</p>                   
                </div>                
              </div>
              <div className="row" style={{height: '120px'}}>
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '130px'}}>
                  <Field name="description" type="text"
                    label="Description(250 words Max)"
                    className="descriptionField"
                    component={renderTextArea}
                  />                                    
                </div>               
              </div>
              {(this.state.hashtagsArray && this.state.hashtagsArray.length > 0) &&
                <div className="row" style={{height: '110px'}}>
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12" style={{ height: '110px'}}>
                  <div className="hashtag">
                    <div className="react-tagsinput">
                      <span>                        
                        {this.state.hashtagsArray.map(this.renderHashtagItem, this, '')}  
                        <input type="text" maxLength="20" value={this.state.valueHashtag} onChange={this.updateInputValue} onKeyPress={(e) => this._handleKeyPress(e)} placeholder="Add up to 6 hashtags" />
                      </span>
                    </div>                     
                  </div>                    
                  <p className="text-danger">{this.state.tagsError || this.state.errorTag || this.state.errorTags}</p>                   
                </div>                
              </div>
              }
              
              <div className="row" style={{height: '60px', marginTop: '10px'}}>
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  <div className="termagree">
                  <input ref="agreecheckbox" type="checkbox"/>
                  <span>I agree to Entribe's <a href="http://www.entribe.com/terms" target="_blank">Terms & Conditions</a></span>
                  </div>                    
                  <p className="text-danger">{this.state.agreeError}</p>  
                </div>
              </div>
              <div className="row">
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  <span className="text-danger pull-left">{this.state.errorUpload}</span>
                  <span onClick={(e) => this.handleUpload(e)} style={disableButtonStyle} className="upload pull-right">Upload</span>
                </div>
              </div>
              {this.state.loadingUpload && 
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }
              
          </form>}
          {!this.state.uploadStatus &&  <form className='form-confirm'>
            <div className="row" >
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row" >
              <div className="col-md-12 col-lg-12 col-sm-12 text">
                <span className='title-confirm-popup'>Success! <br/>Thanks for uploading</span>
              </div>
            </div>
          </form>}
        </div>
    )
  }
}
Upload = reduxForm({
  form: 'uploadCreator',
  validate
})(Upload);