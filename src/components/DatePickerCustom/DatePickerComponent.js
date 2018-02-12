import React, { Component, PropTypes } from 'react';
import '../Client/Challenges.scss';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as ChallengeActions from '../../redux/actions/challenge';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import DatePickerCustomT02 from './DatePickerCustomT02';
import './DatePickerCustomT02.scss';
import moment from 'moment';

export default class DatePickerComponent extends React.Component {
    constructor () {
        super ();
        this.state = ({
            txtStartDate: '',
            txtEndDate: '',
            isCallendarerror: false,
            callendarErrorText: '',
            popupVisible: false
        })   
    }

    handleClick = () => {
        if (!this.state.popupVisible) {
          // attach/remove event handler
          document.addEventListener('click', this.handleOutsideClick, false);
          this.setState({callendarErrorText: '', txtEndDate: '', txtStartDate: ''})
        } else {
          document.removeEventListener('click', this.handleOutsideClick, false);
        //   this.setState({callendarErrorText: '', txtEndDate: '', txtStartDate: ''})
        }
    
        this.setState(prevState => ({
           popupVisible: !prevState.popupVisible,
        }));
    }

    handleOutsideClick = (e) => {
        // ignore clicks on the component itself
        if (this.node.contains(e.target)) {
          return;
        }
        
        this.handleClick();
    }

    handleCalendarDate = (text, isStartDate) => {
        if (isStartDate) {
            this.setState({txtStartDate: text});  
          } else {
            this.setState({txtEndDate: text});
            this.refs.txtEndDate.value = text;
      
            let startDate = new Date(this.state.txtStartDate);
            let endDate = new Date(this.refs.txtEndDate.value);
            startDate = startDate.getTime();
            endDate = endDate.getTime();
      
            if (this.state.txtStartDate.length == 0) {
              this.setState({isCallendarerror: true, callendarErrorText: 'This field is required'})
            } else if (startDate > endDate) {
              this.setState({isCallendarerror: true, callendarErrorText: 'From date cannot be greater than to date'})
            } else {
              this.handleSearchByDate();
              this.handleClick();             
            } 
          }
    }

    handleSearchByDate = () => {
        let {searchCallendar} = this.props;
        searchCallendar(this.state.txtStartDate, this.refs.txtEndDate.value);
        this.setState({isCallendarerror: false, txtStartDate: '', txtEndDate: ''});  
    }

    render () {
        return (
            <div ref={node => { this.node = node; }}>
                <a className="circle-shape">
                    <i className="icon-calendar icon-calendar-refix" onClick={this.handleClick}></i>
                </a>

                {this.state.popupVisible && (
                    <div className="calendarSearchWrapper">
                        <div className="divTriangle"></div>
                        <div className="calendarFilter" style={{display:'flex', width: 'auto', minWidth: '430px', height: 'auto', minHeight: '280px', background: 'rgb(221, 221, 221)'}}>
                            <div>
                            <form>
                                <div className="divCalendar">
                                <div className="divStartDate">
                                    <div className="inputWrapper">
                                        <span>From</span>
                                        <input type="text" ref="txtStartDate" value={this.state.txtStartDate}/>
                                    </div>
                                    <Field
                                        dateText={this.handleCalendarDate}                               
                                        name="startDate"
                                        component={DatePickerCustomT02}/>
                                </div>
                                <div className="divEndDate">
                                    <div className="inputWrapper">
                                        <span>To</span>
                                        <input type="text" ref="txtEndDate" value={this.state.txtEndDate}/>
                                    </div>
                                    <Field
                                        dateText={this.handleCalendarDate}                                
                                        name="endDate"
                                        component={DatePickerCustomT02}/>
                                </div>
                                </div>
                            </form>
                            </div>
                        </div>
                        <span className="callendarError" style={{display: this.state.isCallendarerror ? 'block' : 'none'}}>{this.state.callendarErrorText}</span>
                    </div>
                )}  
          </div>
        )
    }
}

  