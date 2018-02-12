import React, {Component, PropTypes} from 'react';
import './ClientList.scss';
import moment from 'moment';
import Modal from 'react-modal';
import * as ClientActions from '../../redux/actions/client';
import {connect} from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import { Field, reduxForm, formValueSelector, reset } from 'redux-form';
import DatePickerCustom from './../../components/DatePickerCustom/DatePickerCustom';
import {renderField} from "../ReduxField";
import {validateClientForm} from  '../../utils/formValidation';
import {USER_DATA_DEFAULT} from './../../redux/constants/FieldTypes';
import './ReportList.scss';
import ReactLoading from 'react-loading';
export default class ReportList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      heightWindow: ''
    }
  }

  static propTypes = {
    listClient: PropTypes.array,
  };

  componentDidMount(){
    this.setState({ heightWindow: window.innerHeight - 120 });
    // var html = this.refs.listClientPage.innerHTML; //Some HTML String from code above 
  }
  renderItemUser(user, data){ 
    let current = new Date;
    let daysActive;
    if(user.status == 'Active'){
      daysActive = Math.round((current.getTime() - user.startDate)/86400000) ;
    } else if (current.getTime() > user.endDate){
      daysActive = Math.round((user.endDate - user.startDate)/86400000);
    } else {
      daysActive = 0;
    }
    return (
      <div className="rowBody item" key={data + 1}>
        <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 text-left item-brandName">{user.brandName}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.totalChallenges}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.live}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.inactive}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.saved}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.archived}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{daysActive}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.totalSubmissions}</div>
        <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{user.rewarded}</div>
        <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 text-center">{user.totalRewarded}</div>
      </div>
    );
  }

  render() {
    let { reportList } = this.props;
    return (
        <div className="container-fluid report-page">
            <div className="row report-title" >
               
                    <div className="col-md-12 col-lg-12 col-sm-12">
                      <span className="title-challenge">CLIENT</span>
                      <span>CHALLENGES</span>
                    </div>
                
            </div>
            <div className="row createadmin" style={{ height: '50px', verticalAlign: 'middle', padding: '15px 0px', fontSize:'13px', background: '#151925', marginTop: '5px'}}>
              <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 text-center">{'\u00A0'}</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Total</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Live</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Inactive</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Saved</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Archived</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Days Active</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">Total Uploads</div>
              <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">No.of Rewards</div>
              <div className="col-lg-2 col-md-2 col-sm-2 col-xs-2 text-center">Total Rewards ($)</div>                   
            </div>
            {this.props.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                }
            {!this.props.loadingUpload &&
              <Scrollbars autoHide style={{ height: window.innerHeight - 180 }} renderThumbVertical={({ style, ...props }) =>
              <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
              }>
              <div className="contentList">
                {reportList && reportList.map(this.renderItemUser, this, '')}
              </div>
              </Scrollbars>
            }
        </div>
    )
  }
}


