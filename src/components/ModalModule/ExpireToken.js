import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import { getCurrentUser } from '../../utils/common';
import {s3URL} from '../../config';
import * as AuthActions from '../../redux/actions/auth';

@connect(
    state => ({     
        auth: state.auth
    }),
    ({ 
        logout: (token) => AuthActions.logout(token)
     }
    )
  )

export default class ExpireToken extends Component {
  constructor(props){
    super(props);
    this.state = ({
      classAfterModal: null     
    });
  }  
  static propTypes = {
    closeModal: PropTypes.func,
    closeWithData: PropTypes.func,
  }

  closeModal = () => {
    this.props.closeModal();
  };
  componentWillReceiveProps(nextProps) {   
    const { auth } = this.props;
    const { auth: nextAuth } = nextProps;
    if(auth.logout != nextAuth.logout  && nextAuth.logoutMsg) {
        sessionStorage.removeItem('currentUser');
        sessionStorage.clear();
        localStorage.clear();
        browserHistory.push("/");
    } else if (nextAuth.error){
        this.setState({error: nextAuth.error});
    }
}

  actionExpire = () => {
    const { token } = getCurrentUser();
    sessionStorage.clear();
    localStorage.clear();
    this.props.logout(token);
}
  render() {  
    const { openModal, classModal, dataModal } = this.props;
    let type = this.state.type || this.props.type;
    return (
        <div className="container-fluid">
                   
            <form className='form-confirm'>
            <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                    <span className='title-confirm-popup'>For your security you have been logged out due to inactivity, please login again.</span>
                    <span className='confirm-logout' onClick={this.actionExpire}>OK</span>
                </div>
            </div>
        </form>
        </div>
    );
  }
}
