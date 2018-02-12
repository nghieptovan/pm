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

export default class SuccessModal extends Component {
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


  
  render() {  
    const { openModal, classModal, dataModal, typeSuccess } = this.props;
    let type = this.state.type || this.props.type;
    return (
        <div className="container-fluid">
            {
              typeSuccess == 'editClient' && <form className='form-confirm'>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                  <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-check" aria-hidden="true"></i></button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <span className='title-confirm-popup'>{"Client info has been updated"}</span>
                </div>
              </div>
            </form>
            }
            {typeSuccess == 'createClient' && <form className='form-confirm'>
                <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                    <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-check" aria-hidden="true"></i></button>
                </div>
                </div>
                <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                    <span className='title-confirm-popup'>{"New client has been added"}</span>
                </div>
                </div>
            </form>}
        </div>
    );
  }
}
