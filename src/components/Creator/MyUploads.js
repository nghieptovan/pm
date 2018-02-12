import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import moment from 'moment';
import NavHeader from '../NavHeader/NavHeaderCreator';
import MyUploadsBody from './MyUploadsBody';
import * as ContentActions from '../../redux/actions/content';

@connect(
    state => ({
      content: state.content
    }),
    ({
        creatorGetMyUpload: (token) => ContentActions.creatorGetMyUpload(token)
    }
    )
  )
export default class MyUploads extends Component {
    constructor(props){
        super(props);
        this.state = {
          openUpload: false,
          idChallengeSet: 0,
          nameChallengeSet: '',         
        }
      }
      static propTypes = { 
        content: PropTypes.object,
        creatorGetMyUpload: PropTypes.func,
      };
    
      componentWillMount(){
        const { token, id: creatorID } = getCurrentUser();
        !creatorID ? browserHistory.push('/') : this.props.creatorGetMyUpload(token);
        this.setState({loadingUpload: true})
      }
      openUpload = (challenge) => {
        this.setState({openUpload: true, idChallengeSet: challenge.id, nameChallengeSet: challenge.name});
      }
      componentWillReceiveProps(nextProps){
        this.props.content.loadingIcon !== nextProps.content.loadingIcon && nextProps.content.loadingIcon ==1   ? this.setState({loadingUpload: true}): '';
        this.props.content.loadingIcon !== nextProps.content.loadingIcon && nextProps.content.loadingIcon !=1   ? this.setState({loadingUpload: false}): '';
      }
      closeModal = () => {
        this.setState({openUpload: false});
      }
      openUploadModal = () => {
        this.setState({openUpload: true, idChallengeSet: 0});
      }


  render() {
    const { content: { listMyUpload } } = this.props;
    return (
        <div id="container">        
            <NavHeader openUpload={false} openUploadModal={this.openUploadModal} />
            <MyUploadsBody loadingUpload={this.state.loadingUpload} listMyUpload={listMyUpload} />
        </div>
        
    )
  }
}
