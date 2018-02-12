import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import ListChallenges from './ChallengesList';
import CreateChallenge from '../CreateChallenge/CreateChallenge';
import './Challenges.scss';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import * as ChallengeActions from '../../redux/actions/challenge';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import DatePickerCustomT02 from '../DatePickerCustom/DatePickerCustomT02';
import '../DatePickerCustom/DatePickerCustomT02.scss';
import moment from 'moment';
import DatePickerComponent from '../DatePickerCustom/DatePickerComponent';

const selector = formValueSelector('challengeCalendarFilter');

@connect(
  state => ({
    challenge: state.challenge,
  }),
  ({
    getListChallenges: (clientId, token, status) => ChallengeActions.getListChallenges(clientId, token, status)
      }
  )
)
export default class Challenges extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeType: 'LIVE',
      direction: 'asc',
      inputSearch: '',
      challenges: [],
      isSearch: false,
      isSort: false,
      listSearch: [],
      txtStartDate: '',
      txtEndDate: '',
      isCallendarerror: false,
      callendarErrorText: '',   
      loadingUpload: null
    };
  }
  static propTypes = {
    challenge: PropTypes.object,
    getListChallenges: PropTypes.func,
    router: React.PropTypes.object,
    createChallenge: PropTypes.func,
  };

  componentWillMount() {
    const { clientId, token } = getCurrentUser();
    if (!clientId) {
      browserHistory.push('/client');
    }
  }
  componentDidMount() {
    const { token,clientId } = getCurrentUser();
    if (sessionStorage.getItem('isDashboard')) {
      this.changeChallengeType('SAVED');
      sessionStorage.setItem("status", 'SAVED');
      sessionStorage.removeItem('isDashboard');
    } else if (sessionStorage.getItem('isDashboard2')) {
        this.changeChallengeType('COMPLETED');
        sessionStorage.setItem("status", 'COMPLETED');
        sessionStorage.removeItem('isDashboard2');
    } else if (sessionStorage.getItem('isCompleted')) {
      this.changeChallengeType('COMPLETED');
      sessionStorage.setItem("status", 'COMPLETED');
      sessionStorage.removeItem('isCompleted');DatePickerCustomT02
    } else if (sessionStorage.getItem('isArchived')) {
      this.changeChallengeType('ARCHIVED');
      sessionStorage.setItem("status", 'ARCHIVED');
      sessionStorage.removeItem('isArchived');
    } else {
      sessionStorage.setItem("status", 'LIVE');
      this.props.getListChallenges(clientId, token, this.state.activeType);
    }
  }
  componentWillReceiveProps(nextProps) {   
    const { challenge } = this.props;
    const { challenge : nextChallenge} = nextProps;
    this.props.challenge.listChallenges ? this.setState({ challenges: nextProps.challenge.listChallenges, listAll: nextProps.challenge.listChallenges }) : '';   
    challenge.loadingChallenge != nextChallenge.loadingChallenge && nextChallenge.loadingChallenge == 1 ? this.setState({loadingUpload: true}) : '';
    challenge.loadingChallenge != nextChallenge.loadingChallenge && nextChallenge.loadingChallenge == 2  ? this.setState({loadingUpload: false}) : '';
  }
  createChallenge = () => {
    this.setState({ openCreateChallenge: true });
  }
  goLiveStatus = () => {
    const { token, clientId } = getCurrentUser();
    this.setState({
      activeType: 'LIVE'
    });
    this.props.getListChallenges(clientId, token, 'LIVE');
  }

  closeModal = () => {
    this.setState({ openCreateChallenge: false });
  }
  changeChallengeType = (type) => {   
    sessionStorage.setItem("status", type);
    const { token, clientId } = getCurrentUser();
    this.refs.inputsearch.value = '';
    this.props.getListChallenges(clientId, token, type);
    this.setState({ activeType: type, isSort: false, isSearch: false,loadingUpload:true });   
  }
  handleChange = (e) => {
    let name = this.refs.inputsearch;
    if (!name) {
      name = '';
    }
    this.setState({ inputSearch: name.value });
  }
  handleSearch = (e) => {
    const { token, clientId } = getCurrentUser();
    let challenges = this.state.listAll;
    challenges = challenges.filter( data => {
      return data.name.toLowerCase().includes(this.state.inputSearch.toLowerCase())
    });
    this.setState({ challenges: challenges });
  }
  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.handleSearch();
      e.preventDefault();
    }
  }
  sortChallenge = () => {
    const challenges = this.state.challenges;
    let sortedChallenges = []
    if (this.state.direction === 'desc') {
      sortedChallenges = challenges.sort((a, b) => a.name.localeCompare(b.name));
      this.setState({ direction: 'asc', challenges: sortedChallenges, isSort: false });
    } else {
      sortedChallenges = challenges.sort((a, b) => a.name.localeCompare(b.name)).reverse();
      this.setState({ direction: 'desc', challenges: sortedChallenges, isSort: false});
    }
  }
  handleSort = () => {
    this.setState({isSort: true});
  }
  

  handleSearchByDate = (start, end) => {
    const { token, clientId } = getCurrentUser();
    let challenges = this.state.listAll;
    let startDate = new Date(start);
    let endDate = new Date(end);
    startDate = startDate.getTime();
    endDate = endDate.getTime();
    challenges = challenges.filter( data => {
      return (
        !(data.startDate < startDate && data.endDate < startDate) &&
        !(data.startDate > endDate && data.endDate > endDate)
      );
    });
    this.setState({ challenges: challenges });
  }

  render() {
    const { challenge, valid, pristine, params: { shortName } } = this.props;
    return (
      <div id="container">
        <div id="wrapper">
          <SidebarClient shortName={shortName} selected="challenges" />
          <NavHeaderClient title='Challenges' isShowedCreateChallenge={true} createChallenge={this.createChallenge} />
          <div id="page-wrapper">
            <div className="client-dashboard">
              <div className="challenges-dashboard">
                <div className="bortlet" style={{ width: '100%' }}>
                  <div className="bortlet-head">
                    < div className="bortlet-title" >
                      <ul className="nav nav-pills">
                        <li className={this.state.activeType === 'LIVE' ? 'active' : ''} onClick={() => this.changeChallengeType('LIVE')}>
                          <a href="#">Live</a>
                        </li>
                        <li className={this.state.activeType === 'COMPLETED' ? 'active' : ''} onClick={() => this.changeChallengeType('COMPLETED')}>
                          <a href="#">Completed</a>
                        </li>
                        <li className={this.state.activeType === 'SAVED' ? 'active' : ''} onClick={() => this.changeChallengeType('SAVED')}>
                          <a href="#">Saved</a>
                        </li>
                        <li className={this.state.activeType === 'ARCHIVED' ? 'active' : ''} onClick={() => this.changeChallengeType('ARCHIVED')}>
                          <a href="#">Archived</a>
                        </li>
                      </ul>
                    </div>
                    < div className="bortlet-list-icon" >
                      <form className="top-list-search  " action="#" method="POST">
                        <div className="input-group">
                          <input type="text" ref="inputsearch" onChange={this.handleChange} onKeyPress={(e) => this._handleKeyPress(e)} className="form-control" placeholder="Search..." />
                          <span className="input-group-btn">
                            <a onClick={this.handleSearch} className="btn submit">
                              <i className="icon-search-icon"></i>
                            </a>
                          </span>
                        </div>
                      </form>
                      <div className="actions">
                        <a className="btn btn-circle btn-icon-only btn-default" onClick={this.handleSort}>
                          <i className={this.state.direction === 'asc' ? "fa fa-sort-alpha-asc" : "fa fa-sort-alpha-desc"}></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <ListChallenges loadingUpload={this.state.loadingUpload} changeChallengeType={this.changeChallengeType} shortName={shortName} resetSort ={this.resetSort} listChallenges={this.state.challenges} typeChallenge={this.state.activeType} goLiveStatus={this.goLiveStatus} sortChallenge={this.sortChallenge} isSort={this.state.isSort}/>
                </div>
                <DatePickerComponent searchCallendar={this.handleSearchByDate}/>
              </div>
            </div>
          </div>
        </div>
        <CreateChallenge shortName={shortName} openCreateChallenge={this.state.openCreateChallenge} isDashboard={false} changeChallengeType={this.changeChallengeType} closeModal={this.closeModal} />
      </div>
    );
  }
}

Challenges = reduxForm({
  form: 'challengeCalendarFilter',
})(Challenges);
