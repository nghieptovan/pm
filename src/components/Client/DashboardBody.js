import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import './DashboardBody.scss';
import {LabelList, PieChart, Pie, ComposedChart, Dot, Line, Cell, ReferenceLine, BarChart, AreaChart, Area, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import imgOver from '../../assets/img/overall.png';
import imgView from '../../assets/img/over1.png';
import imgUpload from '../../assets/img/over2.png';
import imgCreator from '../../assets/img/over3.png';
import imgReward from '../../assets/img/over4.png';
import dataMap from '../../utils/config';
import { Scrollbars } from 'react-custom-scrollbars';
import * as DashboardActions from '../../redux/actions/dashboard';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import { Link } from 'react-router';
import MapDashBoard from './MapDashBoard';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    dashboard: state.dashboard
  }),
  ({ getDashboard: (token, id) => DashboardActions.getDashboard(token, id) })
)
export default class DashboardBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUpload: dataMap.data,
      defaultUpload: 1,
      clientInfo: null,    
    };
  }
  static propTypes = {
    dashboard: PropTypes.object,
    getDashboard: PropTypes.func,
  };
  componentWillMount() {
    getClientShortName().then(result => this.setState({ shortName: result }));
    const { token, clientId } = getCurrentUser();
    if (!clientId) {
      browserHistory.push('/client');
    } else {
      this.props.getDashboard(token, clientId);
      this.setState({loadingUpload: true})
    }
  }
  componentWillReceiveProps(nextProps){
    this.props.dashboard.clientInfo != nextProps.dashboard.clientInfo && nextProps.dashboard.clientInfo ?
    this.setState({clientInfo: nextProps.dashboard.clientInfo}) : this.setState({error: nextProps.error});
    this.props.dashboard.clientInfo != nextProps.dashboard.clientInfo ? this.setState({loadingUpload: false})
   : '';
  }
  changeUpload = (type) => {
    const clientInfo = this.state.clientInfo;
    this.setState({ defaultUpload: type })
    type === 1 ?
    this.setState({ currentUpload: nextClientInfo.monthUploads }) :
    this.setState({ currentUpload: nextClientInfo.weekUploads })
  }
  renderTopChallengeBody = (data) => {
    return (
      <div className="rowBody" key={data.challengeId}>
        <div className="col-lg-5 col-md-5 col-sm-5 col-xs-5 pull-left">
          <Link to={`/client/${this.state.shortName}/challenges/${data.challengeId}`} className="btn dark-blue">
            {data.challengeName}
          </Link></div>
        <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 text-center">{data.totalSubmissions}</div>
        <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 text-center">{data.pendingReviews}</div>
      </div>)
  }
  createCustomDot = (dotProps) => {
    const { payload } = dotProps
    const { rate } = this.props
    let markerColor
    if(payload.from > rate) {
      markerColor = 'rgb(253,0,0)'
    }
    if(payload.to < rate) {
      markerColor = 'rgb(156,214,25)'
    }
    if(rate >= payload.from && rate <= payload.to) {
      markerColor = 'rgb(253,214,72)'
    }
    dotProps.fill = markerColor
    dotProps.fillOpacity = 1
    dotProps.r = 1
    dotProps.stroke = '#fff'
    dotProps.strokeWidth= 6
    if(!payload.notShow){
      return <Dot {...dotProps} />
    }
    
  }
  handleNewUploads = () => {
    sessionStorage.setItem('contentStatus','Pending');
    browserHistory.push(`/client/${this.state.shortName}/uploads`);
  }
  render() {
    if (this.state.clientInfo && !this.state.loadingUpload) {      
      const clientInfo = this.state.clientInfo;
      const CustomizedAxisTick = React.createClass({
        render () {
          const {x, y, stroke, payload, width} = this.props;
          // const positionX = payload.value.length > 3 ? x + width/12: x;
          const positionX = x;
           return (
            <g transform={`translate(${positionX},${y})`}>
              <text x={0} y={0} dy={16} textAnchor="middle" fontSize="9px" fill="#fff">{`${payload.value}`}</text>
            </g>
          );
        }
      });
      const CustomizedYAxisTick = React.createClass({
        render () {
          const {x, y, stroke, payload} = this.props;
           return (
            <g transform={`translate(${x},${y})`}>
              <text x={-10} y={0}  textAnchor="middle" fontSize="9px" fill="#fff">{`${payload.value}`}</text>
            </g>
          );
        }
      });     
      const CustomTooltip  = React.createClass({
        propTypes: {
          type: PropTypes.string,
          payload: PropTypes.array,
          label: PropTypes.string,
        },      
        render() {
          const { active } = this.props;      
          if (active) {
            const { payload, label } = this.props;
            if(label){
              return (
                <div className="custom-tooltip">
                <p className="label">{payload[0].payload.week ? payload[0].payload.week : payload[0].payload.month}</p>
                <p className="desc">Uploads: {`${payload[0].value}`}</p>
              </div>
                
              );
            }            
          }      
          return null;
        }
      });
      const renderCustomizedLabel = (props) => {
        const { x, y, width, height, value } = props;
        const positionY = value == 0 ? y - 5 : y + 15;
        let positionX;
        if(value < 10){
          positionX = x + width / 2 - 3;
        }else if(value < 100){
          positionX = x + width / 2 - 10;
        }else if(value < 1000){
          positionX = x + width / 2 - 13;
        }else if(value < 10000){
          positionX = x + width / 2 - 16;
        }else if(value < 100000){
          positionX = x + width / 2 - 20;
        }else if(value < 1000000){
          positionX = x + width / 2 - 24;
        }
        
        return (
          <g>
            <text x={positionX} y={positionY} fill="#fff">
              {value}
            </text>
          </g>
        );
      };

      const colors =["#00B8D4","#0091EA","#673AB7","#E91E63","#1B5E20","#9E9D24","#F57C00"];
      return (
        <div id="page-wrapper">
          <Scrollbars autoHide style={{ height: window.innerHeight - 60 + 'px' }}>
          <div className="container-fluid client-dashboard">
            <div className="row chart-row">
              <div className="col-lg-2 col-md-4 col-sm-6 col-xs-12 widget-block" onClick={this.handleNewUploads}>              
                <div className="widget-box analytics-info">
                  <button className="btn btn-danger btn-circle btn-lg" type="button"><i className="icon-upload-icon" aria-hidden="true"></i></button>
                  <div className="info-widget-box pull-right">
                    <p className="title-widget-box">New Uploads</p>
                    <span className="content-widget-box color-danger">{clientInfo.newUploads || 0 }</span>
                  </div>
                </div>                
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6 col-xs-12 widget-block">
              <Link to={`/client/${this.state.shortName}/uploads`} >
                <div className="widget-box analytics-info">
                  <button className="btn btn-success btn-circle btn-lg" type="button"><i className="icon-check-icon" aria-hidden="true"></i></button>
                  <div className="info-widget-box pull-right">
                    <p className="title-widget-box">Total Uploads</p>
                    <span className="content-widget-box color-success">{clientInfo.revieweds || 0}</span>
                  </div>
                </div>
                </Link>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6 col-xs-12 widget-block">
              <Link to={`/client/${this.state.shortName}/challenges`} >
                <div className="widget-box analytics-info">
                  <button className="btn btn-success btn-circle btn-lg" type="button"><i className="icon-accnouce" aria-hidden="true"></i></button>
                  <div className="info-widget-box pull-right">
                    <p className="title-widget-box">Live Challenges</p>
                    <span className="content-widget-box color-success">{clientInfo.liveChallengs || 0}</span>
                  </div>
                </div>
                </Link>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6 col-xs-12 widget-block">
              <Link to={`/client/${this.state.shortName}/creators`} >
                <div className="widget-box analytics-info">
                  <button className="btn btn-info btn-circle btn-lg" type="button"><i className="icon-group-icon" aria-hidden="true"></i></button>
                  <div className="info-widget-box pull-right">
                    <p className="title-widget-box">Creators</p>
                    <span className="content-widget-box color-info">{clientInfo.creators || 0}</span>
                  </div>
                </div>
                </Link>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6 col-xs-12 widget-block">
              <Link to={`/client/${this.state.shortName}/rewards`} >
                <div className="widget-box analytics-info">
                  <button className="btn btn-warning btn-circle btn-lg" type="button"><i className="icon-cup-icon" aria-hidden="true"></i></button>
                  <div className="info-widget-box pull-right">
                    <p className="title-widget-box">Rewards</p>
                    <span className="content-widget-box color-warning">{clientInfo.rewards || 0}</span>
                  </div>
                </div>
                </Link>
              </div>              
            </div>
            <div className="row chart-row">
              <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 margin5px">
                <div className="chart-block">
                  <div className="weekly-monthly">
                    <div className="title-chart">
                      <span className="pull-left title">Weekly/Monthly Uploads</span>
                      <div className="pull-right">
                        <span onClick={() => this.changeUpload(1)} className={this.state.defaultUpload === 1 ? "right-title active" : "right-title"}>
                          Monthly
                        </span>
                        <span onClick={() => this.changeUpload(2)} className={this.state.defaultUpload === 2 ? "right-title active" : "right-title"}>
                          Weekly
                        </span>
                      </div>
                    </div>                    
                    {(clientInfo.monthUploads.length > 0 || clientInfo.weekUploads.length > 0) ?
                    <ResponsiveContainer className="content-chart">
                      <AreaChart margin={{top: 10, right: 30, left: 0, bottom: 0}} fill='#32BEF3' data={this.state.defaultUpload === 1 ? clientInfo.monthUploads : clientInfo.weekUploads}>
                        <XAxis dataKey={this.state.defaultUpload !== 1 ? "title" : "month" } fill="#32BEF3" stroke="#32BEF3" strokeWidth={1} tick={<CustomizedAxisTick/>} />
                        <YAxis stroke="#ffffff" fill='32BEF3' strokeWidth={1} tick={<CustomizedYAxisTick/>}  />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Area dataKey='uploads' fill='#32BEF3' dot={this.createCustomDot} />
                      </AreaChart>                 
                    </ResponsiveContainer>
                    : <span style={{marginLeft: '15px'}}>No Data</span>
                    }
                   
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 margin5px">
                <div className="chart-block">
                  <div className="weekly-monthly">
                    <div className="title-chart">
                      <span className="pull-left title">Uploads by Location</span>
                      <div className="pull-right">
                        <div className="color-range">
                          <div className="color-row">
                            <div className="color-area color1"></div>
                            <div className="color-area color2"></div>
                            <div className="color-area color3"></div>
                            <div className="color-area color4"></div>
                            <div className="color-area color5"></div>
                          </div>
                          <div className="text-row">
                            <span className="pull-left">High</span>
                            <span className="pull-right">Low</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="body-chart"><MapDashBoard dataSet={clientInfo.location} height="260" /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row chart-row">
              <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 margin5px">
                <div className="chart-block">
                  <div className="weekly-monthly">                  
                    <div className="title-chart">
                      <span className="pull-left title">Lastest Challenges</span>
                    </div>
                    {clientInfo.latestChallenges.length > 0 ?
                      <ResponsiveContainer className="content-chart">
                        <BarChart data={clientInfo.latestChallenges} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="challengeName" stroke="#ffffff" strokeWidth={2} />
                          <YAxis stroke="#ffffff" strokeWidth={1} fontFamily="sans-serif" tick={<CustomizedYAxisTick/>} label={{ value: 'Uploads', angle: -90,stroke: '#fff', position: 'insideLeft', textAnchor: 'middle'}}/>
                          <Bar dataKey='uploads' barSize={40} fontFamily="sans-serif">
                            {
                              clientInfo.latestChallenges.map((entry, index) => (
                                <Cell cursor="pointer" fill={colors[index]} key={index} />
                              ))
                            }
                            <LabelList content={renderCustomizedLabel} position='insideTop' fontSize='10px' dataKey='uploads' strokeWidth={0} stroke="#fff" fontFamily="sans-serif"/>
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer> : <span style={{marginLeft: '15px'}}>No Data</span>
                    }
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-12 col-xs-6 margin5px">

                <div className="chart-block">
                  <div className="weekly-monthly">
                    <div className="title-chart">
                      <span className="pull-left title">Overall Performance</span>
                    </div>
                    <div className="content-chart">
                      <div className="overall">
                        <div className="img-side">
                          <img src={imgOver} />
                        </div>
                        <div className="value-side">
                          <div className="view-row">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.reviews || 0}</span>
                          </div>
                          <div className="upload-row">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.uploads || 0}</span>
                          </div>
                          <div className="creator-row">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.creators || 0}</span>
                          </div>
                          <div className="reward-row">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.rewards || 0}</span>
                          </div>                        
                        </div>
                        {/* <div className="row span-view">
                          <div className="left-side">
                            <img src={imgView} />
                            <span>Overview</span>                            
                          </div>
                          <div className="right-side">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.reviews || 0}</span>
                          </div>
                        </div>

                        <div className="row span-upload">
                          <div className="left-side">
                            <img src={imgUpload} />
                            <span>Uploads</span>
                          </div>
                          <div className="right-side">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.uploads || 0}</span>
                          </div>
                        </div>
                        <div className="row span-creator">
                          <div className="left-side">
                              <img src={imgCreator} />
                              <span>Creators</span>
                            </div>
                            <div className="right-side">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.creators || 0}</span>
                          </div>
                        </div>
                        <div className="row span-reward">
                          <div className="left-side">
                              <img src={imgReward} />
                              <span>Rewards</span>
                            </div>
                            <div className="right-side">
                            <span>{clientInfo.overalPerformance && clientInfo.overalPerformance.rewards || 0}</span>
                          </div>
                        </div> */}

                      </div>

                    </div>

                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-3 col-sm-12 col-xs-6 margin5px">

                <div className="chart-block">
                  <div className="weekly-monthly">
                    <div className="title-chart">
                      <span className="pull-left title">Top Challenges</span>
                    </div>
                    <div className="content-chart top-challenger">
                      <div className="content-challenger">
                        <div className="row-fluid">
                          <div className="headerTable rowBody">
                            <div className="col-lg-5 col-md-5 col-sm-5 col-xs-5 pull-left active-challenge">Active Challenges</div>
                            <div className="col-lg-4 col-md-4 col-sm-4 col-xs-4 text-center total-submiss" style={{overflow: 'hidden'}}><span>Total Submissions</span></div>
                            <div className="col-lg-3 col-md-3 col-sm-3 col-xs-3 text-center">Pending Review</div>
                          </div>
                        </div>
                        <Scrollbars autoHide autoHeight renderThumbVertical={({ style, ...props }) =>
                          <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden', right: '-2px' }}/>
                          }>
                        <div className="row-fluid bodyTable ">                        
                          {clientInfo.topchallenges.length > 0 ? clientInfo.topchallenges.map(this.renderTopChallengeBody, this, '') : 
                          <div className="rowBody">
                            <div className="col-lg-5 col-md-5 col-sm-5 col-xs-5 pull-left">
                              <span>No Data</span>
                            </div>
                          </div>
                          }
                        </div>
                        </Scrollbars>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          </Scrollbars>
        </div>

      )
    } else if(this.state.loadingUpload){
    return (
      <div id="page-wrapper">
          <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
      </div>
    )}
    else return null;
  }
}