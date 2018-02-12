import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName, getClientId } from '../../utils/common';
import moment from 'moment';
import imgItem from '../../assets/img/no-img.png';
import _ from 'lodash';
import * as ContentActions from '../../redux/actions/content';
import './DashboardBody.scss';
import {s3URL} from '../../config';
@connect(
    state => ({
        content: state.content
    }),
    ({
        getListRewarded: (token) => ContentActions.getListRewarded(token)
    }
    )
)
export default class Rewarded extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openUpload: false,
            idChallengeSet: 0,
            nameChallengeSet: '',
            rewardList: null
        }
    }
    static propTypes = {
        content: PropTypes.object,
        getListRewarded: PropTypes.func,
    };
    componentWillReceiveProps(nextProps) {
        const { content } = this.props;
        const { content: nextContent } = nextProps;
        if (content.loadRewarded !== nextContent.loadRewarded && nextContent.rewardList) { 
            this.setState({ rewardList: nextContent.rewardList });
        }
    }
    componentWillMount() {
        // const { token } = getCurrentUser();
        // !token ? browserHistory.push('/') : '';
    }
    componentDidMount() {
        const { clientId, token } = getCurrentUser();
        this.props.getListRewarded(token);
    }
    renderItem = (data) => {
        let imageUri = data.type === 'video' ? data.thumbnail : data.contentUri;     
        const img = imageUri ? s3URL+imageUri : imgItem;
        const clientImg = data.clientLogo ? s3URL+data.clientLogo : imgItem;             
        return (
            <div className="col-lg-4 col-md-6 col-sm-6 col-xs-6 item" key={data.id}>
                <div className="content-item">
                    <div className="body-item">
                        <div className="reward-icon">
                            <span className="detail"><i className="icon-cup-icon"></i>{data.rewardLevel}</span>
                        </div>
                        <img src={img} />
                        {data.type === 'video' && <div className="video-icon" style={{ position : 'relative', top: '30px' }}>  
                            <i className="icon-play-icon"></i>
                        </div>}
                    </div>
                    <div className="footer-item-right">
                        <div className="logo-client">
                            <img src={clientImg} />
                        </div>
                        <div className="detail-upload">
                            <p className="title-reward">{data.name}</p>
                            <p>{moment(data.uploadDate).format('MM/DD/YYYY')}</p>
                        </div>
                        
                    </div>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className="col-lg-4 col-md-4 col-sm-4 col-xs-12 right-side">
                <div className="title-block">Rewarded</div>
                <div className="row content-block" style={{marginLeft: '0px'}}>
                    {this.state.rewardList &&
                         this.state.rewardList.map(this.renderItem, this)}
                    {!this.state.rewardList || this.state.rewardList.length == 0 ? <div style={{padding: '0px 10px'}}>
                    <span>No Upload Rewarded.</span></div> : ''}
                </div>
            </div>
        )
    }
}
