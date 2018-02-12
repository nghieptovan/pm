import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory, Link } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import PreviewUpload from '../Upload/PreviewUpload';
import DashboardBody from './DashboardBody';
import RewardMultiUpload from '../Upload/RewardMultiUpload';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import imgItem from '../../assets/img/no-img.png';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ContentActions from '../../redux/actions/content';
import * as ChallengeActions from '../../redux/actions/challenge';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import './Uploads.scss';
import dataConfig from '../../utils/config';
import ReactStars from 'react-stars';
import FilterUpload from './FilterUpload';
import LazyLoad from 'react-lazy-load';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import {s3URL} from '../../config';
import {ReactHeight} from 'react-height';
import { SelectableGroup, createSelectable } from 'react-selectable';
import UploadItem from './UploadItem';
import ReactLoading from 'react-loading';
const SelectedUploadItem = createSelectable(UploadItem);

const isNodeInRoot = (node, root) => {
  while (node) {
    if (node === root) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
};

@connect(
  state => ({
    challenge: state.challenge,
    content: state.content
  }),
  ({
    getListChallengeForUpload: (clientId, token) => ChallengeActions.getChallengesForUploads(clientId, token),
    getListUploads: (challengeId, token, status) => ContentActions.getListUploads(challengeId, token, status),
    contentRewardUpload: (token, time, status, input, isAll) => ContentActions.ratingMultiple(token, time, status, input, isAll),
    }
  )
)

export default class Uploads extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeType: 'All',
      currentChallenge: null,
      openModalPreview: false,
      currentUploadPreview: {},
      selectedUpload: [],
      multiRating: 3,
      defaultGridView: true,
      sortAlphaDirection: 'asc',
      sortDateDirection: 'asc',
      ratingMultiAll: false,
      confirmRating: false,
      acceptRating: false,
      requiredSelectUpload: false,
      selectedItems: [],
			tolerance: 0,
      selectOnMouseMove: false,
      challengeId: 0,
      listUpload: null
      };
  }
  static propTypes = {
    challenge: PropTypes.object,
    router: React.PropTypes.object,
    getChallengeById: PropTypes.func,
  };
  componentWillReceiveProps(nextProps) {
    const { challenge: nextChallenge, content: nextContent } = nextProps;
    const { challenge, content } = this.props;
    const { token } = getCurrentUser();
    let newChallengeList = challenge.challenges, newContentList = content.listUpload;
    if(content.ratingMultiStatus !== nextContent.ratingMultiStatus && nextContent.ratingMultiResult){
      this.setState({ confirmRating: true});
      setTimeout(() => {
        this.setState({ ratingMultiAll: false, confirmRating: false });
      }, 1000);
    }
    if (nextChallenge.challenges.length > 0 && challenge.challenges !== nextChallenge.challenges) {
      let currentChallenge;
      let challengeId;
      let challengeList;
      const all = {id: 0, name: 'ALL'};
      nextChallenge.challenges.unshift(all);
      if (!this.props.params.challengeId) {
        if (!this.state.currentChallenge) {
          currentChallenge = nextChallenge.challenges[0];          
          challengeId = currentChallenge.id;
        } 
      } else {
        currentChallenge = nextChallenge.challenges.filter(data => data.id == this.props.params.challengeId)[0];
        challengeId = this.props.params.challengeId;
      }
      this.setState({ challengeId: challengeId, currentChallenge: currentChallenge, listChallenges: challengeList, ratingValue: [], flagValue: [], rewardValue: [], loadingUpload: true},
        () => this.props.getListUploads(challengeId, token, this.state.activeType));
    }
    if (challenge.challenges !== nextChallenge.challenges) {
      newChallengeList = nextChallenge.challenges;
    }
    if (content.listUpload !== nextContent.listUpload) {
      newContentList = nextContent.listUpload;
    }
    content.loadingIcon !== nextContent.loadingIcon && nextContent.loadingIcon == 1 ? this.setState({loading: true}) :'';
    content.loadingIcon !== nextContent.loadingIcon && nextContent.loadingIcon != 1 ? this.setState({loading: false}) :'';
    content.loadingContentIcon !== nextContent.loadingContentIcon && nextContent.loadingContentIcon == 1 ? this.setState({loadingUpload: true}) :'';
    content.loadingContentIcon !== nextContent.loadingContentIcon && nextContent.loadingContentIcon != 1 ? this.setState({loadingUpload: false}) :'';
    (newChallengeList.length > 0 || newContentList.length > 0) ? this.setState({ listChallenges: newChallengeList, listUpload: newContentList, listAll: newContentList, listRating: newContentList, listFlag: newContentList, listReward: newContentList, ratingValue: [], flagValue: [], rewardValue: []}) : '';
}
  componentWillMount() {
    const { clientId } = getCurrentUser();
    !clientId ? browserHistory.push("/client") : '';
    this.setState({loadingUpload: true, listUpload: null});
  }
  componentDidMount() {
    const { clientId, token } = getCurrentUser();        
    this.props.getListChallengeForUpload(clientId, token);
    let item = sessionStorage.getItem('contentStatus');
    item ? this.setState({activeType: item},()=>this.props.getListUploads(0, token, item)) : '';
    sessionStorage.removeItem('contentStatus');    
  }
  handleSelection = (keys) => {
    let { selectedUpload } = this.state;

    _.forEach(keys , (key) => {
      if(selectedUpload.length > 0){
        const objFound = _.find(selectedUpload, key);
        !objFound ? selectedUpload.push(key): '';
      }else{
        selectedUpload.push(key);
      }      
    });

    this.setState(prevState => ({
      selectedUpload: selectedUpload
    }));
  }

	handleToleranceChange = (e) => {
		this.setState({
			tolerance: parseInt(e.target.value)
		});
	}
	toggleSelectOnMouseMove = () => {
		this.setState({
			selectOnMouseMove: !this.state.selectOnMouseMove
		});
	}
  changeUploadsType = (value) => {
    const { token } = getCurrentUser();    const { challengeId } = this.state;    
    this.setState({ activeType: value, selectedUpload: [] , loadingUpload: true }, () => this.props.getListUploads(challengeId, token, value));
  }
  handleSelect = (challenge) => {
    const { token } = getCurrentUser();
    this.setState({ challengeId: challenge.id, currentChallenge: challenge, selectedUpload: []});
    this.props.getListUploads(challenge.id, token, this.state.activeType);
    this.setState({loadingUpload: true});
  }

  openModalPreview = (data) => {
    this.setState({
      openModalPreview: !this.state.openModalPreview,
      currentUploadPreview: data
    });
  }

  selectCheckbox = (data) => {
    let { selectedUpload } = this.state;
    if(selectedUpload.length > 0){
      let index = _.findIndex(selectedUpload, {id: data.id});
      index > -1 ? _.remove(selectedUpload, data) : selectedUpload.push(data);
    }else{
      selectedUpload.push(data);
    }          
    this.setState(prevState => ({
      selectedUpload: selectedUpload
    }));

  }

  renderUploadItem = (data) => {
    let imageUri;
    imageUri = data.type === 'video' ? data.thumbnail : data.contentUri;
    const imagePreview = imageUri ? s3URL+imageUri : imgItem;
    let location ='';
    if (data.location){
      location=data.location.split("-");
      location= location[0] +" "+ location[1];
    }
    return (
      <div className="image_list col-md-1-5 col-sm-6" key={data.id+imagePreview}>
        <div className="image-thumb">
          <header className="image-header hover-img">
            <a className="hover-img" onClick={() => this.openModalPreview(data)}>
              <LazyLoad height={150}>
                <img className="lazy" src={imagePreview} />
              </LazyLoad>              
            </a>
            <div className="hover-inner hover-inner-hide">
              {data.challengeStatus !== "ARCHIVED" && <Checkbox value={data} />}
              {data.rewardLevel && this.state.defaultGridView ? <div className="rewards-block"><i className="icon-cup-icon"></i>{data.rewardLevel}</div> : ''}
              {data.favourites && this.state.defaultGridView ? <div className="favourite-block"><i className="icon-heart-icon"></i></div> : ''}
              
            </div>
          </header>
          <div className="image-des" onClick={() => this.openModalPreview(data)}>
            <div className="left-side">
              <div className="icon-group">
                <span className="imageName">{data.name}</span>
                <div className="icon-content">
                {data.rewardLevel && !this.state.defaultGridView ? <div className="rewards-block"><i className="icon-cup-icon"></i>{data.rewardLevel}</div> : ''}
                {data.favourites && !this.state.defaultGridView ? <div className="favourite-block"><i className="icon-heart-icon"></i></div> : ''}
                {data.flagged && data.flagged.length > 0 && !this.state.defaultGridView ? <div className="rewards-block flagged"><i className="icon-flag-icon"></i></div> : ''}
                {data.star > 0 && !this.state.defaultGridView ? <div className="star-block"><ReactStars
                          count={5}
                          value={data.star}
                          half={false}                          
                          size={18}
                          edit={false}
                          color2={'#ffd700'}
                        /></div> : ''}
                </div>
              </div>
              <div className="text-group">
                <div className="creator-name">{data.firstName + " " + data.lastName +", "+location}</div>
                {data.star > 0 && this.state.defaultGridView ? <div className="star-block"><ReactStars
                          count={5}
                          value={data.star}
                          half={false}                          
                          size={15}
                          edit={false}
                          color2={'#ffd700'}
                        /></div> : ''}
                {!this.state.defaultGridView && data.status === 'PENDING' ? <div className="info"><i className="icon-noti-icon"></i></div> : ''}
              </div>
            </div>
            <div className="right-side">
              {this.state.defaultGridView && data.status === 'PENDING' ? <div className="info"><i className="icon-noti-icon"></i></div> : ''}
              {data.flagged && this.state.defaultGridView && data.flagged.length > 0 ? <div className="flagged"><i className="icon-flag-icon"></i></div> : ''}           
            </div>            
          </div>         
        </div>

      </div>
    )
  }
 
  closeModal = () => {
    this.setState({ openModalPreview: false });
  }

  closeModalMultiReward = () => {
    this.setState({ openModalReward: false, selectedUpload: [] });
  }
  
  handleChange = (e) => {
    let name = this.refs.inputsearch;
    if (!name) {
      name = '';
    }
    this.setState({ inputSearch: name.value });
  }
  handleSearch = (e) => {
    const listAll = this.state.listAll;
    let value = this.state.inputSearch;
    !value ? value = '': '';
    let tempName = [], tempFullName = [], tempEmail = [];
    tempName = listAll.filter((data) => data.name.toLowerCase().includes(value.toLowerCase()));
    tempFullName = listAll.filter((data) => (data.firstName.toLowerCase()+" "+data.lastName.toLowerCase()).includes(value.toLowerCase()));
    tempEmail = listAll.filter((data) => data.email.toLowerCase().includes(value.toLowerCase()));
    let result = _.union(tempName, tempFullName, tempEmail);
    result = _.uniq(result);
    this.setState({ listUpload: result });
  }
  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSearch();
      e.preventDefault();
    }
  }  
  ratingChanged = (value) =>{
    const list = this.state.listAll ;
    let result = [];
    if (value.length == 0) {
      result = this.state.listAll;      
    } else {     
      let temp=[];
      value.map((data) => {
        temp = list.filter((obj) => obj.star == data);
        result = _.union(result, temp);
      })  
    }
    this.setState({ listRating: result, ratingValue: value},this.getListFilter);   
  }

  ratingMultiChanged = (value) =>{    
    const {selectedUpload} = this.state;  
    this.setState({ multiRating : value});  
    selectedUpload && selectedUpload.length > 0 ?  this.setState({ratingMultiAll: true}) : this.setState({requiredSelectUpload: true}); 
  }
  confirmMultiple = type => {
    const {selectedUpload} = this.state;

    const dataContent = [];
    const access_time = moment();
    const { token } = getCurrentUser();
    if(type){
      selectedUpload.map((item) => {
        const dataInput = {
          id: item.id,
          star: this.state.multiRating
        }
        dataContent.push(dataInput);
      }) 
      this.props.contentRewardUpload(token, access_time, this.state.activeType, dataContent, this.state.challengeId == 0 ? true : false);
      this.setState({ selectedUpload: []})
    }else{
      this.setState({ratingMultiAll: false});
    }
    
  }
  flagChanged = (value) =>{
    const list = this.state.listAll ;
    let result = [];
    if (value.length == 0) {
      result = this.state.listAll;     
    } else {             
        let temp=[];
        value.map((data) => {
          if(data !== 'NO FLAG'){
            temp = list.filter((obj) => { return obj.flagged ? obj.flagged.includes(data) : false});         
          } else {
            temp = list.filter((obj) => { return obj.flagged ? obj.flagged.length == 0 : true })
          }
          result = _.union(result, temp);          
        })           
      result = _.uniq(result);      
    }   
    this.setState({ listFlag: result, flagValue: value},this.getListFilter);   
  }
  rewardChanged = (value) =>{
    const list = this.state.listAll ;
    let result = [];
    if (value.length == 0) {
      result = this.state.listAll;     
    } else {      
        let temp=[];
        value.map((data) => {
          if(data !== 'OTHER'){
            temp = list.filter((obj) => {
              return obj.rewardLevel && obj.rewardLevel === data ? true : false;
            });                
          } else {
            temp = list.filter((obj) => {
              if(obj.rewardLevel){
                if(obj.rewardLevel != '$10' && obj.rewardLevel != '$20' && obj.rewardLevel != '$50' && obj.rewardLevel != '$100'  && obj.rewardLevel != '$500'){
                  return true;
                }
              } else if (obj.couponCode){
                return true;
              } 
            })
          }
          result = _.union(result, temp);          
        })           
      result = _.uniq(result);      
    }
    this.setState({ listReward: result, rewardValue: value },this.getListFilter );   
  }
  getListFilter = () => {
    let result = [];
    result = _.intersection(this.state.listRating, this.state.listReward, this.state.listFlag);
    result = _.uniq(result);
    this.setState({listUpload: result});
  }
  UploadsChanged = (newFlags) => {
    newFlags.length == 0 ? newFlags = [] : '';
    this.setState({
      selectedUpload: newFlags
    });
  }
  rewardUpload = () => {
    this.state.selectedUpload.length > 0 ? this.setState({openModalReward: true}) : this.setState({requiredSelectUpload: true});    
  }
  changeView = type => {
    this.setState({defaultGridView: type});
  }
  sortAlpha =() => {
    const { listUpload,sortAlphaDirection } = this.state;
    listUpload.sort( (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));       
    this.setState({listUpload:  sortAlphaDirection == 'asc' ? listUpload : listUpload.reverse(),
    sortAlphaDirection: sortAlphaDirection == 'asc' ? 'desc' : 'asc'});        
  }
  sortDate = () => {
    const { listUpload,sortDateDirection } = this.state;
    listUpload.sort( (a, b) => a.uploadDate - b.uploadDate);       
    this.setState({listUpload:  sortDateDirection == 'asc' ? listUpload : listUpload.reverse(),
    sortDateDirection: sortDateDirection == 'asc' ? 'desc' : 'asc'});        
  }
  closeWarning = () => {
    this.setState({requiredSelectUpload: false});
  }
  renderStar = () => {
    let stars = []
    for (let i =0; i< this.state.multiRating; i++){
      stars.push({'value':i+1});
    }
    return(
      <div>
        {stars.map((star) => {
          return(
            <button key={star.value} style={{marginTop: '10px', marginLeft:'4px'}} className="btn btn-circle button-rating upload-multi" type="button">
              <i className="icon-star-icon" aria-hidden="true"></i>
            </button>
          )
          })}
      </div>
    );
  }
  rewardDone = () => {
    this.setState({selectedUpload: []});
  }

  render() {   
    const { params: { shortName }, valid, pristine } = this.props; 
    const checkWidth = (window.innerWidth > 1361) ? 0 : 48; 
    // console.log('Type Of List Uploads: ', typeof(this.state.listUpload));   
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName={shortName} selected="uploads" />
          <NavHeaderClient
            title='Uploads'
            handleSelect={this.handleSelect}
            isShowedCreateChallenge={false}
            isShowedSelectChallenge={true}
            listChallenges={this.state.listChallenges}
            currentChallenge={this.state.currentChallenge}
          />
          <div id="page-wrapper">
            <div className="uploads-dashboard">              
              <div className="container-fluid">
              <div className="bortlet">
              <ReactHeight onHeightReady={value => this.setState({height: value})}>
                <div className="bortlet-head">
                  <div className="bortlet-title" >
                    <ul className="nav nav-pills">
                      <li className={this.state.activeType === 'All' ? 'active' : ''} onClick={() => this.changeUploadsType('All')}>
                        <a href="#">All</a>
                      </li>
                      <li className={this.state.activeType === 'Pending' ? 'active' : ''} onClick={() => this.changeUploadsType('Pending')}>
                        <a href="#">Pending</a>
                      </li>
                      <li className={this.state.activeType === 'Flagged' ? 'active' : ''} onClick={() => this.changeUploadsType('Flagged')}>
                        <a href="#">Flagged</a>
                      </li>
                      <li className={this.state.activeType === 'Rewarded' ? 'active' : ''} onClick={() => this.changeUploadsType('Rewarded')}>
                        <a href="#">Rewarded</a>
                      </li>
                      <li className={this.state.activeType === 'Favourites' ? 'active' : ''} onClick={() => this.changeUploadsType('Favourites')}>
                        <a href="#">Favorites</a>
                      </li>
                    </ul>
                  </div>
                  < div className="bortlet-list-icon" >
                    <div className="rate-star">
                       <div className="star-rating">
                       <label>Rate: </label>
                      <ReactStars
                          count={5}
                          value={this.state.multiRating}
                          half={false}
                          onChange={this.ratingMultiChanged}
                          size={24}
                          color2={'#ffd700'}
                        />
                      </div>
                    </div>
                    <div className="reward-cup">
                      <span onClick={() => this.rewardUpload()} className="btn yellow"><i className="icon-cup-icon"></i>Reward</span>
                    </div>
                    <div className="actions">
                      <a className={classNames('btn btn-circle btn-icon-only btn-default no-MG-left', { 'selected': this.state.defaultGridView })}
                       onClick={() => this.changeView(true)}>
                        <i className="icon-icon"></i>
                      </a>
                      <a className={classNames('btn btn-circle btn-icon-only btn-default', { 'selected': !this.state.defaultGridView })}
                      onClick={() => this.changeView(false)}>
                        <i className="icon-list"></i>
                      </a>
                    </div>
                    <form className="top-list-search" action="#" method="POST">
                      <div className="input-group">
                        <input type="text" className="form-control"ref="inputsearch" onChange={this.handleChange} onKeyPress={(e) => this._handleKeyPress(e)} placeholder="Search..." />
                        <span className="input-group-btn">
                          <a className="btn submit" onClick={this.handleSearch}>
                            <i className="icon-search-icon"></i>
                          </a>
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              </ReactHeight>   
              {this.state.loadingUpload && 
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }
              {this.state.loading && 
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }                        
             <Scrollbars autoHide style={{ height: window.innerHeight - 108 - checkWidth}} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                  }>
                  <div className="bortlet-body" style={{ overflow: 'hidden', minHeight: window.innerHeight - 108 + 'px' }}>
                    <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12 uploads-list">
                    <SelectableGroup
                      className="main" 
                      ref="selectable"
                      preventDefault={false}
                      onSelection={this.handleSelection} 
                      >
                        <div className="content-left" style={{ minHeight: window.innerHeight - 108 + 'px' }}>                 
                          <div className="list-img">
                            {!this.state.loadingUpload && this.state.listUpload && this.state.listUpload.length > 0 ? 
                              <div className={classNames({ 'grid-view': this.state.defaultGridView, 'list-view': !this.state.defaultGridView })}>
                                {this.state.listUpload.map((data, i) => {
                                  const selected = _.findIndex(this.state.selectedUpload, data ) > -1;
                                  return (
                                    <SelectedUploadItem
                                      selectableKey={data}
                                      key={data.id} 
                                      data={data}
                                      selected={selected}
                                      openModalPreview={this.openModalPreview}
                                      selectCheckbox={this.selectCheckbox}
                                      defaultGridView={this.state.defaultGridView} />
                                  );
                                })}
                              </div> : (!this.state.loadingUpload ? <span className="no-data" style={{margin: '10px'}}>No upload found</span> :'') }                            
                            </div>
                          </div>    
                        </SelectableGroup>               
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12 filter-list">
                      <FilterUpload ratingValue={this.state.ratingValue} flagValue={this.state.flagValue} rewardValue={this.state.rewardValue} sortAlpha={this.sortAlpha} sortDate={this.sortDate} activeType={this.state.activeType} ratingChanged={this.ratingChanged} flagChanged={this.flagChanged} rewardChanged={this.rewardChanged}/>
                    </div>
                  </div>
                </Scrollbars>               
              </div>
              </div>
            </div>
          </div>
        </div>
        <RewardMultiUpload showPaid={false} rewardDone={this.rewardDone} isAll={this.state.challengeId == 0 ? true : false} closeModalMultiReward={this.closeModalMultiReward} openModalReward={this.state.openModalReward} data={this.state.selectedUpload} rate={this.state.multiRating} activeChallenge={this.state.currentChallenge} status={this.state.activeType} />
        <PreviewUpload listUploads={this.state.listUpload ? this.state.listUpload : []} 
        disableEdit={false} closeModal={this.closeModal} 
        isAll={this.state.challengeId == 0 ? true : false} 
        openModalPreview={this.state.openModalPreview} 
        currentUploadPreview={this.state.currentUploadPreview} 
        challengeId={this.state.currentChallenge ? this.state.currentChallenge.id : 0} 
        activeChallenge={this.state.currentChallenge} status={this.state.activeType} />
        <Modal
          isOpen={this.state.requiredSelectUpload}       
          shouldCloseOnOverlayClick={false}
          className={{
            base: 'custom_Modal',
            afterOpen: 'custom_after-open-upload-creator',
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
        <div className="icon-thick-delete-icon" onClick={() => this.closeWarning()} />
        <form className='form-confirm'>
        <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12 icon">
            <button key="buttonCloseWarning" style={{margin: '10px'}} className="btn btn-warning btn-circle btn-lg" type="button"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12">
            <span className='title-confirm-popup'>Select upload before reward or rating.</span>
          </div>
        </div>
        </form>
      </div>
          </Modal>
        <Modal
          isOpen={this.state.ratingMultiAll}       
          shouldCloseOnOverlayClick={false}
          className={{
            base: 'custom_Modal',
            afterOpen: 'custom_after-open-reward',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Example Modal"
        >
          {!this.state.confirmRating && <div className="container-fluid">  
          <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
               {this.state.multiRating && this.renderStar()}
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Rate {this.state.multiRating} {this.state.multiRating == 1 ? 'star' : 'stars'} for selected contents ?</span>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-lg-6 col-sm-6 col-xs-6 confirm">
                <span className="btn-create" onClick={() => this.confirmMultiple(true)}>Yes</span>
              </div>
              <div className="col-md-6 col-lg-6 col-sm-6 col-xs-6 confirm">
                <span className="btn-create" onClick={() => this.confirmMultiple(false)}>No</span>
              </div>
            </div>
          </form>
          </div>}
          {this.state.confirmRating && <div className="container-fluid">
            <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button key="buttonCloseWarning2" style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Rating Success</span>
              </div>
            </div>
            </form>
          </div>}
        
          </Modal>
      </div>
    );
  }
}
