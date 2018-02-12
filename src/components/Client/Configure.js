import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import ConfigureBody from './ConfigureBody';
import './Configure.scss';
import Modal from 'react-modal';
import moment from 'moment';
import 'react-widgets/lib/scss/react-widgets.scss';

export default class Configure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAddCreator: false,
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
  
  addCreator = () => {
    this.setState({openAddCreator: true});
  }
  
  closeModal = () =>{
    this.setState({openAddCreator: false});
  }  
  
  render() {
    const { params: { shortName } } = this.props;
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName={shortName} selected="settings/configure" expanded={true} />
          <NavHeaderClient title='Configure' />
          <ConfigureBody />
        </div>   
      </div>
    );
  }
}

