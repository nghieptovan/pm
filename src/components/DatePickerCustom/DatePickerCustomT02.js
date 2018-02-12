import React, {Component} from 'react';
import './DatePickerCustomT02.scss';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default class DatePickerCustomT02 extends Component {

  handleChange = date => {
    
  }

  handleCallendarClick = date => {
    let isStart = this.props.input.name === 'startDate' ? true : false;
    let {dateText} = this.props;
    dateText(date.format('MM-DD-YYYY'), isStart);
  }

  render() {
    let {input, label, meta: {touched, error}} = this.props;
    let ref = input.name;
    return (
      <div className="refixT">
        <DatePicker
          {...input}
          autoFocus={true}
          inline
          shouldCloseOnSelect={false}
          popperPlacement="top-end"
          popperModifiers={{
            preventOverflow: {
              enabled: true,
              escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
              boundariesElement: 'viewport'
            }
          }}
          yearDropdownItemNumber={15}
          placeholderText={label}
          dateFormat="MM-DD-YYYY"          
          ref={ref}
          onChange={this.handleChange}
          onSelect={this.handleCallendarClick}
        />
        {/* <i className="icon-calendar iconDate" onMouseDown={() => this.clickCalendar(ref)}/>
        {(ref === 'startDate' || touched) && (error && <span className='redux-form-error-message'>{error}</span>)} */}
      </div>
    );
  }
}

