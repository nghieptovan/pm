import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName, getClientId } from '../../utils/common';
import moment from 'moment';
import NavHeader from '../NavHeader/NavHeaderCreator';
import DashboardBody from './DashboardBody';
import imgItem from '../../assets/img/no-img.png';
import _ from 'lodash';
import LazyLoad from 'react-lazy-load';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './DashboardBody.scss';
import {SampleNextArrow, SamplePrevArrow} from '../SlideSlick';
import Rewarded from './Rewarded';
import ReactStars from 'react-stars';
import {s3URL} from '../../config';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactLoading from 'react-loading';
export default class MyUploadsBody extends Component {
    constructor(props){
        super(props);
      }
      
      renderItemMyUpload = (content, data) => {
        const settings = {
            dots: false,
            slidesToShow: 6,
            slidesToScroll: 1,
            centerMode: false,
            autoplay: false,
            swipe: true,
            initialSlide: 0,
            className: content.contents.length < 6 ? 'lessthansix' : '',
            nextArrow: content.contents.length < 6 ? '': <SampleNextArrow />,
            prevArrow: content.contents.length < 6 ? '': <SamplePrevArrow />,
            // nextArrow: <SampleNextArrow />,
            // prevArrow: <SamplePrevArrow />,
            responsive: [ 
                { breakpoint: 480, settings: { 
                    slidesToShow: 2,
                    className: content.contents.length < 2 ? 'lessthansix' : '',
                    nextArrow: content.contents.length < 2 ? '': <SampleNextArrow />,
                    prevArrow: content.contents.length < 2 ? '': <SamplePrevArrow />
                } },
                { breakpoint: 768, settings: { 
                    slidesToShow: 3,
                    className: content.contents.length < 3 ? 'lessthansix' : '',
                    nextArrow: content.contents.length < 3 ? '': <SampleNextArrow />,
                    prevArrow: content.contents.length < 3 ? '': <SamplePrevArrow />
                } }, 
                { breakpoint: 1024, settings: { 
                    slidesToShow: 3,
                    className: content.contents.length < 3 ? 'lessthansix' : '',
                    nextArrow: content.contents.length < 3 ? '': <SampleNextArrow />,
                    prevArrow: content.contents.length < 3 ? '': <SamplePrevArrow />
                } },
                { breakpoint: 1170, settings: { 
                    slidesToShow: 4,
                    className: content.contents.length < 4 ? 'lessthansix' : '',
                    nextArrow: content.contents.length < 4 ? '': <SampleNextArrow />,
                    prevArrow: content.contents.length < 4 ? '': <SamplePrevArrow />
                 } },
                { breakpoint: 1400, settings: { 
                    slidesToShow: 5,
                    className: content.contents.length < 5 ? 'lessthansix' : '',
                    nextArrow: content.contents.length < 5 ? '': <SampleNextArrow />,
                    prevArrow: content.contents.length < 5 ? '': <SamplePrevArrow />
                 } }
            ]
        };
        return (
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 item-myupload" key={content.challengeId+content.challengeName+data}>
                    <div className="title-content">
                        <span>{content.challengeName}</span>
                    </div>
                    <div className="body-content">
                    <Slider {...settings}>
                        {content.contents && content.contents.map(this.renderItemSlider, this, '')}
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
  render() {
    const { listMyUpload } = this.props;    
    return (

        <div id="wrapper">
        <div className="creator-dashboard scroll-nghiep" style={{ height: window.innerHeight - 60 + 'px'}}>
          <div className="container-fluid">
          {this.props.loadingUpload &&
            <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
          }
            <Scrollbars autoHide style={{ height: window.innerHeight - 60}} renderThumbVertical={({ style, ...props }) =>
                    <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                    }>
                <div className="row content">
                <div className="col-lg-8 col-md-8 col-sm-8 col-xs-12 left-side">
                    <div className="title-block">My Uploads</div>
                    <div className="row content-block">               
                    {listMyUpload && listMyUpload.map(this.renderItemMyUpload, this, '')}
                    {!listMyUpload && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <span>No Challenges are available</span>
                    </div>}
                    </div>                
                </div>             
                <Rewarded />
                </div>
                </Scrollbars>         
          </div>        
        </div>
        </div>

        
    )
  }
}
