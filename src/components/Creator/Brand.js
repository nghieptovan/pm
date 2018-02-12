import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ClientActions from '../../redux/actions/client';
import NavHeader from '../NavHeader/NavHeaderCreator';
import BrandBody from './BrandBody';
import Upload from './Upload';
import constructionImg from '../../assets/page_construction.jpg';
import _ from 'lodash';
import { getCurrentUser } from '../../utils/common';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    client: state.client  
  }),
  ({
    getList: token => ClientActions.getListLiveChallenge(token)
  }
  )
)
export default class Brand extends Component {
  constructor(props){
    super(props);
    this.state = {
      openUpload: false,
      idChallengeSet: 0,   
      loadingUpload: null,
      listClient: []
    }
  }
  static propTypes = { 
    challenge: PropTypes.object   
  };

  componentWillMount(){
    this.props.getList('token');
    this.setState({loadingUpload: true});
    // const { token, id: creatorID } = getCurrentUser();
    // !creatorID ? browserHistory.push('/') : this.props.getList(token);
  }
  componentWillReceiveProps(nextProps){
    const { client } = this.props;
    const { client : nextClient } = nextProps;
    client.loadingGetLiveChallenge != nextClient.loadingGetLiveChallenge && nextClient.loadingGetLiveChallenge == 1 ? this.setState({loadingUpload : true}) : '';
    client.loadingGetLiveChallenge != nextClient.loadingGetLiveChallenge && nextClient.loadingGetLiveChallenge == 2 ? this.setState({loadingUpload : false, listClient : nextClient.listClient}) : '';
    client.loadingGetLiveChallenge != nextClient.loadingGetLiveChallenge && nextClient.loadingGetLiveChallenge == 3 ? this.setState({loadingUpload : false}) : '';
  }
  openUpload = (idChallenge) => {
    this.setState({openUpload: true, idChallengeSet: idChallenge});
  }
   
  closeModal = () => {
    this.setState({openUpload: false});
  }
  render() {    
    const { client: {listClient} } = this.props;    
    return (
      <div id="container">        
          <NavHeader openUpload={false}/>
          <BrandBody loadingUpload={this.state.loadingUpload} openUpload={ this.openUpload} listClient={this.state.listClient} />     
        </div>
    );
  }
}