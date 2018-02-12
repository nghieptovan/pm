import React, {Component, PropTypes} from 'react';
import './Brand.scss';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as ClientActions from '../../redux/actions/client';
import Sidebar from '../Sidebar/Sidebar';
import NavHeader from '../NavHeader/NavHeader';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {getCurrentUser} from "../../utils/common";
import BrandBody from './BrandBody';
const validate = values => {
  return validateClientForm(values);
};

const selector = formValueSelector('clientCreate');
@connect(
  state => ({
    client: state.client,
    admin: state.admin   
  }),
  ({  getList: token => ClientActions.getList(token),
    createClient: (data, token) => ClientActions.createClient(data, token),
    searchClient: (data, token) => ClientActions.searchClient(data, token),
    changeFieldValue: (field, value) => change('clientCreate', field, value),}
  )
)

export default class Brand extends Component {
  constructor(props){
    super(props);
    this.state = {
      listClient: [],     
      error: '',
      openSideBar: false,
      searchList: [],
      searching: false
    }
  }

  static propTypes = { client: PropTypes.object,
    getList: PropTypes.func,
    createClient: PropTypes.func,
    searchClient: PropTypes.func,
    router: React.PropTypes.object
  };

  componentWillMount(){
    if(getCurrentUser() === null){
      browserHistory.push('/admin');
    }
  }

  searchClient = (input) => {
    const { clientList } = this.props.admin;

    if(input.length > 0){
      let searchList = clientList.filter(data => data.brand_name.toLowerCase().includes(input.toLowerCase()));      
      this.setState({searchList, searching: true});
    }else{
      this.setState({searchList: [], searching: false});
    }
  }

  exportClient = () => {
    this.setState({isExportClient: true});
  }

  actionSideBar = (input) => {
    this.setState({openSideBar: input});
  }

  render() {  
    const { client, valid, pristine } = this.props;   
    return (
      <div id="container">
      <div id="wrapper">
        <Sidebar openSideBar={this.state.openSideBar} expanded={true} selected={`report/${this.props.location.pathname.split("/")[3]}`}/>
        <NavHeader title="report" listClient={client.listClient} searchClient={(input) => this.searchClient(input)}
          exportClient={() => this.exportClient()} actionSideBar={(input) => this.actionSideBar(input)} hideCalendar={true}  />
        <div id="page-wrapper">
        <BrandBody searching={this.state.searching} searchList={this.state.searchList} type={this.props.location.pathname.split("/")[3]}/>
        </div>
      </div >  
    </div>
    );
  }
}
