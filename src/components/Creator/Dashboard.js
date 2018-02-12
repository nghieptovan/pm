import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ChallengeActions from '../../redux/actions/challenge';
import NavHeader from '../NavHeader/NavHeaderCreator';
import DashboardBody from './DashboardBody';
import Upload from './Upload';

import constructionImg from '../../assets/page_construction.jpg';
import _ from 'lodash';
import { getCurrentUser } from '../../utils/common';

@connect(
  state => ({
    challenge: state.challenge  
  }),
  // ({
  //   // getLiveChallenge: (token) => ChallengeActions.getLiveChallenge(token)
  // }
  // )
)
export default class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      openUpload: false,
      idChallengeSet: 0,
      nameChallengeSet: ''
    }
  }
  static propTypes = { 
    challenge: PropTypes.object,
    // getLiveChallenge: PropTypes.func,
  };

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
          <DashboardBody openUpload={ this.openUpload} />               
      </div>
    );
  }
}