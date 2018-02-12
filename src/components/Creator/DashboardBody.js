import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import * as ChallengeActions from '../../redux/actions/challenge';
import './DashboardBody.scss';
import constructionImg from '../../assets/page_construction.jpg';
import imgItem from '../../assets/img/no-img.png';
import _ from 'lodash';
import { getCurrentUser, getClientId, getClientName } from '../../utils/common';
import moment from 'moment';
import LazyLoad from 'react-lazy-load';
import Rewarded from './Rewarded';
import {s3URL} from '../../config'
import { Scrollbars } from 'react-custom-scrollbars';
import classNames from 'classnames';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    challenge: state.challenge  
  }),
  ({
    getLiveChallenge: (token, page, maxRecords, brandName) => ChallengeActions.getLiveChallenge(token, page, maxRecords, brandName)
  }
  )
)
export default class DashboardBody extends Component {
  constructor(props) {
    super(props);
    this.state = {    
      list: [],
      loadingUpload: null
    }
  }
  static propTypes = { 
    challenge: PropTypes.object,
    getLiveChallenge: PropTypes.func,
    openUpload: PropTypes.func,
  };
  componentWillMount(){
    const clientName = getClientName();     
    if(!clientName){
      browserHistory.push('/') 
    }
    this.props.getLiveChallenge('token', 0, 50, clientName);
  }
  componentWillReceiveProps(nextProps){
    const { challenge } = this.props;
    const { challenge : nextChallenge } = nextProps;
    challenge.loadingLiveChallenge != nextChallenge.loadingLiveChallenge && nextChallenge.loadingLiveChallenge == 1 ? this.setState({loadingUpload : true }): '';
    challenge.loadingLiveChallenge != nextChallenge.loadingLiveChallenge && nextChallenge.loadingLiveChallenge == 2 ? this.setState({loadingUpload : false, list: nextChallenge.listLiveChallenges }): '';
    challenge.loadingLiveChallenge != nextChallenge.loadingLiveChallenge && nextChallenge.loadingLiveChallenge == 3 ? this.setState({loadingUpload : false }): '';
  }
  openUpload = (challenge) => {
    this.props.openUpload(challenge);
  }
  goToChallenge = (challenge) => {
    const trimChallenge = challenge.name.toLowerCase().replace(/\s+/g, '');
    const nameChallenge = encodeURIComponent(trimChallenge.replace(/\./g,'dotC'));   
    
    const nameClient = sessionStorage.getItem('clientName');
    browserHistory.push(`/${nameClient}/${nameChallenge}/detail`);
  }
  renderItemLiveChallenge = (challenge, data) => {
    const { token } = getCurrentUser();
    let totaluploads, imgUrl;
    challenge.totalUploads ? totaluploads = challenge.totalUploads : totaluploads = 0;    
    challenge.imageUri ? imgUrl = s3URL+challenge.imageUri : imgUrl = imgItem;

    return (
      <div className={classNames('col-lg-3 col-md-3 col-sm-4 col-xs-6 item', { 'item-no-token': !token && window.innerWidth > 1024 })} key={challenge.name+challenge.id}>
      {/* <div className="content-item" onClick={() => this.openUpload(challenge)}> */}
      <div className="content-item" onClick={() => this.goToChallenge(challenge)}>
        <div className="header-item"><p>Last date for submissions {moment(challenge.endDate).format('MM/DD/YYYY')}</p>
          <p>Total uploads: {totaluploads}</p>
        </div>
        <div className="body-item">
        <LazyLoad height={170}>
            <img src={imgUrl} />
        </LazyLoad>
        </div>
        <div className="footer-item">
          <span className="name">
            {challenge.name.length > 25 ? `${challenge.name.substring(0, 22)}...`: challenge.name }
          </span> 
          {/* <span onClick={() => this.openUpload(challenge)} className="take">TAKE</span> */}
        </div>                  
      </div>
      
      </div>
    )
  }
  
  render() {   
    const { list } = this.state;    
    const { token } = getCurrentUser();
    console.log(list)
    return (      
      <div id="wrapper">
      <div className="creator-dashboard" style={{ height: window.innerHeight - 60 + 'px'}}>
      {this.state.loadingUpload &&
          <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
          }        
        {!this.state.loadingUpload &&
          <Scrollbars autoHide style={{ height: window.innerHeight - 60, overflowX: 'hidden'}} renderThumbVertical={({ style, ...props }) =>
          <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
          }>
                <div className="container-fluid">
                  {/* <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <Link to={`/brand`} >
                      <div className="backtobrand">
                        <span className="back-button">Back</span>
                      </div>
                    </Link>
                      
                      
                    </div>
                  </div> */}
        <div className="row content">
      <div  className={token ? `col-lg-8 col-md-8 col-sm-8 col-xs-12 left-side` : 'col-lg-12 col-md-12 col-sm-12 col-xs-12 left-side'}>
        <div className="title-block">Live Challenges</div>
        <div className="row content-block">  
        {list && list.map(this.renderItemLiveChallenge, this, '')}
        {list.length === 0 && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <span>No Challenges are available</span>
          </div>}
        </div>              
      </div>
      {token && <Rewarded />}
    </div>          
  </div> 
</Scrollbars>       
          }
      </div>
      </div>
    );
  }
}