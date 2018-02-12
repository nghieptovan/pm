import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import ReactGA from 'react-ga';

class App extends Component {
  constructor(props){
    super(props);
  }
  static childContextTypes = {
    ReactGA: React.PropTypes.object
  };
  getChildContext() {
    ReactGA.initialize('UA-107273291-1', {
      'cookieDomain': 'none',
      'debug': true
    });   
    return {ReactGA};
  }

  render() {
    const {actions} = this.props;
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
App.propTypes = {  
  children: PropTypes.object.isRequired
}

export default App;
