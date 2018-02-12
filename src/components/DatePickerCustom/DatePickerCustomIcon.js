import React, {Component, PropTypes} from 'react';

export default class DatePickerCustomIcon extends Component {

  handleClick = () => {
      this.props.clickDatePicker();
  }

  render() {
    return (
        <i className="icon-calendar iconDate iconDateHeader example-custom-input" onClick={this.handleClick}></i>
    );
  }
}
