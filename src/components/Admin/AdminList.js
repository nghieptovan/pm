import React, { Component, PropTypes } from 'react';
import './AdminList.scss';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactLoading from 'react-loading';
export default class AdminList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortType: 'none',
    }
  }

  static propTypes = {
    changeCreateToEditAdmin: PropTypes.func,
  };

  clickToEdit(user) {
    this.props.changeCreateToEditAdmin(user);
  }

  renderItemAdmin(user, data) {
    return (
      <tr key={data}>
        <td className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-center">{data + 1}</td>
        <td className="txt-oflo col-lg-2 col-md-2 col-sm-2 col-xs-2 text-overflow">{user.firstName}</td>
        <td className="txt-oflo col-lg-2 col-md-2 col-sm-2 col-xs-2 text-overflow">{user.lastName}</td>
        <td className="txt-oflo col-lg-2 col-md-2 col-sm-2 col-xs-2 text-overflow">{user.username}</td>
        <td className="text-center txt-oflo col-lg-2 col-md-2 col-sm-2 col-xs-2 text-overflow">{user.mobile}</td>
        <td className="col-lg-1 col-md-1 col-sm-1 col-xs-1 text-overflow text-left"><span>{user.email}</span></td>
        <td className="text-center col-lg-1 col-md-1 col-sm-1 col-xs-1 text-overflow">
          {user.status === 'Active' &&
            <button type="button" className="btn btn-success btn-circle disableButton" />
          }
          {user.status === 'Deactive' &&
            <button type="button" className="btn btn-success btn-circle btn-error2 disableButton" />
          }
        </td>
        <td className="text-center brand_value col-lg-1 col-md-1 col-sm-1 col-xs-1 text-overflow"><span onClick={this.clickToEdit.bind(this, user)}>Edit</span></td>
      </tr>
    );
  }

  _sortFirstNameAsc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.firstName.toLowerCase() !== b.firstName.toLowerCase() ? a.firstName.toLowerCase() > b.firstName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortFirstNameDesc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.firstName.toLowerCase() !== b.firstName.toLowerCase() ? a.firstName.toLowerCase() < b.firstName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortLastNameAsc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.lastName.toLowerCase() !== b.lastName.toLowerCase() ? a.lastName.toLowerCase() > b.lastName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortLastNameDesc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.lastName.toLowerCase() !== b.lastName.toLowerCase() ? a.lastName.toLowerCase() < b.lastName.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortUserNameAsc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.username.toLowerCase() !== b.username.toLowerCase() ? a.username.toLowerCase() > b.username.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  _sortUserNameDesc = listAdmin => {
    var newList = [];
    const myList = [].concat(listAdmin)
      .sort((a, b) => a.username.toLowerCase() !== b.username.toLowerCase() ? a.username.toLowerCase() < b.username.toLowerCase() ? -1 : 1 : 0)
      .map((item, i) =>
        newList = [...newList, item]
      );
    return newList;
  }

  setSortType = type => {
    this.setState({ sortType: type });
  }

  sortTable = listAdmin => {
    const type = this.state.sortType;
    if (type === 'first_name_asc') {
      return this._sortFirstNameAsc(listAdmin);
    } else if (type === 'first_name_desc') {
      return this._sortFirstNameDesc(listAdmin);
    } else if (type === 'last_name_asc') {
      return this._sortLastNameAsc(listAdmin);
    } else if (type === 'last_name_desc') {
      return this._sortLastNameDesc(listAdmin);
    } else if (type === 'user_name_asc') {
      return this._sortUserNameAsc(listAdmin);
    } else if (type === 'user_name_desc') {
      return this._sortUserNameDesc(listAdmin);
    } else {
      return listAdmin;
    }
  }

  render() {
    const { listAdmin, heightList } = this.props;
    const _listAdmin = this.sortTable(listAdmin);
    return (
      <div className="createadmin row-fluid">
        <div className="table-responsive">
            <table className="table table-adminlist" id='adminTable'>
              <thead>
                <tr>
                  <th className="col-lg-1 col-md-1 col-sm-1 col-xs-1">SI No</th>
                  <th className="col-lg-2 col-md-2 col-sm-2 col-xs-2 item-sort">
                    <span className="title-list" onClick={() => this.setSortType(this.state.sortType === 'first_name_asc' ? 'first_name_desc' : 'first_name_asc')}>First Name</span>
                    <div className="sort-area">
                      <div className='triangle triangle-top' onClick={() => this.setSortType('first_name_asc')} />
                      <div className='triangle triangle-bottom' onClick={() => this.setSortType('first_name_desc')} />
                    </div>
                    
                  </th>
                  <th className="col-lg-2 col-md-2 col-sm-2 col-xs-2 item-sort">
                    <span className="title-list" onClick={() => this.setSortType(this.state.sortType === 'last_name_asc' ? 'last_name_desc' : 'last_name_asc')}>Last Name</span>
                    <div className="sort-area">
                      <div className='triangle triangle-top' onClick={() => this.setSortType('last_name_asc')} />
                      <div className='triangle triangle-bottom' onClick={() => this.setSortType('last_name_desc')} />
                    </div>
                  </th>
                  <th className="col-lg-2 col-md-2 col-sm-2 col-xs-2 item-sort">
                    <span className="title-list" onClick={() => this.setSortType(this.state.sortType === 'user_name_asc' ? 'user_name_desc' : 'user_name_asc')}>Username</span>
                    <div className="sort-area">
                      <div className='triangle triangle-top' onClick={() => this.setSortType('user_name_asc')} />
                      <div className='triangle triangle-bottom' onClick={() => this.setSortType('user_name_desc')} />
                    </div>
                  </th>
                  <th className="text-center title-list col-lg-2 col-md-2 col-sm-2 col-xs-2">Mobile</th>
                  <th className="title-list col-lg-1 col-md-1 col-sm-1 col-xs-1" style={{textAlign: 'left'}}>Email</th>
                  <th className="text-center title-list col-lg-1 col-md-1 col-sm-1 col-xs-1">Status</th>
                  <th className="text-center title-list col-lg-1 col-md-1 col-sm-1 col-xs-1">Actions</th>
                </tr>
              </thead>
              <tbody style={{ height: '200px' }}>
              {this.props.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                }
              {_listAdmin && _listAdmin.map(this.renderItemAdmin, this, '')}
              </tbody>
            </table>
        </div>
      </div>
    )
  }
}