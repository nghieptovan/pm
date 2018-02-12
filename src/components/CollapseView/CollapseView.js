import React, {Component, PropTypes} from 'react';
import SmoothCollapse from 'react-smooth-collapse';
import './CollapseView.scss';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
export default class CollapseView extends Component {  
    constructor(props){
        super(props);       
    }    
    renderListPage = (page, data) =>{
        return (
            <div className="page-facebook" key={data}>
            <div className="left-side">
            <Checkbox value={page}/>
                <img src={page.pagePicture} />                
            </div>
            <div className="right-side">
                <p>{page.name}</p>               
            </div>
        </div>
        )
    }    
    render() {       
        const { userData, expanded, listPageFacebook } = this.props;        
        return (   
            <SmoothCollapse expanded={expanded}>
            <div className="container-fluid contents">
                <div className="row content-title">                   
                {listPageFacebook && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <img src={userData.accessToken ? userData.picture.data.url : userData.picture} />
                        <span>{userData.name}</span>  
                    </div>}
                {!listPageFacebook && <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <img src={userData.profileImage} />
                    <span>{userData.username}</span>  
                </div>}
                </div>
                <div className="row content-body">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                    <div className="list-page-facebook">
                    {listPageFacebook &&<CheckboxGroup
                    name="facebook"
                    onChange={this.props.pageSelected}
                    value={this.props.listSelected}>
                        {listPageFacebook && listPageFacebook.map(this.renderListPage, this, '')}   
                    </CheckboxGroup> }
                    </div>
                    </div>
                </div>
                </div>
            </SmoothCollapse>          
            );
    }
}