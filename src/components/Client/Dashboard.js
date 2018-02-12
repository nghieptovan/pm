import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import DashboardBody from './DashboardBody';
import CreateChallenge from '../CreateChallenge/CreateChallenge';
import './Dashboard.scss';
import Modal from 'react-modal';
import moment from 'moment';
import 'react-widgets/lib/scss/react-widgets.scss';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openCreateChallenge: false,
      error: '',
      loading:'',
      openSideBar: false      
    }
  }
  static propTypes = {
    challenge: PropTypes.object,
    createChallenge: PropTypes.func,
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
  
  render() {
    const { params: { shortName } } = this.props;
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName={shortName} selected="dashboard" />
          <NavHeaderClient title='Dashboard' isShowedCreateChallenge={true} createChallenge={this.createChallenge} />
          <DashboardBody />
        </div>   
        <CreateChallenge shortName={shortName} openCreateChallenge={this.state.openCreateChallenge} isDashboard={true} closeModal={this.closeModal} /> 
      </div>
    );
  }
}

