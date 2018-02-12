import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import logoImg from '../../assets/logo.png';
import { Link } from 'react-router';
import './Sidebar.scss';
import classNames from 'classnames';
import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';

export default class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = ({
            selectNav:'challenges'
        });
    }
    showSelection = (id, parent) => {
        const {shortName} = this.props;      
        if(!parent && id != 'settings'){
            browserHistory.push(`/client/${shortName}/${id}`);
        }else if(parent){           
            let splitId = id.split('/');
            if(splitId[1] == 'configure'){                           
                browserHistory.push(`/client/${shortName}/${splitId[1]}`);
            } else {
            browserHistory.push(`/client/${shortName}/${parent}/${splitId[1]}`);
            }                             
        }
    }
  render() {
    const {openSideBar, shortName, selected, defaultSelected} = this.props;
    return (
        <div className={ openSideBar ? 'openSideBar navbar-default sidebar sideBar' : 'closeSideBar navbar-default sidebar sideBar'} role="navigation">
            <div className="sidebar-nav">
                <div className="center p-30">
                     <img src={logoImg} />
                </div>
                <div style={{color: '#FFF'}}> 
                <SideNav 
                hoverBgColor='#2a3245' 
                hoverColor='#ffffff' 
                highlightColor='#ffffff' 
                highlightBgColor='#2a3245' 
                selected={selected}
                onItemSelection={ (id, parent) => this.showSelection(id, parent)}>       
                    <Nav id='dashboard'>
                        <NavIcon><i className={`fa fa-fw fa-home`} aria-hidden="true"></i></NavIcon>    
                        <NavText>DASHBOARD</NavText>
                    </Nav>
                    <Nav id='uploads'>
                        <NavIcon><i className={`fa fa-fw icon-upload`} aria-hidden="true"></i></NavIcon>    
                        <NavText>UPLOADS</NavText>
                    </Nav>
                    <Nav id='challenges'>
                        <NavIcon><i className={`fa fa-fw icon-challenges`} aria-hidden="true"></i></NavIcon>    
                        <NavText>CHALLENGES</NavText>
                    </Nav>

                    <Nav id="creators">
                        <NavIcon><i className={`fa fa-fw icon-user-group`} aria-hidden="true"></i></NavIcon>    
                        <NavText>CREATORS</NavText>                                       
                    </Nav> 

                    {/* <Nav id='creators'>
                        <NavIcon><i className={`fa fa-fw icon-user-group`} aria-hidden="true"></i></NavIcon>    
                        <NavText>CREATORS</NavText>
                    </Nav>                                        */}
                    <Nav id='rewards'>
                        <NavIcon><i className={`fa fa-fw icon-rewards`} aria-hidden="true"></i></NavIcon>    
                        <NavText>REWARDS</NavText>
                    </Nav>
                    {/* <Nav id='contact'>
                        <NavIcon><i className={`fa fa-fw icon-user-group`} aria-hidden="true"></i></NavIcon>    
                        <NavText>CONTACT</NavText>
                    </Nav> */}
                    <Nav id="settings" expanded={this.props.expanded ? true : false}>
                        <NavIcon><i className={`fa fa-fw fa-cog`} aria-hidden="true"></i></NavIcon>    
                        <NavText>SETTINGS</NavText>
                        <Nav id="reviewers">
                            <NavText><i className={`icon-sidebar icon-reviewer-icon`} aria-hidden="true"></i><span>REVIEWER</span></NavText>
                        </Nav>
                        <Nav id="socialmedia">
                            <NavText><i className={`icon-sidebar icon-social-media`} aria-hidden="true"></i><span>SOCIAL MEDIA</span></NavText>
                        </Nav>
                        <Nav id="configure">
                            <NavText><i className={`icon-sidebar icon-configure`} aria-hidden="true"></i><span>EMAILS</span></NavText>
                        </Nav>      
                    </Nav>                    
                </SideNav>
                </div>
                
            </div>
            
        </div>
        
    )
  }
}

