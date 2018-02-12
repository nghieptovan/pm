import React, { Component, PropTypes } from 'react';
import '../Admin/AdminList.scss';
import { Scrollbars } from 'react-custom-scrollbars';
import { getCurrentUser } from '../../utils/common';
import classNames from 'classnames';
import ReactLoading from 'react-loading';
export default class ReviewerList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      sortType: 'none',
    }
  }

  static propTypes = {
    changeCreateToEditReviewer: PropTypes.func,
  };

  clickToEdit = user => {
    this.props.changeCreateToEditReviewer(user);
  }

  renderItemReviewer = (user, data) => {
    const isReviewer = getCurrentUser().role == 'REVIEWER' ? true : false;
    return (
      <tr key={data}>
        <td className={classNames('text-left txt-oflo', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}
        ><span>{user.firstName}</span></td>
        <td className={classNames('txt-oflo text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}><span>{user.lastName}</span></td>
        <td className={classNames('text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}><span>{user.username}</span></td>
        <td className={classNames('text-center txt-oflo', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}><span>{user.mobile}</span></td>
        <td className={classNames('text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}><span>{user.email}</span></td>
        <td className={classNames('text-center', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}>
          {user.status == 'Active' &&
            <button type="button" className="btn btn-circle btn-success btn-refix disableButton" />
          }
          {user.status == 'Deactive' &&
            <button type="button" className="btn btn-circle btn-refix btn-error2 disableButton" />
          }
        </td>
        {getCurrentUser().role !== 'REVIEWER' &&
        <td className="text-center brand_value col-client-7"><span onClick={this.clickToEdit.bind(this, user)}>Edit</span></td>
        }
      </tr>
    );
  }

  _sortFirstNameAsc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.firstName.toLowerCase() !== b.firstName.toLowerCase() ? a.firstName.toLowerCase() > b.firstName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortFirstNameDesc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.firstName.toLowerCase() !== b.firstName.toLowerCase() ? a.firstName.toLowerCase() < b.firstName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortLastNameAsc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.lastName.toLowerCase() !== b.lastName.toLowerCase() ? a.lastName.toLowerCase() > b.lastName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortLastNameDesc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.lastName.toLowerCase() !== b.lastName.toLowerCase() ? a.lastName.toLowerCase() < b.lastName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortUserNameAsc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.username.toLowerCase() !== b.username.toLowerCase() ? a.username.toLowerCase() > b.username.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortUserNameDesc = listReviewers => {
    var newList = [];
    const myList = [].concat(listReviewers)
      .sort((a, b) => a.username.toLowerCase() !== b.username.toLowerCase() ? a.username.toLowerCase() < b.username.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  setSortType = type => {
    this.setState({ sortType: type });
  }

  sortTable = listReviewers => {
    const type = this.state.sortType;
    if (type === 'first_name_asc') {
      return this._sortFirstNameAsc(listReviewers);
    } else if (type === 'first_name_desc') {
      return this._sortFirstNameDesc(listReviewers);
    } else if (type === 'last_name_asc') {
      return this._sortLastNameAsc(listReviewers);
    } else if (type === 'last_name_desc') {
      return this._sortLastNameDesc(listReviewers);
    } else if (type === 'user_name_asc') {
      return this._sortUserNameAsc(listReviewers);
    } else if (type === 'user_name_desc') {
      return this._sortUserNameDesc(listReviewers);
    } else {
      return listReviewers;
    }
  }

  render() {
    const isReviewer = getCurrentUser().role == 'REVIEWER' ? true : false;
    const { heightList, listReviewers } = this.props;
    const _listReviewers = this.sortTable(listReviewers);
    return (
      <div className="table-reviewers row-fluid">
        <div className="table-responsive" style={{background: '#192135'}}>
       
            <table className="table" id='reviewerTable'>
              <thead>
                <tr>
                  <th className={classNames('item-sort text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}>
                    <span className="title-list" onClick={() => this.setSortType(this.state.sortType === 'first_name_asc' ? 'first_name_desc' : 'first_name_asc')}>First Name</span>
                    <div className="sort-area">
                    <div className='triangle triangle-top' onClick={() => this.setSortType('first_name_asc')} />
                    <div className='triangle triangle-bottom' onClick={() => this.setSortType('first_name_desc')} />
                    </div>
                    
                  </th>
                  <th className={classNames('item-sort text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })} >
                    <span className="title-list" onClick={() => this.setSortType(this.state.sortType === 'last_name_asc' ? 'last_name_desc' : 'last_name_asc')}>Last Name</span>
                    <div className="sort-area">
                    <div className='triangle triangle-top' onClick={() => this.setSortType('last_name_asc')} />
                    <div className='triangle triangle-bottom' onClick={() => this.setSortType('last_name_desc')} />
                    </div>
                  </th>
                  <th className={classNames('item-sort text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })} >
                    <span className="title-list" className="title-list" onClick={() => this.setSortType(this.state.sortType === 'user_name_asc' ? 'user_name_desc' : 'user_name_asc')}>Username</span>
                    <div className="sort-area">
                    <div className='triangle triangle-top' onClick={() => this.setSortType('user_name_asc')} />
                    <div className='triangle triangle-bottom' onClick={() => this.setSortType('user_name_desc')} />
                    </div>
                  </th>
                  <th className={classNames('text-center title-list', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}
                  >Mobile</th>
                  <th className={classNames('title-list text-left', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}>Email</th>
                  <th className={classNames('text-center title-list', 
                  { 'col-lg-2 col-md-2 col-sm-2 col-xs-2': isReviewer, 'col-client-7': !isReviewer })}>Status</th>
                  {getCurrentUser().role !== 'REVIEWER' && <th className="text-center title-list col-client-7">Actions</th>}
                </tr>
              </thead>             
              <tbody style={{height: isReviewer ? window.innerHeight - 120 + 'px' :  300 + 'px'}}>
                {_listReviewers && _listReviewers.map(this.renderItemReviewer, this, '')}
                {this.props.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                 } 
              </tbody>
            </table>                     
        </div>
      </div>
    )
  }
}