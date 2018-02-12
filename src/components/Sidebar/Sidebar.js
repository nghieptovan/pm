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
        selectNav:'challenges',
    });
  }
  showSelection = (id, parent) => {  
    if(!parent){      
     id !== 'report' ? browserHistory.push(`/admin/${id}`) : '';      
    }else {       
      browserHistory.push(`/admin/${id}`);
    }
  }
  render() {
    const {openSideBar, selected} = this.props;
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
                    <Nav id='clients'>
                        <NavIcon><i className={`fa fa-fw icon-user-group`} aria-hidden="true"></i></NavIcon>    
                        <NavText>CLIENT</NavText>
                    </Nav>                   
                    <Nav id="report" expanded={this.props.expanded ? true : false}>
                        <NavIcon><i className={`icon-sidebar icon-report_1`} aria-hidden="true"></i></NavIcon>    
                        <NavText>REPORTS</NavText>
                        <Nav id="accounts">
                            <NavText><i className={`icon-sidebar icon-account`} aria-hidden="true"></i><span>ACCOUNTS</span></NavText>
                        </Nav>
                        <Nav id="reviewers">
                            <NavText><i className={`icon-sidebar icon-report`} aria-hidden="true"></i><span>CHALLENGES</span></NavText>
                        </Nav>
                        <Nav id="rewards">
                            <NavText><i className={`icon-sidebar icon-rewards`} aria-hidden="true"></i><span>REWARDS</span></NavText>
                        </Nav>
                    </Nav>   
                    <Nav id='admins'>
                        <NavIcon><i className={`icon-sidebar icon-Admin_Icon`} aria-hidden="true"></i></NavIcon>    
                        <NavText>ADMIN</NavText>
                    </Nav>
                                   
                </SideNav>
                </div>
                
            </div>
            
        </div>
    )
  
  }
}
