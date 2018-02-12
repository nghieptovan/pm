import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ChallengeActions from '../../redux/actions/challenge';
import NavHeader from '../NavHeader/NavHeaderCreator';
import ChallengeDetailCreatorBody from './ChallengeDetailCreatorBody';
import Upload from './Upload';
import constructionImg from '../../assets/page_construction.jpg';
import _ from 'lodash';
import { getCurrentUser, getClientId, getClientName } from '../../utils/common';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    challenge: state.challenge  
  }),
  ({
    getLiveChallenge: (token, page, maxRecords, brandName) => ChallengeActions.getLiveChallenge(token, page, maxRecords, brandName),
    creatorGetDashboard: (client, challenge) => ChallengeActions.creatorGetDashboard(client, challenge)
  }
  )
)
export default class ChallengeDetailCreator extends Component {
  constructor(props){
    super(props);
    this.state = {
      openUpload: false,
      idChallengeSet: 0,
      nameChallengeSet: '',
      dashboard: null,    
    }
  }
  static propTypes = { 
    challenge: PropTypes.object,
    getLiveChallenge: PropTypes.func,
  };
  componentWillReceiveProps(nextProps){
    const { challenge } = this.props;
    const { challenge: nextChallenge } = nextProps;
    if (challenge.getDashboard !== nextChallenge.getDashboard && nextChallenge.dashboard){
      this.setState({dashboard: nextChallenge.dashboard, loadingUpload: false});
    } else if (challenge.getDashboard !== nextChallenge.getDashboard && nextChallenge.error ){
      this.setState({error: nextChallenge.error, loadingUpload: false});      
    }  
  }
  
  componentWillMount(){
    const { clientName, challengeName } = this.props.params;
    const nameChallengeReply = challengeName.replace(/dotC/g,'.');
    this.props.creatorGetDashboard( clientName, encodeURIComponent(nameChallengeReply) );    
    const { challenge : { listLiveChallenges } } = this.props;      
    listLiveChallenges.length == 0 ? this.props.getLiveChallenge('token', 0, 50, clientName): '';
    this.setState({loadingUpload: true});
  }

  openUpload = (challenge) => {
    this.setState({openUpload: true, idChallengeSet: challenge.id, nameChallengeSet: challenge.name});
  }
   
  closeModal = () => {
    this.setState({openUpload: false});
  }
  openUploadModal = () => {
    this.setState({openUpload: true, idChallengeSet: 0});
  }
  render() {    
    const { challenge } = this.props;
    return (
      <div id="container">        
          <NavHeader openUpload={true} openUploadModal={this.openUploadModal} />                   
          <ChallengeDetailCreatorBody loadingUpload={this.state.loadingUpload} dashboard={this.state.dashboard}/> 
          
          {/* <Upload openUpload={this.state.openUpload} idChallengeSet={this.state.idChallengeSet} nameChallengeSet={this.state.nameChallengeSet} closeModal={this.closeModal} /> */}
      </div>
    );
  }
}