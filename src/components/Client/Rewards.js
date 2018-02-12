 import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import RewardsBody from './RewardsBody';
import CreateChallenge from '../CreateChallenge/CreateChallenge';
import './Dashboard.scss';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ClientActions from '../../redux/actions/client';
import * as ChallengeActions from '../../redux/actions/challenge';
import * as FileClientsActions from '../../redux/actions/fileclients';
import Dropzone from 'react-dropzone';
import Multiselect from 'react-widgets/lib/Multiselect'
import 'react-widgets/lib/scss/react-widgets.scss';

@connect(
  state => ({
    client: state.client
  }),
  ({ contentRewardedList: (id, token) => ClientActions.contentRewardedList(id, token),
    importRewardClient: (clientId, dataInput, token, access_time) => FileClientsActions.importRewardClient(clientId, dataInput, token, access_time) })
)


export default class Rewards extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCreateChallenge: false,
      error: '',
      loading:'',
      openSideBar: false,
      searchList: [],
      searching: false,     
    }
  }
  static propTypes = {
    challenge: PropTypes.object,
    createChallenge: PropTypes.func,
    searchReward: PropTypes.func,
  }
  componentWillMount() {
    if (!(this.props.params.shortName || '')) {
      browserHistory.push('/client');
    }
  }
  
  createChallenge = () => {
    this.setState({openCreateChallenge: true});
  }
  
  closeModal = () =>{
    this.setState({openCreateChallenge: false});
  }
  
  searchReward = (input) => {
   this.setState({searchReward: input});
  }
  onDrop = (files, type) => {
    const { clientId, token } = getCurrentUser();
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
                data : reader.result.split(',')[1],
                isIgnored: false
            };
            this.setState({body: body},  this.props.importRewardClient(clientId, body, token, access_time));           
        }            
    }else{
      this.handleErrorModal('Please upload excel file.');
    }        
}
handleReImport = () => {
    const { clientId, token } = getCurrentUser();
    const access_time = moment();
    let body = this.state.body;
    body.isIgnored = true;
    this.props.importRewardClient(clientId, body, token, access_time);
}
handleErrorModal = (error) => {
    this.setState({showError: true,  contentError: error});
    this.startTimer();
}
startTimer = () => {
    this.setState({ timeCountDown: 1500 });
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
    const { params: { shortName } } = this.props;
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName={shortName} selected="rewards" />
          <NavHeaderClient onDrop={this.onDrop} title='Rewards' showSearch={true} isShowedCreateChallenge={false} 
          createChallenge={this.createChallenge} searchReward={(input) => this.searchReward(input)} />
          <RewardsBody searchReward={this.state.searchReward} handleReImport={this.handleReImport} searchList={this.state.searchList} searching={this.state.searching} />
        </div>   
        <CreateChallenge shortName={shortName} openCreateChallenge={this.state.openCreateChallenge} closeModal={this.closeModal} /> 
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

