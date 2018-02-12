import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import './Uploads.scss';
import dataConfig from '../../utils/config';
import ReactStars from 'react-stars';
import data from '../../utils/config';
export default class FilterUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
          rewards: data.dataRewardLevelFilter        
        };
      }
    renderFilterStar = (data,index) => {       
        return (
          <div className="star-list" key={`star${index}`}>
              <Checkbox value={data}/>            
                <div className="star-rating">                    
                    <ReactStars
                        count={index+1}
                        value={index+1}
                        half={false}
                        size={19}
                        color2={'#ffd700'}
                        edit={false}
                    /> 
                </div>
          </div>
        )
      }
      renderFilterFlag = (data,index) => {
        let side = index % 2 ==0 ? 'left' : 'right';
        return(      
          <div className={`flag-list ${side}`} key={`flagKey${index}`}>
          <Checkbox value={data}/>
          <label>{data}</label>
          </div>      
        )
      } 
      renderFilterReward = (data, index) => { 
        let side = index % 2 ==0 ? 'left' : 'right'; 
        return(      
          <div className={`flag-list ${side}`} key={`rewardKey${index}`}>          
          <Checkbox value={data.value}/>
          <label>{data.value}</label>
          </div>      
        )
      }      
    render() {
        const stars =[1,2,3,4,5];
        const flags =['LEGAL REVIEW', 'POOR QUALITY', 'OFFENSIVE', 'NEEDS EDITING', 'SPAM', 'NEED MORE INFO', 'OTHER', 'NO FLAG'];
        const rewards = this.state.rewards;  
        const {showPaid} = this.props;
        return (
            <div className="right-bar-list" style={{overflowX: 'hidden'}}>
                <div className="sort">
                    <div className="title">
                        <span>Sort by: </span>
                    </div>
                    <div className="sort-type">
                    {!showPaid && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><span style={{ marginRight: '5px'}} onClick={this.props.sortAlpha}>Alphabetical Order</span> | <span style={{ marginLeft: '5px'}} onClick={this.props.sortDate}>Date</span></div>}
                    {showPaid && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><span onClick={this.props.sortAlpha}>Alphabetical Order</span></div>}
                        {/* {!showPaid && <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12" style={{ borderLeft: '1px solid'}}><span onClick={this.props.sortDate}>Date</span></div>} */}
                        {showPaid && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12"><span style={{ marginRight: '5px'}} onClick={this.props.sortPaid}>Paid</span> | <span style={{ marginLeft: '5px'}} onClick={this.props.sortUnPaid}>Unpaid</span></div>}
                        {/* {showPaid && <div className="col-lg-6 col-md-6 col-sm-6 col-xs-12" style={{ borderLeft: '1px solid'}}><span onClick={this.props.sortUnPaid}>Unpaid</span></div>} */}
                    </div>                 
                </div>
                {this.props.activeType !== "Pending" && <div>
                    <div className="fliter">Filter by:</div>
                    <div className="rating">
                        <label><i className="fa icon-star-icon" style={{marginRight: '3px'}}></i>Ratings</label>
                        <CheckboxGroup
                            name="rating"
                            onChange={this.props.ratingChanged}
                            value={this.props.ratingValue}>                            
                            {stars.map(this.renderFilterStar, this, '')}
                        </CheckboxGroup>
                    </div>
                    <div className="flags">
                        <label className="flags-title"><i className="fa icon-flag-icon" style={{marginRight: '3px'}}></i>Flags</label>
                        <div className="flag-list">
                            <CheckboxGroup
                                name="flags"
                                onChange={this.props.flagChanged}
                                value={this.props.flagValue}>
                                {flags.map(this.renderFilterFlag, this, '')}
                            </CheckboxGroup>
                        </div>
                    </div>
                    <div className="flags">
                        <label className="flags-title"><i className="fa icon-cup-icon" style={{marginRight: '3px'}}></i>Rewards</label>
                        <div className="flag-list">
                        <CheckboxGroup
                            name="rewards"
                            onChange={this.props.rewardChanged}
                            value={this.props.rewardValue}>
                            {rewards.map(this.renderFilterReward, this, '')}
                        </CheckboxGroup>
                        </div>
                    </div>
                </div>
                }
            </div>
        )
    }
}
