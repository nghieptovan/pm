import React, { Component, PropTypes } from 'react';
import {s3URL} from '../../config';
import LazyLoad from 'react-lazy-load';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import ReactStars from 'react-stars';
import imgItem from '../../assets/img/no-img.png';

export default class UploadItem extends Component {
    static propTypes = {
        openModalPreview: PropTypes.func,
        selectCheckbox: PropTypes.func,
    };
    openModalPreview = (data) => {
        this.props.openModalPreview(data);
    }
    selectCheckbox = () => {
        const { data } = this.props;
        this.props.selectCheckbox(data);
    }
    render() {
        const {selected, data, defaultGridView} = this.props;
        let imageUri;
        imageUri = data.type === 'video' ? data.thumbnail : data.contentUri;
        const imagePreview = imageUri ? s3URL+imageUri : imgItem;
        let location ='';
        if (data.location){
        location=data.location.split("-");
        location= location[0] +" "+ location[1];
        }
        return (
        <div className="image_list col-md-1-5 col-sm-6" key={data.id+imagePreview}>
            <div className="image-thumb">
            <header className="image-header hover-img">
                <a className="hover-img"  onClick={() => this.openModalPreview(data)}>
                {data.type === 'video' && <div className="video-icon">
                        <i className="icon-play-icon"></i>
                    </div>}
                <LazyLoad height={150}>
                    <img className="lazy" src={imagePreview} />
                </LazyLoad>

                </a>
                <div className="hover-inner hover-inner-hide">
                {data.challengeStatus !== "ARCHIVED" && <input type="checkbox" checked={selected} onChange={this.selectCheckbox} ref="checkToSelectAll" />}  
                {(data.rewardLevel || data.status == 'REWARDED') && defaultGridView ? <div className="rewards-block"><i className="icon-cup-icon"></i>{data.rewardLevel ? data.rewardLevel : ''}</div> : ''}
                {data.favourites && defaultGridView ? <div className="favourite-block"><i className="icon-heart-icon"></i></div> : ''}
                
                </div>
            </header>
            <div className="image-des" onClick={() => this.openModalPreview(data)}>
                <div className="left-side">
                <div className="icon-group">
                    <span className="imageName">{data.name}</span>
                    <div className="icon-content">
                    {(data.rewardLevel ||  data.status == 'REWARDED') && !defaultGridView ? <div className="rewards-block"><i className="icon-cup-icon"></i>{data.rewardLevel}</div> : ''}
                    {data.favourites && !defaultGridView ? <div className="favourite-block"><i className="icon-heart-icon"></i></div> : ''}
                    {data.flagged && data.flagged.length > 0 && !defaultGridView ? <div className="rewards-block flagged"><i className="icon-flag-icon"></i></div> : ''}
                    {data.star > 0 && !defaultGridView ? <div className="star-block"><ReactStars
                            count={5}
                            value={data.star}
                            half={false}                          
                            size={18}
                            edit={false}
                            color2={'#ffd700'}
                            /></div> : ''}
                    </div>
                </div>
                <div className="text-group">
                    <div className="creator-name">{data.firstName + " " + data.lastName +", "+location}</div>
                    {data.star > 0 && defaultGridView ? <div className="star-block"><ReactStars
                            count={5}
                            value={data.star}
                            half={false}                          
                            size={15}
                            edit={false}
                            color2={'#ffd700'}
                            /></div> : ''}
                    {!defaultGridView && data.status === 'PENDING' ? <div className="info"><i className="icon-noti-icon"></i></div> : ''}
                </div>
                </div>
                <div className="right-side">
                {defaultGridView && data.status === 'PENDING' ? <div className="info"><i className="icon-noti-icon"></i></div> : ''}
                {data.flagged && defaultGridView && data.flagged.length > 0 ? <div className="flagged"><i className="icon-flag-icon"></i></div> : ''}           
                </div>            
            </div>         
            </div>

        </div>
        )
    }
    
};
