import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory, Link} from 'react-router';
import {connect} from 'react-redux';
import * as ChallengeActions from '../../redux/actions/challenge';
import './DashboardBody.scss';
import constructionImg from '../../assets/page_construction.jpg';
import imgItem from '../../assets/img/no-img.png';
import _ from 'lodash';
import { getCurrentUser, getClientId } from '../../utils/common';
import moment from 'moment';
import LazyLoad from 'react-lazy-load';
import Rewarded from './Rewarded';
import {s3URL} from '../../config'
import { PieChart,Pie, LabelList , ComposedChart, Line, Cell, ReferenceLine, BarChart, AreaChart, Area, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {SampleNextArrow, SamplePrevArrow} from '../SlideSlick';
import Slider from 'react-slick';
import ReactStars from 'react-stars';
import dateFormat from 'dateformat';
import { Scrollbars } from 'react-custom-scrollbars';
import ModalModule from '../ModalModule';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    challenge: state.challenge  
  })
)
export default class ChallengeDetailCreatorBody extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      openModal: false, 
      typeModal: '',
      classModal: ''
    })
  }
  static propTypes = { 
    challenge: PropTypes.object,   
    openUpload: PropTypes.func,
  };

  renderItemMyUpload = (content) => {
    const contents = this.props.dashboard.highContents;
    const settings = {
        dots: false,
        slidesToShow: 6,
        slidesToScroll: 1,
        centerMode: false,
        autoplay: false,
        swipe: true,
        initialSlide: 0,
        className: contents.length < 6 ? 'lessthansix' : '',
        nextArrow: contents.length < 6 ? '': <SampleNextArrow />,
        prevArrow: contents.length < 6 ? '': <SamplePrevArrow />,
        responsive: [ 
            { breakpoint: 480, settings: { 
                slidesToShow: 2,
                className: contents.length < 2 ? 'lessthansix' : '',
                nextArrow: contents.length < 2 ? '': <SampleNextArrow />,
                prevArrow: contents.length < 2 ? '': <SamplePrevArrow />
            } },
            { breakpoint: 768, settings: { 
                slidesToShow: 3,
                className: contents.length < 3 ? 'lessthansix' : '',
                nextArrow: contents.length < 3 ? '': <SampleNextArrow />,
                prevArrow: contents.length < 3 ? '': <SamplePrevArrow />
            } }, 
            { breakpoint: 1024, settings: { 
                slidesToShow: 3,
                className: contents.length < 3 ? 'lessthansix' : '',
                nextArrow: contents.length < 3 ? '': <SampleNextArrow />,
                prevArrow: contents.length < 3 ? '': <SamplePrevArrow />
            } },
            { breakpoint: 1170, settings: { 
                slidesToShow: 4,
                className: contents.length < 4 ? 'lessthansix' : '',
                nextArrow: contents.length < 4 ? '': <SampleNextArrow />,
                prevArrow: contents.length < 4 ? '': <SamplePrevArrow />
             } },
            { breakpoint: 1400, settings: { 
                slidesToShow: 5,
                className: contents.length < 5 ? 'lessthansix' : '',
                nextArrow: contents.length < 5 ? '': <SampleNextArrow />,
                prevArrow: contents.length < 5 ? '': <SamplePrevArrow />
             } }
        ]
    };
    return (
        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 item-myupload">
                {/* <div className="title-content">
                    <span>{this.props.dashboard.challengeName}</span>
                </div> */}
                <div className="body-content">
                <Slider {...settings}>
                    {contents && contents.map(this.renderItemSlider, this, '')}
                </Slider>               
                </div>
            </div>
    )
  }

  renderItemSlider = (slideItem, data) => {        
    let imageUri;
    imageUri = slideItem.type === 'video' ? slideItem.thumbnail : slideItem.contentUri;     
    const imagePreview = imageUri ? s3URL+imageUri : imgItem;

    return (
        <div key={slideItem.id+slideItem.name} className="img-content">
            
            <div className="img-bg">       
              <img src={imagePreview} />         
            </div>
            <div className="mash-item">
                {slideItem.type === 'video' && <div className="video-icon">
                    <i className="icon-play-icon"></i>
                </div>}
                
                <div className="footer-content">
                    <p className="top-p">
                    {slideItem.name.length > 25 ? `${slideItem.name.substring(0, 22)}...`: slideItem.name }
                    </p>
                    <div className="bot-p">
                        {slideItem.location && 
                            <span className="left-span">
                            {slideItem.location.length > 13 ? `${slideItem.location.substring(0, 10)}...`: slideItem.location }
                             {' - ' + moment(slideItem.uploadDate).format("MMM DD,YYYY")}
                            </span>
                        }
                       
                    <span className="right-span">
                    <ReactStars
                    count={5}
                    value={slideItem.star}
                    half={false}                                  
                    size={8}
                    edit={false}
                    color2={'#ffd700'} 
                    />
                    </span>
                    </div>
                </div>
            </div>
            
    </div> 
    )
  }

  openUpload = (challenge) => {
    this.props.openUpload(challenge);
  }
  goToChallenge = (challenge) => {
    const nameChallenge = challenge.name.toLowerCase().replace(/\s+/g, '');
    const nameClient = sessionStorage.getItem('clientName');
    browserHistory.push(`/${nameClient}/${nameChallenge}`);
  }
  renderItemLiveChallenge = (challenge, data) => {
    let totaluploads, imgUrl;
    challenge.totalUploads ? totaluploads = challenge.totalUploads : totaluploads = 0;    
    challenge.imageUri ? imgUrl = s3URL+challenge.imageUri : imgUrl = imgItem;
    return (
      <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6 item" key={challenge.name+challenge.id}>
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
  closeModal = () => {
    this.setState({openModal: false});
  }
  handleTakeChallenge = () => {
    const { token, firstName } = getCurrentUser();
    const clientId = getClientId();    

    token ? this.setState({typeModal: 'Upload',classModal: 'custom_after-open-upload', openModal: true}): this.setState(prevState => ({openModal: !this.state.openModal, typeModal: 'Login', classModal: 'login-social-form'}));
  }
  render() {     
    const { token } = getCurrentUser();
    const leftmargin = token ? '10px' : '0px';
    const padding10 = !token ? '10px' : '0px';
    const {dashboard}  = this.props;
    let imgUri;
    dashboard && dashboard.imageUri ? imgUri = `${s3URL}${dashboard.imageUri}` : imgUri = imgItem;
    const dummy =[{text:0, value:1}];
    const noData = dashboard && dashboard.images == 0 && dashboard.videos == 0;
    const data = dashboard ? [{text:`${dashboard.videos ? dashboard.videos : 0}`, value:dashboard.videos},{text:`${dashboard.images ? dashboard.images : 0}`, value:dashboard.images}] : [{notext:'Videos', value:0},{notext:'Photos ', value:1}];
    const colors = ['#c45d35', '#f4a742'];
    const colors2 = ['#f29c11', '#606565'];   
    return (      
      <div id="wrapper">       
      <div className="creator-dashboard" style={{ height: window.innerHeight - 60 + 'px'}}>
      {this.props.loadingUpload && 
        <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
      }
      <Scrollbars autoHide style={{ height: window.innerHeight - 60}} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                  }>
        <div className="container-fluid">
          <div className="row content">
          {!this.props.loadingUpload &&
          <div className={token ? 'col-lg-8 col-md-8 col-sm-8 col-xs-12 left-side' : 'col-lg-12 col-md-12 col-sm-12 col-xs-12 left-side'}>
            <div className="title-block">Challenge Detail</div>            
            {!dashboard && <span style={{marginLeft: '10px', color: 'red'}}>The challenge is not live. You can not view detail or upload for this challenge.</span>}
            {dashboard && 
            <div className="row content-block" style={{padding: padding10}}>      
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 container-fluid challenge-detail"  
              style={{height: window.innerHeight - 115 + 'px', marginLeft: leftmargin }}
              >
              
                  <div className="row challenge-detail-header">
                    {dashboard && <img src={imgUri} />}
                  </div>
                  <div className="row challenge-detail-content">
                    {/* <div className="col-lg-3 col-md-4 col-sm-4 col-xs-12 left_side">
                      <div className="chart">
                          <span>Total Uploads {dashboard ? dashboard.totalUploads : 0}</span>
                          <div className="chartarea">
                            {
                              noData ? 
                              <ResponsiveContainer>                                                  
                              <PieChart width={130} height={130}>                                                        
                                  <Pie stroke="none" isAnimationActive={false} dataKey='value' data={dummy}  innerRadius={47} outerRadius={60}>
                                      {
                                          dummy.map((entry, index) => (
                                          <Cell fill={colors2[1]} key={index} />
                                      ))
                                      }
                                  </Pie>                                                           
                              </PieChart>     
                              </ResponsiveContainer> : 
                              <ResponsiveContainer>
                              <PieChart width={130} height={130}>                                                        
                                  <Pie stroke="none" isAnimationActive={false} data={data} dataKey='value' innerRadius={47} outerRadius={60}>
                                      {
                                      data.map((entry, index) => (
                                          <Cell fill={colors[index]} key={index} />
                                      ))
                                      }openLogin
                                      <LabelList dataKey='text' strokeWidth="0" stroke="#000" position="outside" />
                                  </Pie>                                                               
                              </PieChart>
                          </ResponsiveContainer>
                            }openLogin
                                                                                
                          </div>
                        </div>
                    </div> */}
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 center_side">
                      <div className="text-center challengeName">
                      {dashboard &&  <span>{dashboard.name} Challenge</span>}
                      </div>
                      <div className="text-center challengeTime">
                        {<span>{dashboard ? '(' + moment(dashboard.startDate).format('ll') + ' - ' + moment(dashboard.endDate).format('ll') + ')': ''}</span>}
                        
                      </div>
                      <div className="text-center challengeText">
                        <p>
                          {dashboard ? dashboard.description : ''}
                        </p>
                      </div>
                    </div>
                    <div className="button-take-challenge">
                      <button onClick={this.handleTakeChallenge}>Take Challenge</button>
                    </div>
                  </div>
                  {/* <div className="row challenge-detail-footer">
                    <div className="col-lg-12 footer_title">
                      <span>Trending / Top Rated</span>
                    </div>
                    <div className="col-lg-12 footer_challengeList">
                        {dashboard && this.renderItemMyUpload(dashboard.highContents)}                          
                    </div>
                  </div> */}
              
            
            </div>
            </div>             
            }          
                         
          </div>
          }
          {token && <Rewarded />}
        </div>          
      </div>  
      </Scrollbars>
      <ModalModule type={this.state.typeModal} classModal={this.state.classModal} openModal={this.state.openModal} closeModal={this.closeModal} dataModal={dashboard || {}} />
    </div>

      </div>
    );
  }
}