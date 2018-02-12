import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as ClientActions from '../../redux/actions/client';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import Modal from 'react-modal';
import moment from 'moment';
import 'react-widgets/lib/scss/react-widgets.scss';
import TinyMCE from 'react-tinymce';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import dataMap from '../../utils/config';
import {getCurrentUser} from '../../utils/common';
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';
import { hostname, s3URL} from '../../config';
import { Scrollbars } from 'react-custom-scrollbars';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import Autosuggest from 'react-autosuggest';
import Dropzone from 'react-dropzone';
import { login } from '../../redux/actions/auth';
import ReactLoading from 'react-loading';

const languages = [
    {
        name: 'C',
        year: 1972
    },
    {
        name: 'Elm2',
        year: 2012
    },
    {
        name: 'Elm3',
        year: 2012
    },
    {
        name: 'Elm4',
        year: 2012
    },
    {
        name: 'Elm5',
        year: 2012
    },
];
const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
  
    return inputLength === 0 ? [] : languages.filter(lang =>
      lang.name.toLowerCase().slice(0, inputLength) === inputValue
    );
};
const getSuggestionValue = suggestion => suggestion.name;

const renderSuggestion = suggestion => (
  <div>
    {suggestion.name}
  </div>
);
@connect(
    state => ({
      client: state.client
    }),
    ({
        getListCreators: (token, clientId) => ClientActions.getListCreators(token, clientId),
        exportCreator: (token, clientId) => ClientActions.exportCreator(token, clientId),
        importCreator: (token, clientId, data) => ClientActions.importCreator(token, clientId, data),
        exportRewardee: (token, clientId) => ClientActions.exportRewardee(token, clientId),
        sendMailToCreator: (token, data, time) => ClientActions.sendMailToCreator(token, data, time),
        getListCreatorsRewardees: (token, clientId) => ClientActions.getListCreatorsRewardees(token, clientId),        
    }
    )
  )

