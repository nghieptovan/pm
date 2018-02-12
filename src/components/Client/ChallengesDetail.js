import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import Modal from 'react-modal';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import ListChallenges from './ChallengesList';
import CreateChallenge from '../CreateChallenge/CreateChallenge';
import './ChallengesDetail.scss';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as ChallengeActions from '../../redux/actions/challenge';
import coverImg from '../../assets/img/no-img.png';
import avatar from '../../assets/img/no-img.png';
import { PieChart,Pie, LabelList , ComposedChart, Line, Cell, ReferenceLine, BarChart, AreaChart, Area, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dataMap from '../../utils/config';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import {s3URL} from '../../config';
import { Scrollbars } from 'react-custom-scrollbars';
import MapDashBoard from './MapDashBoard';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import ReactLoading from 'react-loading';
@connect(
    state => ({
        challenge: state.challenge
    }),
    ({
        getChallengeById: (token, id) => ChallengeActions.getChallengeById(token, id),
        getDashboard: (id, token) => ChallengeActions.getDashboard(id, token),
        changeStatusChallenge: (id, status, token, access_time) => ChallengeActions.changeStatusChallenge(id, status, token, access_time)
    }
    )
)
export default class ChallengesDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeType: 'SAVED',
            currentChallenge: {},
            status: '',
            rerender:false,
            isOpenCompleted: false,
            isOpenArchived: false,
            copied: false          
        };
    }
    static propTypes = {
        challenge: PropTypes.object,
        router: React.PropTypes.object,
        getChallengeById: PropTypes.func,
        changeStatusChallenge: PropTypes.func,
        getDashboard: PropTypes.func
    };

    componentWillMount() {
        const { token, clientId } = getCurrentUser();
        if (!clientId) {
            browserHistory.push('/client');
        } else {
            this.props.getChallengeById(token, this.props.params.challengeId)
            // LIVE SAVED COMPLETED ARCHIVED
        }

    }
    componentDidMount() {
        const { token } = getCurrentUser();
        this.props.getDashboard(this.props.params.challengeId, token);
        this.setState({loadingUpload: true});
    }
    componentWillReceiveProps(nextProps) {        
        const { challenge } = this.props;
        const { challenge: nextChallenge } = nextProps;
        challenge.getChallengeLoad !== nextChallenge.getChallengeLoad && nextChallenge.challengeById ? this.setState({ currentChallenge: nextChallenge.challengeById }) : '';
        challenge.edited !== nextChallenge.edited && nextChallenge.editedChallenge ? this.showUpdatedSuccessfullyModal() : '';
        challenge.getDashboard !== nextChallenge.getDashboard && nextChallenge.dashboard ? this.setState({ dashboard: nextChallenge.dashboard }) : '';
        challenge.loadingIcon != nextChallenge.loadingIcon && nextChallenge.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';
        challenge.loadingIcon != nextChallenge.loadingIcon && nextChallenge.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';
    }
    createChallenge = () => {
        this.setState({ openCreateChallenge: true });
    }
    showUpdatedSuccessfullyModal = () => {
        this.state.status === 'COMPLETED' ?  this.setState({ isOpenCompleted: true }) :  this.setState({ isOpenArchived: true });
        this.startTimer();
    }

    startTimer = () => {
        this.setState({ timeCountDown: 1500 });
        let intervalId = setInterval(() => {
            if (this.state.timeCountDown < 0) {
                this.setState({ isOpenCompleted: false, isOpenArchived: false });
                clearInterval(intervalId);
                if (this.state.status === 'COMPLETED') {
                    sessionStorage.setItem('isCompleted', true);
                } else {
                    sessionStorage.setItem('isArchived', true);
                }
                getClientShortName().then(result => browserHistory.push(`/client/${result}/challenges`));
            } else {
                let _timeCountDown = this.state.timeCountDown - 500;
                this.setState({ timeCountDown: _timeCountDown });
            }
        }, 500);
    };
    closeModal = () => {
        this.setState({ openCreateChallenge: false, isOpenCompleted: false });
    }
    closeModalCopy = () => {
        this.setState({copied: false});
    }

    handleChangeStatus = (status) => {
        this.props.changeStatusChallenge(this.props.params.challengeId, status, getCurrentUser().token, Date.now());
        this.setState({ status: status });
    }  

    renderTopCreator = (data, index) => {
        return (
        <tr key={index}>
            <td className="overflow-text text-left">{data.firstName}</td>
            <td className="overflow-text text-left">{data.lastName}</td>
            <td className="text-left">{data.country}</td>
            <td>{data.totalUploads}</td>
            <td>{data.rewards}</td>
        </tr>   )
    }
    copyToClipboard = () => {
        this.setState({copied: true});
        setTimeout(() => {
            this.closeModalCopy();
          }, 1000);
    }
    render() {
        const { challenge, params: { shortName, challengeId } } = this.props;
        const dashboard = this.state.dashboard;
        const name = this.state.currentChallenge.name;
        const colors = ['#f29c11', '#2a3245'];
        const colors2 = ['#1bbc9b', '#d25400'];
        const data = this.state.dashboard && dashboard.totalBudget > 0 ? [{'text':dashboard.rewardsSpend == 0? '':'$'+dashboard.rewardsSpend , 'value':dashboard.rewardsSpend},{'notext':dashboard.totalBudget - dashboard.rewardsSpend, 'value':dashboard.totalBudget - dashboard.rewardsSpend}]:[{'notext':0, 'value':0},{'notext':0, 'value':1}];
        const data2 = this.state.dashboard ? [{'text':dashboard.images == 0 ? '' : dashboard.images, 'value':dashboard.images == 0 ? '' : dashboard.images },{'text':dashboard.videos == 0?'':dashboard.videos, 'value':dashboard.videos == 0?'':dashboard.videos }]:[{'text':0, 'value':0},{'text':0, 'value': 0}];         
        const noData = (this.state.dashboard && this.state.dashboard.images == 0 && this.state.dashboard.videos ==0);
        const dummy = [{'text':0, 'value':1}];
        let userImg;
        const itemStatus = this.state.currentChallenge.status;
        let disableArchive = itemStatus === 'COMPLETED' ? false : true;
        let disableComplete = itemStatus === 'LIVE' ? false : true;       
        this.state.currentChallenge.imageUri ? userImg = s3URL + this.state.currentChallenge.imageUri : userImg = avatar;
        return (
            <div id="container">
                <div id="wrapper">
                    <SidebarClient shortName={shortName} selected="challenges" />
                    <NavHeaderClient title='' isShowedCreateChallenge={false} createChallenge={this.createChallenge} />
                    <div id="page-wrapper">
                    {this.state.loadingUpload && 
                        <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                    }                    
                    <Scrollbars autoHide style={{ height: window.innerHeight - 60 }} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff' }}/>
                  }>
                        <div className="container-fluid" style={{paddingLeft: '20px', paddingRight: '20px'}}>
                            <div className="challenge-detail">
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 cover"><img src={userImg} style={{ maxHeight: '200px' }} /></div>

                                </div>
                                <div className="row">
                                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 title">

                                        <div className="name">{this.state.currentChallenge.name}</div>
                                        <div className="description">
                                            <span className="status">{this.state.currentChallenge.status}</span>
                                            <span className="time-line">({moment(this.state.currentChallenge.startDate).format('ll')} - {moment(this.state.currentChallenge.endDate).format('ll')})</span>
                                        </div>
                                        <div className="action-group">
                                             <button
                                             disabled={disableArchive} 
                                             className={!disableArchive ? "action archived" : "action archived disabled"} 
                                             onClick={() => this.handleChangeStatus('ARCHIVED')}>
                                             ARCHIVE
                                             </button> 
                                             
                                             <button 
                                             disabled={disableComplete} 
                                             className={!disableComplete ? "action completed" : "action completed disabled"} 
                                             onClick={() => this.handleChangeStatus('COMPLETED')}>
                                             COMPLETE
                                             </button>                                           
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-left">
                                        <div className="content-chart">
                                            <div className="header-chart">
                                                <span>Uploads Reach</span>
                                            </div>

                                            <div className="body-chart" style={{ width: '95%' }}>
                                                {this.state.dashboard ? <ResponsiveContainer>
                                                    <AreaChart data={dashboard.uploadsReach} fill='#32BEF3'>
                                                        <XAxis dataKey="date" fill="#32BEF3" strokeWidth={2} />
                                                        <YAxis stroke="#ffffff" fill='32BEF3' strokeWidth={2} />
                                                        <Tooltip />
                                                        <Area dataKey='uploads' fill='#32BEF3' dot={{ r: 1, fill: '#fff', strokeWidth: 6, stroke: '#fff' }} />
                                                    </AreaChart>
                                                </ResponsiveContainer> : <span className="no-data">No data</span> }
                                                
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-right">
                                        <div className="content-chart">
                                            <div className="header-chart">
                                                <span></span>
                                            </div>
                                            <div className="body-chart">
                                                <div className="chart chart-left">
                                                    <span>Total Budgets ${this.state.dashboard ? dashboard.totalBudget : 0}</span>
                                                    <div className="chartarea">                                                      
                                                        <ResponsiveContainer>
                                                        <PieChart width={200} height={200}>                                                        
                                                            <Pie stroke="none" isAnimationActive={false} data={data} dataKey='value' innerRadius={57} outerRadius={70}>
                                                                {
                                                                data.map((entry, index) => (
                                                                    <Cell fill={colors[index]} key={index} />
                                                                ))
                                                                }
                                                                <LabelList dataKey='text' strokeWidth="0" stroke="#fff" position="outside" />
                                                            </Pie>                                                               
                                                        </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="textarea">
                                                        <i className="fa fa-square reward-spend" aria-hidden="true"></i> Rewards Spend
                                                    </div>
                                                </div>
                                                <div className="chart chart-right">
                                                    <span>Total Uploads {this.state.dashboard ? dashboard.totalUploads : 0}</span>
                                                    <div className="chartarea">      
                                                    {noData ?
                                                    <ResponsiveContainer>                                                  
                                                    <PieChart width={200} height={200}>                                                        
                                                        <Pie stroke="none" isAnimationActive={false} dataKey='value' data={dummy}  innerRadius={57} outerRadius={70}>
                                                            {
                                                                dummy.map((entry, index) => (
                                                                <Cell fill={colors[1]} key={index} />
                                                            ))
                                                            }
                                                        </Pie>                                                           
                                                    </PieChart>     
                                                    </ResponsiveContainer>  :
                                                    <ResponsiveContainer>                                                  
                                                    <PieChart width={200} height={200}>                                                        
                                                        <Pie stroke="none" isAnimationActive={false} dataKey='value' data={data2}  innerRadius={57} outerRadius={70}>
                                                            {
                                                            data2.map((entry, index) => (
                                                                <Cell fill={colors2[index]} key={index} />
                                                            ))
                                                            }
                                                            <LabelList dataKey='text' strokeWidth="0" stroke="#fff" position="outside" />
                                                        </Pie>                                                            
                                                    </PieChart>     
                                                    </ResponsiveContainer>  }                                                 
                                                    </div>
                                                    <div className="textarea">
                                                        <i className="fa fa-square image-upload" aria-hidden="true"></i>Images
                                                        <i className="fa fa-square video-upload" aria-hidden="true"></i>Videos
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-left">
                                        <div className="chart-block">     
                                            <div className="content-chart">
                                                <div className="header-chart">
                                                    <span className="pull-left title">Uploads by Location</span>
                                                    <span className="pull-right"></span>
                                                </div>
                                                <div className="body-chart">
                                                    <MapDashBoard dataSet={dataMap.dataSet} height="260" />
                                                </div>                                            
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-right">
                                        <div className="content-chart">
                                            <div className="header-chart">
                                                <span>Top Creators</span>
                                            </div>
                                            <div className="body-chart">
                                                <div className="table-responsive scroll-peihgn">
                                                {this.state.dashboard? 
                                                <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-left">First Name</th>
                                                                <th className="text-left">Last Name</th>
                                                                <th className="text-left">Country</th>
                                                                <th>Total Uploads</th>
                                                                <th>Rewards</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                           {this.state.dashboard.topCreators.map(this.renderTopCreator, this, '')}                                                         
                                                        </tbody>
                                                    </table> 
                                                    :
                                                    <table className='table'>
                                                        <thead>
                                                            <tr>
                                                                <th>No data</th>
                                                            </tr>
                                                        </thead>
                                                    </table> }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-left"
                                        style={{height: '185px'}}>                                                                             
                                            <div className="content-embededcode">
                                                <div className="header-embededcode">
                                                    <span className="pull-left title">Widget Embed code</span>
                                                </div>
                                                <CopyToClipboard text={this.state.currentChallenge.embeddedCode }
                                                    onCopy={() => this.copyToClipboard()}>
                                                    <button className="btn btn-large btn-embedded">Copy Embed Code</button>
                                                    </CopyToClipboard>
                                                <div className="body-embededcode">
                                                    <div className="detail">
                                                        <span>{this.state.currentChallenge.embeddedCode}</span>                                                        
                                                    </div>                                                                                                        
                                                </div>                                            
                                            </div>                        
                                    </div>
                                    <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 content-block content-block-right"
                                        style={{height: '185px'}}>                                                                             
                                            <div className="content-embededcode">
                                                <div className="header-embededcode">
                                                    <span className="pull-left title">Webpage Link</span>
                                                </div>
                                                <CopyToClipboard text={this.state.currentChallenge.embeddedCode ? `${window.location.protocol}//${window.location.hostname}${this.state.currentChallenge.entribeUri.replace(/\s/g,'')}`: ''}
                                                    onCopy={() => this.copyToClipboard()}>
                                                    <button className="btn btn-large btn-embedded">Copy Webpage Link</button>
                                                </CopyToClipboard>
                                                <div className="body-embededcode">
                                                    <div className="detail">
                                                        <span>{this.state.currentChallenge.embeddedCode ? `${window.location.protocol}//${window.location.hostname}${this.state.currentChallenge.entribeUri.replace(/\s/g,'')}`: ''}</span>                                                        
                                                    </div>                                                                                                        
                                                </div>                                            
                                            </div>                        
                                    </div>
                                </div>
                                </div>
                        </div>
                    </Scrollbars>
                    </div>
                </div>
                <CreateChallenge shortName={shortName} openCreateChallenge={this.state.openCreateChallenge} closeModal={this.closeModal} />
                <Modal
                    isOpen={this.state.isOpenCompleted}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    className={{
                        base: 'customConfirm_Modal',
                        afterOpen: 'customConfirm_after-open',
                        beforeClose: 'customConfirm_before-close'
                    }}
                    overlayClassName={{
                        base: 'customConfirm_Overlay',
                        afterOpen: 'customConfirmOverlay_after-open',
                        beforeClose: 'customConfirmOverlay_before-close'
                    }}
                    contentLabel="Added Successfully Modal"
                >
                    <form className='form-confirm'>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12 icon">
                                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12">
                                <span className='title-confirm-popup'>{"Challenge has been completed!"}</span>
                            </div>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.isOpenArchived}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    className={{
                        base: 'customConfirm_Modal',
                        afterOpen: 'customConfirm_after-open',
                        beforeClose: 'customConfirm_before-close'
                    }}
                    overlayClassName={{
                        base: 'customConfirm_Overlay',
                        afterOpen: 'customConfirmOverlay_after-open',
                        beforeClose: 'customConfirmOverlay_before-close'
                    }}
                    contentLabel="Added Successfully Modal"
                >
                    <form className='form-confirm'>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12 icon">
                                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12">
                                <span className='title-confirm-popup'>{"Challenge has been archived!"}</span>
                            </div>
                        </div>
                    </form>
                </Modal>
                <Modal
                    isOpen={this.state.copied}
                    onRequestClose={this.closeModalCopy}
                    className={{
                        base: 'customConfirm_Modal',
                        afterOpen: 'customConfirm_after-open',
                        beforeClose: 'customConfirm_before-close'
                    }}
                    overlayClassName={{
                        base: 'customConfirm_Overlay',
                        afterOpen: 'customConfirmOverlay_after-open',
                        beforeClose: 'customConfirmOverlay_before-close'
                    }}
                    contentLabel="Added Successfully Modal"
                >
                    <form className='form-confirm'>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12 icon">
                                <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12 col-lg-12 col-sm-12">
                                <span className='title-confirm-popup'>Copied</span>
                            </div>
                        </div>
                    </form>
                </Modal>
            </div>
        );
    }
}