export default class CreatorsBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
        openAddCreator: false,
        error: '',
        loading:'',
        openSideBar: false,
        challengeError: '',
        originalLeft: [],
        selectedCreator: [],
        originalRight: [],
        unselectedCreator: [],
        sendList: [],
        leftFilter: [],
        rightFilter: [],
        bodyEmail: '',
        confirmRemove: false,
        errorSend: '',
        successSendMail: false,
        aToZStatus: false,
        sortSuggestionDirection: 'asc',
        sortAddedDirection: 'asc',
        selectAll: false,
        unSelectAll: false,
        listCreatorsRewardees: [],
        listCreatorsRewardeesSelected: [],
        listCreatorsRewardeesFilter: [],
        originalCreator: [],
        openAddNewCreator: false,
        value: '',
        suggestions: [],
        sortAlphaLeftDirection: 'desc',
        sortAlphaRightDirection: 'desc',
        sortRewardLeftDirection: 'desc',
        sortRewardRightDirection: 'desc',      
       }
  
  }
  static propTypes = {
    client: PropTypes.object,
    getListCreators: PropTypes.func,
    sendMailToCreator: PropTypes.func,
    getListCreatorsRewardees: PropTypes.func,
  }
  componentWillMount() {
    const { clientId, token } = getCurrentUser();
    if (token && clientId) {
      this.props.getListCreators(token, clientId);
      this.setState({loadingUpload: true});
    //   this.props.getListCreatorsRewardees(token, clientId);      
    }
  }
  componentWillReceiveProps(nextProps) {
    const { client : {loadListCreators, sendMailStatus, listRewardeesStatus} } = this.props;
    const { client : {
        loadListCreators: nextloadListCreators, 
        listCreators: nextlistCreators, 
        errorListCreator: nexterrorListCreator,
        sendMailStatus: nextsendMailCreator,
        listRewardeesStatus: nextlistRewardeesStatus,
        listRewardees: nextlistRewardees,
        listRewardeesError: nextlistRewardeesError,
        errorSendMailCreator
    } } = nextProps;
    const { client } = this.props;
    const { client: nextClient } = nextProps;
    loadListCreators !== nextloadListCreators && nextlistCreators ? this.setState({originalLeft: nextlistCreators, leftFilter: nextlistCreators, creatorList: nextlistCreators, originalCreator: nextlistCreators}) : this.setState({errorSend: nexterrorListCreator});
    this.props.client.loadingIcon !== nextProps.client.loadingIcon && nextProps.client.loadingIcon ==1 ?this.setState({loadingUpload: true}) :'';
    this.props.client.loadingIcon !== nextProps.client.loadingIcon && nextProps.client.loadingIcon !=1 ?this.setState({loadingUpload: false}) :'';
    if(sendMailStatus !== nextsendMailCreator && !errorSendMailCreator){
        tinymce.activeEditor.setContent('');
        this.setState({ successSendMail: true, errorSend: '' });
        setTimeout(() => {
          this.setState({ successSendMail: false,bodyEmail: [] });
        }, 1000);
    }
    if(sendMailStatus !== nextsendMailCreator && errorSendMailCreator){
        this.setState({ errorSend: errorSendMailCreator });
    }
    if(listRewardeesStatus !== nextlistRewardeesStatus && nextlistRewardeesStatus == 2){
        this.setState({ listCreatorsRewardees: nextlistRewardees, listCreatorsRewardeesFilter: nextlistRewardees  });
    }
    if(listRewardeesStatus !== nextlistRewardeesStatus && nextlistRewardeesStatus == 3){
        this.setState({ listCreatorsRewardees: [], listCreatorsRewardeesFilter: [] });
    }
    if (client.exportCStatus !== nextClient.exportCStatus && nextClient.exportCResult){
        const byteCharacters = atob(nextClient.exportCResult);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
        const fileName1 = `EnTribe_Creator_List ${moment().format('MMDDYY hhmm')}.xlsx`;
        nextClient.exportCStatus != 1 ? this.saveAs(blob1, fileName1) : '';
    }
    // if (client.exportRStatus !== nextClient.exportRStatus && nextClient.exportRResult){
    //     const byteCharacters = atob(nextClient.exportRResult);
    //     const byteNumbers = new Array(byteCharacters.length);
    //     for (let i = 0; i < byteCharacters.length; i++) {
    //         byteNumbers[i] = byteCharacters.charCodeAt(i);
    //     }
    //     const byteArray = new Uint8Array(byteNumbers);
    //     const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
    //     const fileName1 = "EnTribe_Top_Rewardee_List.xlsx";
    //     nextClient.exportRStatus != 1 ? this.saveAs(blob1, fileName1) : '';
    // }
    if(client.importStatus !== nextClient.importStatus && nextClient.importStatus == 2){
        const diffList = _.differenceWith(nextClient.importResult, this.state.rightFilter, _.isEqual);        
        this.setState({originalLeft: diffList, leftFilter: diffList, creatorList: nextClient.importResult, importSuccess: true, originalCreator: nextClient.importResult})
        setTimeout(() => {
          this.setState({ importSuccess: false });
        }, 1500);      
      }
      if(client.importStatus !== nextClient.importStatus && nextClient.importStatus == 3){
        this.setState({ importErrorStatus: true, importError: nextClient.importError });        
      }
}
handleOk = () => {
    this.setState({importErrorStatus: false});
}
exportRewardee = () => {
    const {token, clientId} = getCurrentUser();
    this.props.exportRewardee(token,clientId);
}
  closeModal = () =>{    
    // this.setState({openAddCreator: false, suggestionFilter : this.state.suggestionCreator, selectedFilter: this.state.sendListCreator });
    let {  selectedCreator, originalLeft, originalRight, sendList} = this.state;            
    let temp = _.difference(originalRight, sendList);     
    originalLeft = _.union(originalLeft,temp); 
    originalLeft = _.uniq(originalLeft); 
    originalRight = sendList;   
    this.refs.searchSuggestion.value ='';
    this.refs.searchAdded.value ='';
    this.setState({openAddCreator: false, originalLeft, originalRight, leftFilter:originalLeft, rightFilter: originalRight });    
  } 
  closeModalAddCreator = () => {
    let {  selectedCreator, originalLeft, originalRight, sendList} = this.state;            
    let temp = _.difference(originalRight, sendList);     
    originalLeft = _.union(originalLeft,temp); 
    originalLeft = _.uniq(originalLeft); 
    originalRight = sendList;   
    this.refs.searchSuggestion.value ='';
    this.refs.searchAdded.value ='';
    this.setState({openAddCreator: false, originalLeft, originalRight, leftFilter:originalLeft, rightFilter: originalRight });    
  }
  handleEditorChange = (e) => {
      this.setState({bodyEmail: e.target.getContent() });
  } 
  saveAs = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;
    document.body.appendChild(anchorElem);
    anchorElem.click();
    document.body.removeChild(anchorElem);
    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
}
  addCreator = (e) => {
    this.setState({openAddCreator: true});
  }
  renderItemTopRewardLeft = (creator, data) => {
    return (
        <div className="item-list" key={'toprewardleft'+data}>
            <div className="col-md-15-7 first-column"> 
                <Checkbox value={creator} className="checkbox-list-creator" />
                <span>{creator.firstName}</span>        
            </div>  
            <div className="col-md-15-7 text-left padding3"> 
                <span>{creator.lastName}</span>
            </div>
            <div className="col-md-20-7 text-left padding3"> 
                <span>{creator.email}</span>
            </div> 
            <div className="col-md-15-7 text-left padding3"> 
                <span>{creator.mobile}</span>
            </div> 
            <div className="col-md-10-7 text-center padding3"> 
                <span>{creator.uploads ? creator.uploads : 0}</span>
            </div>
            <div className="col-md-10-7 col-xs-1 text-center padding3"> 
                <span>{creator.rewardeds ? creator.rewardeds : 0}</span>
            </div> 
            <div className="col-md-15-7 text-left padding3"> 
                <span>{creator.location ? creator.location.substring(0, creator.location.length - 3)  : ''}</span>
            </div>
        </div>
    )
  }
  renderItemCheck = (creator, data) => {
    return (
        <div className="item-list" key={'suggest'+data}>
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 first-column"> 
                <Checkbox value={creator} className="checkbox-list-creator" />
                <span>{(creator.firstName ? creator.firstName : '') + ' ' + (creator.lastName ? creator.lastName : '')}</span>        
            </div> 
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.email}</span>
            </div> 
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.mobile}</span>
            </div>  
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.location ? creator.location.substring(0, creator.location.length - 3) : ''}</span>
            </div> 
        </div>
    )
  }
  renderItemTopReward = (creator, data) => {
    return (
        <div className="item-list" key={'topreward'+data}>
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 first-column"> 
                <Checkbox value={creator} className="checkbox-list-creator" />
                <span>{creator.firstName ? creator.firstName : '' + ' ' + creator.lastName ? creator.lastName: ''}</span>        
            </div>  
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 text-center"> 
                <span>{creator.email}</span>
            </div> 
            <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center"> 
                <span>{creator.uploads ? creator.uploads : 0}</span>
            </div>
            <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center"> 
                <span>{creator.rewardeds ? creator.rewardeds : 0}</span>
            </div> 
            <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center"> 
                <span>{creator.location ? creator.location.substring(0, creator.location.length - 3) : ''}</span>
            </div>
        </div>
    )
  }
  
  renderItemSelect = (creator, data) => {
    const name = (creator.firstName ? creator.firstName : '') + ' ' + (creator.lastName ? creator.lastName : '');
    return (
        <div className="item-list" key={'select'+data}>
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 first-column"> 
                <Checkbox value={creator} className="checkbox-list-creator" />
                <span>{name}</span>        
            </div> 
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.email}</span>
            </div> 
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.mobile}</span>
            </div>  
            <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                <span>{creator.location ? creator.location.substring(0, creator.location.length - 3) : ''}</span>
            </div> 
        </div>
    )
  }
  renderItemListMail = (creator, data) => {
    return (
        <div key={'listmap'+data} className="item-creator">
            <p className="createMail">{creator.email}</p>
            <i onClick={() => this.removeSingleMail(creator)} className="icon-thick-delete-icon" aria-hidden="true"></i>
        </div>
    )
  }
  rewardeesChanged = (newFlags) => {
    this.setState({
        listCreatorsRewardeesSelected: newFlags
    });
  }
  
  flagsChanged = (newFlags) => {
    this.setState({
        selectedCreator: newFlags
    });
  }
  flagsChanged2 = (newFlags) => {
    this.setState({
        unselectedCreator: newFlags
    });
  }
    addToSelect = () =>{
        let {leftFilter, originalLeft, selectedCreator, originalRight, rightFilter, unselectedCreator} = this.state;
        if(selectedCreator){
            originalRight = _.concat(originalRight, selectedCreator);
            originalLeft = _.difference(originalLeft, selectedCreator);
            selectedCreator = [];
            unselectedCreator = [];
            this.refs.searchSuggestion.value ='';
            this.refs.searchAdded.value ='';
            this.setState({originalLeft, leftFilter: originalLeft, selectedCreator, originalRight, unselectedCreator, rightFilter: originalRight, selectAll: false});
        }
    }
    addToUnSelect = () =>{
        let {leftFilter, originalLeft, selectedCreator, originalRight, rightFilter, unselectedCreator} = this.state;
        if(unselectedCreator){
            originalLeft = _.concat(originalLeft, unselectedCreator);
            originalRight = _.difference(originalRight, unselectedCreator);              
            selectedCreator = [];
            unselectedCreator = [];
            this.refs.searchSuggestion.value ='';
            this.refs.searchAdded.value ='';
            this.setState({originalLeft, leftFilter: originalLeft, selectedCreator, originalRight, unselectedCreator, rightFilter: originalRight, selectAll: false});
        }  
    }
    handleDone = () => {
        const { originalRight } = this.state;
        this.refs.searchSuggestion.value ='';
        this.refs.searchAdded.value ='';
        this.setState({sendList: originalRight, selectAll: false}, this.closeModalAddCreator);
    }
    removeSingleMail = creator => {
        this.setState({confirmRemove: true, selectedRemove: creator});
        
    }
    removeItemSendMail = type =>{
        let {selectedRemove, originalLeft, originalRight} = this.state;
        if(type){
            originalLeft = _.concat(originalLeft, selectedRemove);
            originalRight = _.pull(originalRight, selectedRemove);
        }
        this.setState({leftFilter: originalLeft, rightFilter: originalRight, originalLeft, originalRight, confirmRemove: false, selectedRemove: {}});
    } 
    handleChange = (e) =>{
        const { originalLeft} = this.state; 
        let search = this.refs.searchSuggestion.value.toLowerCase();     
        let resultName = originalLeft.filter(data => {
            if(data.firstName && data.lastName){
                return data.firstName.concat(' '+data.lastName).toLowerCase().includes(search);
            } else if (data.firstName && !data.lastName){
                return data.firstName.toLowerCase().includes(search);
            } else if (data.lastName && !data.firstName){
                return data.lastName.toLowerCase().includes(search);
            } else {
                return false
            }            
        });        
        let resultEmail = originalLeft.filter(data => data.email.toLowerCase().includes(search));
        let resultLocation = originalLeft.filter(data => data.location ? data.location.toLowerCase().includes(search) : false);
        let resultPhone = originalLeft.filter(data => data.mobile ? data.mobile.includes(search) : false);
        let result = _.union(resultName, resultEmail, resultPhone, resultLocation);
        result = _.uniq(result);
        !search ? result = originalLeft : '';
        this.setState({leftFilter: result});
    }
    handleChangeCreator = (e) => {
        const { originalCreator} = this.state; 
        let search = this.refs.searchCreatorList.value.toLowerCase();     
        let resultName = originalCreator.filter(data => {
            if(data.firstName && data.lastName){
                return data.firstName.concat(' '+data.lastName).toLowerCase().includes(search);
            } else if (data.firstName && !data.lastName){
                return data.firstName.toLowerCase().includes(search);
            } else if (data.lastName && !data.firstName){
                return data.lastName.toLowerCase().includes(search);
            } else {
                return false
            }            
        });        
        let resultEmail = originalCreator.filter(data => data.email.toLowerCase().includes(search));
        let resultLocation = originalCreator.filter(data => data.location ? data.location.toLowerCase().includes(search) : false);
        let resultPhone = originalCreator.filter(data => data.mobile ? data.mobile.includes(search) : false);
        let result = _.union(resultName, resultEmail, resultPhone, resultLocation);
        result = _.uniq(result);
        !search ? result = originalCreator : '';
        this.setState({creatorList: result});
    }
    handleChangeRewardee = (e) => {
        const { listCreatorsRewardeesFilter, listCreatorsRewardees } = this.state; 
        let search = this.refs.searchRewardee.value.toLowerCase();     
        let resultName = listCreatorsRewardeesFilter.filter(data => {
            if(data.firstName && data.lastName){
                return data.firstName.concat(' '+data.lastName).toLowerCase().includes(search);
            } else if (data.firstName && !data.lastName){
                return data.firstName.toLowerCase().includes(search);
            } else if (data.lastName && !data.firstName){
                return data.lastName.toLowerCase().includes(search);
            } else {
                return false
            }            
        });        
        let resultEmail = listCreatorsRewardeesFilter.filter(data => data.email.toLowerCase().includes(search));
        let resultLocation = listCreatorsRewardeesFilter.filter(data => data.location ? data.location.toLowerCase().includes(search) : false);
        let resultPhone = listCreatorsRewardeesFilter.filter(data => data.mobile ? data.mobile.includes(search) : false);
        let result = _.union(resultName, resultEmail, resultPhone, resultLocation);
        result = _.uniq(result);
        !search ? result = listCreatorsRewardees : '';
        this.setState({listCreatorsRewardeesFilter: result});
    }
    sortItemSuggestList = () => {
        let {leftFilter, sortSuggestionDirection} = this.state;           
        leftFilter = leftFilter.sort( (a, b) => (a.firstName && b.firstName) ? a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()): -1);               
        this.setState({leftFilter:  sortSuggestionDirection == 'desc' ? leftFilter : leftFilter.reverse(),
         sortSuggestionDirection: sortSuggestionDirection == 'asc' ? 'desc' : 'asc'});
    }
    sortAlpha = (type) => {        
        let {creatorList, listCreatorsRewardees, sortAlphaLeftDirection, sortAlphaRightDirection, listCreatorsRewardeesFilter} = this.state;        
        if(type =='left'){
            creatorList = creatorList.sort( (a, b) => (a.firstName && b.firstName) ? a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()): -1);               
            this.setState({creatorList:  sortAlphaLeftDirection == 'desc' ? creatorList : creatorList.reverse(),
        sortAlphaLeftDirection: sortAlphaLeftDirection == 'asc' ? 'desc' : 'asc'});
        } else {
            listCreatorsRewardeesFilter = listCreatorsRewardeesFilter.sort( (a, b) => (a.firstName && b.firstName) ? a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()): -1);               
            this.setState({listCreatorsRewardeesFilter:  sortAlphaRightDirection == 'desc' ? listCreatorsRewardeesFilter : listCreatorsRewardeesFilter.reverse(),
            sortAlphaRightDirection: sortAlphaRightDirection == 'asc' ? 'desc' : 'asc'});
        }
    }   
    sortReward = ( type) => {
        let {creatorList,listCreatorsRewardees , sortRewardLeftDirection, sortRewardRightDirection, listCreatorsRewardeesFilter} = this.state;    
        if(type == 'left'){       
            creatorList = creatorList.sort( (a, b) => a.rewardeds- b.rewardeds);               
        this.setState({creatorList:  sortRewardLeftDirection == 'desc' ? creatorList : creatorList.reverse(),
        sortRewardLeftDirection: sortRewardLeftDirection == 'asc' ? 'desc' : 'asc'});
        } else{
            listCreatorsRewardeesFilter = listCreatorsRewardeesFilter.sort( (a, b) => a.rewardeds - b.rewardeds);               
            this.setState({listCreatorsRewardeesFilter:  sortRewardRightDirection == 'desc' ? listCreatorsRewardeesFilter : listCreatorsRewardeesFilter.reverse(),
            sortRewardRightDirection: sortRewardRightDirection == 'asc' ? 'desc' : 'asc'});
        }
    }   
    handleChangeAdded = (e) =>{      
        const { originalRight } = this.state; 
        let search = e.target.value.toLowerCase();     
        let resultName = originalRight.filter(data => (data.firstName && data.lastName) ? 
            data.firstName.concat(' '+data.lastName).toLowerCase().includes(search):'');
        let resultEmail = originalRight.filter(data => data.email.toLowerCase().includes(search));
        let resultPhone = originalRight.filter(data => data.mobile ? data.mobile.includes(search) : false);
        let result = _.union(resultName, resultEmail, resultPhone);
        result = _.uniq(result);
        !search ? result = originalRight : '';
        this.setState({rightFilter: result});
    }
    sortItemAddedList = () => {
        let {rightFilter, sortAddedDirection} = this.state;                
        rightFilter = rightFilter.sort( (a, b) => (a.firstName && b.lastName) ? a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()):'');               
        this.setState({rightFilter:  sortAddedDirection == 'desc' ? rightFilter : rightFilter.reverse(),
        sortAddedDirection: sortAddedDirection == 'asc' ? 'desc' : 'asc'});
    }
    sendSendToCreator = () =>{
        const { clientId, token } = getCurrentUser();
        const access_time = moment();
        const {sendList, bodyEmail } = this.state;
        
        const listAddress = _.map(sendList, 'email');
        if (token) {
            const dataInput = {
                subject: 'Entribe send mail',
                listAddress: listAddress,
                content: bodyEmail
            }
            this.checkCondition(dataInput) ? this.props.sendMailToCreator(token, dataInput, access_time) : '';
        }              
    }
    checkCondition = data => {
        let returnData = true;
        data.listAddress.length === 0 ? (this.setState({errorSend: 'List Creators should not be empty.'}), returnData = false ): '';
        data.content.length === 0 ? (this.setState({errorSend: 'Content should not be empty.'}), returnData = false ) : '';
        return returnData;
    }
    selectAll = (type) => {
        let { leftFilter, rightFilter} = this.state;
        const selectAll = this.refs.checkToSelectAll;
        const unSelectAll = this.refs.checkToUnSelectAll;        
        if(type === 'left'){
            selectAll.checked ? this.setState({selectedCreator : leftFilter, selectAll: true}) : this.setState({selectedCreator : [], selectAll: false});
        }
        if(type === 'right'){
            unSelectAll.checked ? this.setState({unselectedCreator : rightFilter, unSelectAll: true}) : this.setState({unselectedCreator : [], unSelectAll: false});
        }
    }
    openAddNewCreator = () => {
        this.setState({openAddNewCreator: true});
    }
    onChange = (event, { newValue }) => {
        this.setState({
            value: newValue
        });
    };
    onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
        suggestions: getSuggestions(value)
    });
    };
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };
    exportCreator = () =>{
        const { token, clientId } = getCurrentUser();
        this.props.exportCreator(token,clientId);
    }
    onDrop = (files, type) => {
        const { token, clientId } = getCurrentUser();       
        const access_time = moment();
        const fileSplit = files[0].name.split('.');
        const fileType = fileSplit[fileSplit.length - 1];        
        if(fileType === 'xlsx' || fileType === 'xls' || fileType === 'xlt'
        || fileType === 'xlm' || fileType === 'xlsm' || fileType === 'xltx'
        || fileType === 'xltm' || fileType === 'xlsb' || fileType === 'xla'
        || fileType === 'xlam' || fileType === 'xll' || fileType === 'xlw'){
            this.setState({ contentError: '' });
            let reader = new FileReader();
            reader.readAsDataURL(files[0]);          
            reader.onload = () => {             
                const body = {
                    data : reader.result.split(',')[1]
                };
                this.props.importCreator( token, clientId, body);
            }            
        }else{
          this.handleErrorModal('Please upload excel file.');
        }        
    }
    handleErrorModal = (error) => {
        this.setState({showError: true,  contentError: error});
        this.startTimer();
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
    closeModal = () => {
        this.setState({showError: false, contentError:''});
    }
  render() {
    const { client } = this.props;   
    const { value, suggestions } = this.state;
    
    const inputProps = {
        placeholder: 'Type...',
        value,
        onChange: this.onChange
    };
    let dropzoneRef;
    return (
        
        <div id="page-wrapper">
            <Tabs>
                <TabList>
                <Tab>Creators</Tab>
                <Tab>Mail</Tab>
                </TabList>

                <TabPanel>
                    <div className="creators-page" >
                        <div className="container-fluid" >
                            <Scrollbars autoHide style={{ height: window.innerHeight - 112 }} renderThumbVertical={({ style, ...props }) =>
                            <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                            }>
                            <div className="col-lg-12 col-md-12 padding5">
                                <div className="content-page left-page" style={{ height: window.innerHeight - 144 + 'px'}}>
                                    <div className="block-list-creator">                                        
                                        <div className="row action-bar">
                                            <div className="col-lg-12 col-md-12">
                                                <div className="left-side"> 
                                                    <button className="btn btn-default btn-export" onClick={this.exportCreator}>Export</button>   
                                                    <Dropzone style={{ display: 'none'}} ref={(node) => { dropzoneRef = node; }} onDrop={(files) => this.onDrop(files)}/>
                                                    <button className="btn btn-default btn-export"  style={{ marginLeft: '5px'}} onClick={() => { dropzoneRef.open() }}>Import</button>
                                                    </div>
                                                <div className="right-side">
                                                    <div className="input-group">
                                                        <input type="text" className="form-control input-search" ref="searchCreatorList"
                                                        onChange={(e) => this.handleChangeCreator(e)}
                                                            placeholder="Search..." />
                                                    </div>
                                                    <div className="search-btn">
                                                        <button className="btn btn-search-icon">
                                                        <i className="icon-search-icon"></i>
                                                        </button>
                                                    </div>
                                                    {/* <button className="btn btn-default btn-addnew" onClick={this.openAddNewCreator2}>New Creator</button> */}
                                                    <div className="sort-list-creator" >
                                                        <i style={{marginRight: '5px'}} onClick={() => this.sortAlpha('left')} className={this.state.sortAlphaLeftDirection == 'asc' ? 'fa fa-sort-alpha-asc' : 'fa fa-sort-alpha-desc'}></i>
                                                        <span onClick={() => this.sortReward('left')} className={this.state.sortRewardLeftDirection == 'desc' ? 'icon-reward-sort-down' : 'icon-reward-sort-up'}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row list-creator">
                                            
                                            <div className="header-list">
                                                <div className="col-md-15-7 padding3">
                                                    <input type="checkbox" className="checkbox-list-creator" checked={this.state.selectAll} onChange={()=>this.selectAll('left')} ref="checkToSelectAll" /> 
                                                    <span style={{marginLeft: '20px'}}>First Name</span> 
                                                </div> 
                                                <div className="col-md-15-7 text-left padding3"> 
                                                    Last Name
                                                </div>
                                                <div className="col-md-20-7 text-left padding3"> 
                                                    MAIL ID
                                                </div> 
                                                <div className="col-md-15-7 text-left padding3"> 
                                                    CONTACT
                                                </div>  
                                                <div className="col-md-10-7 text-center padding3"> 
                                                    UPLOADS
                                                </div> 
                                                <div className="col-md-10-7 text-center padding3"> 
                                                    REWARDS
                                                </div> 
                                                <div className="col-md-15-7 text-left padding3"> 
                                                    LOCATION
                                                </div> 
                                            </div>                                           
                                            <Scrollbars autoHide style={{ height: window.innerHeight - 239 }} renderThumbVertical={({ style, ...props }) =>
                                            <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                                            }>  
                                            <div className="content-list">
                                            {this.state.creatorList && <CheckboxGroup
                                            name="selectedCreator"
                                            value={this.state.selectedCreator}
                                            onChange={this.flagsChanged}>
                                            { this.state.creatorList.map(this.renderItemTopRewardLeft, this, '')}
                                            </CheckboxGroup>
                                            }
                                            </div>
                                            </Scrollbars>
                                            {this.state.loadingUpload && 
                                                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                                            } 
                                        </div>
                                        
                                        
                                    </div>
                                </div>
                            </div>
                            {/* <div className="col-lg-5 col-md-6 padding5">
                                <div className="content-page right-page" style={{ height: window.innerHeight - 144 + 'px'}}>
                                <div className="block-list-creator">
                                        
                                        <div className="row action-bar">
                                            <div className="col-lg-12 col-md-12">
                                                <div className="left-side">   
                                                <span>TOP REWARDEES</span>                                
                                                </div>
                                                <div className="right-side">
                                                    <button className="btn btn-default btn-export" style={{marginRight: '5px'}} onClick={this.exportRewardee}>Export  <span className="caret"></span></button>   
                                                    <div className="input-group">
                                                        <input type="text" className="form-control input-search" ref="searchRewardee"
                                                        onChange={(e) => this.handleChangeRewardee(e)}
                                                            placeholder="Search..." />
                                                    </div>
                                                    <div className="search-btn">
                                                        <button className="btn btn-search-icon">
                                                        <i className="icon-search-icon"></i>
                                                        </button>
                                                    </div>
                                                    <div className="sort-list-creator">
                                                        <i style={{marginRight: '5px'}} onClick={() => this.sortAlpha('right')} className={this.state.sortAlphaRightDirection == 'asc' ? 'fa fa-sort-alpha-asc' : 'fa fa-sort-alpha-desc'}></i>
                                                        <span onClick={() => this.sortReward('right')} className={this.state.sortRewardRightDirection == 'desc' ? 'icon-reward-sort-down' : 'icon-reward-sort-up'}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row list-creator">
                                            
                                            <div className="header-list">
                                                <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3">                                 
                                                    <input type="checkbox" className="checkbox-list-creator" checked={this.state.selectAll} onChange={()=>this.selectAll('left')} ref="checkToSelectAll" />
                                                    <span>
                                                    CREATORS
                                                    </span>                                
                                                </div>  
                                                <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 text-center padding3"> 
                                                    MAIL ID
                                                </div> 
                                                <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center padding3"> 
                                                    UPLOADS
                                                </div> 
                                                <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center padding3"> 
                                                    REWARDS
                                                </div> 
                                                <div className="col-md-2 col-lg-2 col-sm-2 col-xs-2 text-center padding3"> 
                                                    LOCATION
                                                </div> 
                                            </div>
                                            <Scrollbars autoHide style={{ height: window.innerHeight - 199 }} renderThumbVertical={({ style, ...props }) =>
                                            <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                                            }>  
                                            <div className="content-list">
                                            {this.state.listCreatorsRewardeesFilter && <CheckboxGroup
                                            name="selectedCreator"
                                            value={this.state.listCreatorsRewardeesSelected}
                                            onChange={this.rewardeesChanged}>
                                            { this.state.listCreatorsRewardeesFilter.map(this.renderItemTopReward, this, '')}
                                            </CheckboxGroup>
                                            }
                                            </div>
                                            </Scrollbars>
                                        </div>
                                        
                                        
                                    </div>
                                </div>
                            </div> */}
                            </Scrollbars>
                        </div>
                    
                    </div>
                </TabPanel>
                <TabPanel>
                <div className="creator-client">
                    <div className="row scroll-peihgn" style={{ height: window.innerHeight - 124 + 'px'}}>
                    {this.state.loadingUpload && 
                            <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                            }
                    <div className="col-lg-8 col-md-8 col-sm-6 col-xs-12">
                        <div className="message-block">                       
                            <div className="header-message">
                                <span>New message</span>
                            </div>                           
                            <div className="body-message" style={{ height: window.innerHeight - 184 + 'px'}}>
                            <TinyMCE
                                content=""
                                config={{
                                    selector: 'textarea',
                                    plugins: 'image code',
                                    toolbar: 'undo redo | image code',
                                    image_title: true,
                                    automatic_uploads: true,
                                    file_picker_types: 'image',
                                    file_picker_callback: function(cb, value, meta) {
                                    let input = document.createElement('input');
                                    input.setAttribute('type', 'file');
                                    input.setAttribute('accept', 'image/*');                     
                                    input.onchange = function() {
                                        var file = this.files[0];
                                        var reader = new FileReader();
                                        reader.onload = function () {
                                            // Note: Now we need to register the blob in TinyMCEs image blob
                                            // registry. In the next release this part hopefully won't be
                                            // necessary, as we are looking to handle it internally.
                                            var id = 'blobid' + (new Date()).getTime();
                                            var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                                            var base64 = reader.result.split(',')[1];
                                            var blobInfo = blobCache.create(id, file, base64);
                                            
                                            blobCache.add(blobInfo);

                                            var url = hostname+"/api/content/mail/upload";
                                            var data = {};
                                            data.content = base64;
                                            var json = JSON.stringify(data);
                                            new Promise((resolve, reject) => {
                                                const xhr = new XMLHttpRequest();
                                                xhr.open("POST", url, true);
                                                xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
                                                xhr.onload = () => {
                                                    var result = JSON.parse(xhr.response);
                                                    cb(s3URL+result.result, { title: file.name });                                                   
                                                    resolve(xhr.responseText);                                                    
                                                }
                                                xhr.onerror = () => {
                                                    cb(blobInfo.blobUri(), { title: file.name });
                                                    reject(xhr.statusText);
                                                } 
                                                xhr.send(json);
                                            });                             

                                        // call the callback and populate the Title field with the file name
                                        
                                        };
                                        reader.readAsDataURL(file);
                                    };
                                    
                                    input.click();
                                    },
                                    height: window.innerHeight - 234                         
                                }}
                                    onChange={this.handleEditorChange}
                                />
                            </div>
                            <div className="footer-message">
                                <span className="error-msg pull-left">{this.state.errorSend}</span>
                                <span className="send-button pull-right" onClick={() => this.sendSendToCreator()}>Send</span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                        <div className="creator-block" style={{ height: window.innerHeight - 124 + 'px'}}>
                            <div className="add-creator">
                                <span onClick={this.addCreator}>Add Creators</span>
                            </div>
                            <Scrollbars autoHide style={{ height: window.innerHeight - 254 }} renderThumbVertical={({ style, ...props }) =>
                            <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                            }>
                            <div className="body-creator">
                                {this.state.sendList && this.state.sendList.map(this.renderItemListMail, this, '')}
                            </div>
                            </Scrollbars>
                        </div>
                        </div>
                    </div>
                </div>
                </TabPanel>
            </Tabs>
            
            <Modal
                isOpen={this.state.openAddCreator}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModalAddCreator}
                shouldCloseOnOverlayClick={true}
                className={{
                    base: 'custom_Modal',
                    afterOpen: 'custom_Modal_creatorbody',
                    beforeClose: 'custom_before-close'
                }}
                overlayClassName={{
                    base: 'custom_Overlay',
                    afterOpen: 'customOverlay_after-open',
                    beforeClose: 'customOverlay_before-close'
                }}
                contentLabel="Example Modal">
                <div className="container-fluid">
                        <div className="row">
                        <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12"> 
                        <div className="container-fluid block-list-creator">
                                <div className="action-bar">
                                    <div className="left-side">                                   
                                    </div>
                                    <div className="right-side">
                                        <div className="input-group">
                                            <input type="text" className="form-control input-search" ref="searchSuggestion"
                                            onChange={(e) => this.handleChange(e)}
                                                placeholder="Search..." />
                                        </div>
                                        <div className="search-btn">
                                            <button className="btn btn-search-icon">
                                            <i className="icon-search-icon"></i>
                                            </button>
                                        </div>
                                        <div className="sort-list-creator" onClick={() => this.sortItemSuggestList()}>
                                            <i className={this.state.sortSuggestionDirection == 'asc' ? 'fa fa-sort-alpha-asc' : 'fa fa-sort-alpha-desc'}></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-list">
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 first-column">                                 
                                        <input type="checkbox" className="checkbox-list-creator" checked={this.state.selectAll} onChange={()=>this.selectAll('left')} ref="checkToSelectAll" />
                                        <span>
                                        CREATORS
                                        </span>                                
                                    </div>  
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        MAIL ID
                                    </div> 
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        MOBILE
                                    </div>  
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        LOCATION
                                    </div> 
                                </div>
                                <Scrollbars autoHide style={{ height: 300 }} renderThumbVertical={({ style, ...props }) =>
                        <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                        }>  
                                <div className="list-creator">
                                {this.state.leftFilter && <CheckboxGroup
                                name="selectedCreator"
                                value={this.state.selectedCreator}
                                onChange={this.flagsChanged}>
                                { this.state.leftFilter.map(this.renderItemCheck, this, '')}
                                </CheckboxGroup>
                                }
                                </div>
                                </Scrollbars>
                        </div>
                        </div>
                        <div className="add-remove-list">
                            <span onClick={() => this.addToSelect()} className="add-list">
                                <i className="icon-arrow-right"></i>
                            </span>
                            <span onClick={() => this.addToUnSelect()} className="add-list">
                                <i className="icon-arrow-left"></i>
                            </span>
                            <span onClick={() => this.addToSelect()} className="add-list2">
                                <i className="icon-arrow-down"></i>
                            </span>
                            <span onClick={() => this.addToUnSelect()} className="add-list2 transform-up">
                                <i className="icon-arrow-down"></i>
                            </span>
                        </div>
                        <div className="col-md-6 col-lg-6 col-sm-12 col-xs-12"> 
                        <div className="container-fluid block-list-creator selected-block">
                                <div className="action-bar">
                                    <div className="right-side">
                                        <div className="input-group">
                                            <input type="text" className="form-control input-search" ref="searchAdded"
                                            onChange={(e) => this.handleChangeAdded(e)}
                                                placeholder="Search..." />
                                        </div>
                                        <div className="search-btn">
                                            <button className="btn btn-search-icon">
                                            <i className="icon-search-icon"></i>
                                            </button>
                                        </div>
                                        <div className="sort-list-creator" onClick={() => this.sortItemAddedList()}>
                                            <i className={this.state.sortAddedDirection == 'asc' ? 'fa fa-sort-alpha-asc' : 'fa fa-sort-alpha-desc'}></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="header-list">
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3 first-column">                                 
                                    <input type="checkbox" className="checkbox-list-creator" checked={this.state.unSelectAll} onChange={()=>this.selectAll('right')} ref="checkToUnSelectAll" />
                                        <span>
                                        CREATORS
                                        </span>                                
                                    </div>  
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        MAIL ID
                                    </div> 
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        MOBILE
                                    </div>  
                                    <div className="col-md-3 col-lg-3 col-sm-3 col-xs-3"> 
                                        LOCATION
                                    </div> 
                                </div>

                                    <Scrollbars autoHide style={{ height: 300 }} renderThumbVertical={({ style, ...props }) =>
                                        <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-3px' }}/>
                                        }>  
                                        <div className="list-creator">
                                        {this.state.rightFilter && <CheckboxGroup
                                        name="unselectedCreator"
                                        value={this.state.unselectedCreator}
                                        onChange={this.flagsChanged2}>
                                        { this.state.rightFilter.map(this.renderItemSelect, this, '')}
                                        </CheckboxGroup>}
                                        </div>
                                    </Scrollbars>
                            </div>
                            </div>   
                            </div>              
                        <div className="row">      
                            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                                <span onClick={this.handleDone} className="send-button pull-right">Done</span>
                            </div>
                        </div>
                </div>         
            </Modal>
            <Modal
                isOpen={this.state.confirmRemove}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                shouldCloseOnOverlayClick={true}
                className={{
                    base: 'custom_Modal',
                    afterOpen: 'custom_Modal_confirmRemove',
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
                    <div className="row text-center">
                        <div className="remove-icon"><i className="icon-cyclebin-icon"></i></div>
                        
                    </div>   
                    <div className="row text-center">
                    <span style={{lineHeight: '40px'}}>Are you sure want to remove this creator?</span>
                    </div>
                    <div className="row confirm-group">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 text-center">
                            <span onClick={() => this.removeItemSendMail(true)}>
                                Yes
                            </span>
                        </div> 
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 text-center">
                            <span onClick={() => this.removeItemSendMail(false)}>
                                No
                            </span>    
                        </div>   
                    </div> 
                </div>        
            </Modal>
            <Modal
                isOpen={this.state.successSendMail}
                className={{
                    base: 'custom_Modal',
                    afterOpen: 'custom_Modal_confirmRemove',
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
                    <div className="col-md-12 col-lg-12 col-sm-12 icon">
                        <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                    </div>
                        </div>
                        <div className="row">
                        <div className="col-md-12 col-lg-12 col-sm-12">
                            <span className='title-confirm-popup'>Send mail sucessfull.</span>
                        </div>
                        </div>
                    </form> 
                </div>        
            </Modal>
            <Modal
                isOpen={this.state.openAddNewCreator}
                shouldCloseOnOverlayClick={true}
                className={{
                    base: 'custom_Modal',
                    afterOpen: 'custom_add_creator_mail',
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
                            <div className="col-md-12 col-lg-12 col-sm-12 text-center">
                                <span className='title'>New Creator</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12 text-center detail-creator">
                                <span>Creator Detail</span>
                                <Autosuggest
                                    suggestions={suggestions}
                                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                    onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                    getSuggestionValue={getSuggestionValue}
                                    renderSuggestion={renderSuggestion}
                                    inputProps={inputProps}
                                />
                            </div>
                        </div>
                    </form> 
                </div>        
            </Modal>
            <Modal
          isOpen={this.state.importSuccess}       
          shouldCloseOnOverlayClick={false}
          onAfterOpen={this.afterOpenModal}
          className={{
            base: 'custom_Modal',
            afterOpen: 'modal_import_reward_error',
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
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                  <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <span className='title-confirm-popup'>Import Success</span>
                </div>
              </div>
              </form>         
            </div>
        
        </Modal>
          <Modal
          isOpen={this.state.importErrorStatus}       
          shouldCloseOnOverlayClick={false}
          onAfterOpen={this.afterOpenModal}
          className={{
            base: 'custom_Modal',
            afterOpen: 'modal_import_reward_error',
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
            <div className="col-md-12 col-lg-12 col-sm-12 icon">
              <button style={{margin: '10px'}} className="btn btn-danger btn-circle btn-lg" type="button"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></button>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12">
              <span className='title-confirm-popup'>{this.state.importError}</span>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 col-lg-12 col-sm-12 text-center">
             <button className="btn btn-warning btn-ok" onClick={this.handleOk}>OK</button>
            </div>
          </div>
          </form>        
          </div>        
          </Modal>
          <Modal
            isOpen={this.state.showError}       
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
            <div className="col-md-12 col-lg-12 col-sm-12 icon">
              <button style={{margin: '10px'}} className="btn btn-danger btn-circle btn-lg" type="button"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></button>
            </div>
          </div>
          <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12">
          <span className='title-confirm-popup'>{this.state.contentError}</span>
      </div>
          </div>
            <div className="row">
            </div>
            </form>
            </div>
          </Modal>  
        </div>
    );
  }
}