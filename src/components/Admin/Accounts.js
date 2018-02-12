import React, {Component, PropTypes} from 'react';
import './Accounts.scss';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import * as AdminActions from '../../redux/actions/admin';
import Sidebar from '../Sidebar/Sidebar';
import ReportList from './ReportList';
import NavHeader from '../NavHeader/NavHeader';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import {validateTransactionForm} from  './../../utils/formValidation';
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import {getCurrentUser} from "../../utils/common";
import AccountList from "./AccountList";
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import _ from 'lodash';
import InputMask from 'react-input-mask';
import ReactLoading from 'react-loading';
const validate = values => {
  return validateTransactionForm(values, false);
};

const selector = formValueSelector('transactionForm');
@connect(
  state => ({
    admin: state.admin,  
    fields: selector(state, 'amount', 'type', 'detail', 'note')
  }),
  ({  
    getTransaction: (clientId, token) => AdminActions.getTransaction(clientId, token),
    createTransaction: (data, token) => AdminActions.createTransaction(data, token),
    changeFieldValue: (field, value) => change('transactionForm', field, value)}
  )
)
export default class Accounts extends Component {
  constructor(props){
    super(props);
    this.state = {
      transactionList: [],
      modalIsOpen: false,
      error: '',
      openSideBar: false,
      openTransaction: false,
      transactionType: ["FUNDS IN","FUNDS OUT"],
      activeType: 'All',
      createSuccess: false,
      searching: false,
      searchList: [],
      totalAmount: null,
      creatingTransaction: false,
      errorTotalBudget: ''     
    }
  }

  static propTypes = { admin: PropTypes.object,
    getTransaction: PropTypes.func,    
    router: React.PropTypes.object,
    searchClient: PropTypes.func,    
  };
  exportClient = () => {
    this.setState({isExportClient: true});
  }

  actionSideBar = (input) => {
    this.setState({openSideBar: input});
  }
  newTransaction = () => {
    this.setState({openTransaction: true});
  }
  closeModal = () => {
    this.props.reset();
    this.setState({ openTransaction: false, error: '',totalAmount: null, errorTotalBudget: null})
  }
  handleHeader = (status) => {
    const { transactionList } = this.props.admin;
    
    let result = [];
    if(status == 'FUNDS IN' || status == 'FUNDS OUT'){
      result = transactionList.filter(data => data.transactionType.toLowerCase().includes(status.toLowerCase()));  
    }else{
      result = transactionList;
    }
    this.setState({activeType: status, transactionList: result});
    
  }
  componentDidMount(){
    const {token} = getCurrentUser();
    this.props.getTransaction(this.props.params.clientId, token);
    this.setState({loadingUpload: true});
  }
  componentWillReceiveProps(nextProps){
    const { admin } = this.props;
    const { admin: nextAdmin } = nextProps;
    if(admin.createTransactionStatus !== nextAdmin.createTransactionStatus && nextAdmin.createTransactionStatus == 1){
      this.setState({creatingTransaction: true});
    }
    if(admin.createTransactionStatus !== nextAdmin.createTransactionStatus && nextAdmin.createTransactionStatus == 2){
      if(!nextAdmin.error){
        this.setState(prevState => ({
          activeType: 'All'
        }));
        this.setState({ createSuccess: true, transactionList: nextAdmin.transactionList, creatingTransaction: false });
        setTimeout(() => {
          this.props.reset();
          this.setState({ createSuccess: false, openTransaction: false, error: '',totalAmount: null, errorTotalBudget: null });
        }, 1000);
      }else{
        this.setState({error: nextAdmin.error, creatingTransaction: false});
      }      
    }    
    admin.loadingIcon !== nextAdmin.loadingIcon && nextAdmin.loadingIcon == 1 ? this.setState({loadingUpload: true}):'';
    admin.loadingIcon !== nextAdmin.loadingIcon && nextAdmin.loadingIcon != 1 ? this.setState({loadingUpload: false}):'';
    admin.getTransaction !== nextAdmin.getTransaction && nextAdmin.transactionList ? this.setState({transactionList: nextAdmin.transactionList}) : '';

  }
  afterOpenModal = () => {
    this.props.changeFieldValue('detail', '');    
    this.props.changeFieldValue('amount', '');  
    this.props.changeFieldValue('note', '');
    this.props.changeFieldValue('type', '');      
  };
  handleCreate = (e) => {
    e.preventDefault();   
    if (this.props.valid) {
      const { fields } = this.props;
      const clientId = this.props.params.clientId;
      const { token} = getCurrentUser();
        const dataInput = {
          clientId: clientId,
          transactionComment: fields.note,
          transactionType: fields.type,
          transactionAmount: this.state.totalAmount,
          transactionDetail: fields.detail      
        }
        this.props.createTransaction(dataInput, token);
        this.setState({ clickCreate: true });     
    }
  }
  searchClient = (input) => {
    const { transactionList } = this.props.admin;

    let result = [];
    if(this.state.activeType == 'FUNDS IN' || this.state.activeType == 'FUNDS OUT'){
      result = transactionList.filter(data => data.transactionType.toLowerCase().includes(this.state.activeType.toLowerCase()));  
    }else{
      result = transactionList;
    }

    if(input.length > 0){
      let transactionAmount = result.filter(data => data.transactionAmount ? data.transactionAmount.toString().includes(input) : '');  
      let transactionDetail = result.filter(data => data.transactionDetail ? data.transactionDetail.toLowerCase().includes(input.toLowerCase()) : '');
      let transactionComment = result.filter(data => data.transactionComment ? data.transactionComment.toLowerCase().includes(input.toLowerCase()) : '' );
      let balance = result.filter(data => data.balance ? data.balance.toString().includes(input) : '');
      let usableBudget = result.filter(data => data.usableBudget ? data.usableBudget.toString().includes(input) : '');      
      let transactionDate = result.filter(data => data.transactionDate ? moment(data.transactionDate).format("MM-DD-YYYY").includes(input.toLowerCase()) : ''); 

      let searchList = _.union(transactionAmount, transactionDetail, transactionComment, balance, usableBudget, transactionDate);
      this.setState({searchList, searching: true});
    }else{
      this.setState({searchList: [], searching: false});
    }
  }
  onChangeTotalBudget = (event) => {
    const value = event.target.value;
    const totalAmount = value.split('$')[1];
    totalAmount == 0 ? this.setState({totalAmount: null, errorTotalBudget: 'Transaction amount greater than 0'}):this.setState({totalAmount, errorTotalBudget: ''});
  }
  render() {   
    const { client, valid, pristine } = this.props;
    let disableButtonStyle = {cursor:'pointer'};
    if(!valid || pristine || this.state.creatingTransaction || !this.state.totalAmount ) {
      disableButtonStyle.opacity = 0.5;
      disableButtonStyle.pointerEvents = 'none';
    }
    this
    return (      
      <div id="container">
      <div id="wrapper">
        <Sidebar openSideBar={this.state.openSideBar} expanded={true} selected="report/accounts" />
        <NavHeader listAll={this.state.transactionList} newTransaction={this.newTransaction} title="transaction" id={this.props.params.clientId} name={this.props.params.brandName} actionSideBar={(input) => this.actionSideBar(input)} 
        searchClient={(input) => this.searchClient(input)} hideCalendar={true} />
        <div id="page-wrapper">
          <div className="body-wrapper-fix">        
              <div className="bortlet">
                <div className="bortlet-head">
                  <div className="bortlet-title" >
                    <ul className="nav nav-pills">
                      <li className={this.state.activeType === 'All' ? 'active' : ''}>
                        <a onClick={() => this.handleHeader('All')}>All</a>
                      </li>
                      <li className={this.state.activeType === 'FUNDS IN' ? 'active' : ''}>
                        <a onClick={() => this.handleHeader('FUNDS IN')}>Deposits</a>
                      </li>
                      <li className={this.state.activeType === 'FUNDS OUT' ? 'active' : ''}>
                        <a onClick={() => this.handleHeader('FUNDS OUT')}>Withdrawals</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="table-title">
                <div className="row">
                  <div className="col-lg-4 col-md-4 col-sm-4 no-padding">
                    <div className="col-lg-5 col-md-5 col-sm-5 outer">
                      <div className="inner text-center">Transaction Date</div>
                    </div>
                    <div className="col-lg-7 col-md-7 col-sm-7 outer">
                      <div className="inner">Transaction Details</div>
                    </div>
                  </div>
                  <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">Funds Out</div>
                  </div>
                  <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">Funds In</div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 no-padding">
                    <div className="col-lg-3 col-md-3 col-sm-3 outer">
                      <div className="inner text-center">Current Balance</div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-3 outer">
                      <div className="inner text-center">Usable Budget</div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 outer">
                      <div className="inner">Comments</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <AccountList loadingUpload={this.state.loadingUpload} transactionList={this.state.transactionList} searching={this.state.searching} searchList={this.state.searchList}/>
              {/* <span>{this.state.error}</span> */}
            
        </div>
        </div>
      </div >  
      <Modal
          isOpen={this.state.openTransaction}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          className={{
            base: 'custom_Modal',
            afterOpen: this.state.createSuccess ? 'custom_after_open_create_transition_sucess' : 'custom_after_open_create_transition',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Example Modal"
          >                 
            {!this.state.createSuccess && <div className="container-fluid">
              <form>
                <div className="row top-row-fix">
                  <div className="inputrow col-lg-4 col-md-4 col-sm-6 col-xs-12 top-left-fix">    
                        <Field
                        name="type"
                        label="Transaction Type"
                        component={renderDropdownList}
                        data={this.state.transactionType} 
                        className="dropdown dropdown-transaction"/>                                             
                  </div>

                  <div className="inputrow col-lg-4 col-md-4 col-sm-6 col-xs-12 top-middle-fix">                         
                    <Field name="detail" type="text"
                              label="Transaction Detail"
                              component={renderField}
                        />
                  </div>
                  <div className="inputrow col-lg-4 col-md-4 col-sm-6 col-xs-12 top-right-fix">
                    <InputMask mask="$9999999" maskChar={null} placeholder="Total Amount" onChange={this.onChangeTotalBudget} />
                    {this.state.errorTotalBudget && <span className="redux-form-error-message">{this.state.errorTotalBudget}</span>}
                  </div>
                </div>

                <div className="row area-field">
                  <div className="inputrow col-lg-8 col-md-8 col-sm-12 col-xs-12">
                    <Field name="note" type="text"
                        label="Notes"
                        className="descriptionField"
                        component={renderTextArea}
                      />
                  </div>
                  <div className="inputrow col-lg-4 col-md-4 col-sm-12 col-xs-12">
                    <button type="button" className="btnAdd-fix" style={disableButtonStyle} onClick={(e) => this.handleCreate(e)}>Add</button>
                  </div>
                </div>
                <div className="row">
                  <div className="inputrow col-lg-12 col-md-12 col-sm-12 col-xs-12" style={{height: '20px'}}>
                  <span className="text-danger">{this.state.error}</span>
                  </div>
                </div>   
              </form>   
            </div>
            }
            {this.state.createSuccess && <div className="container-fluid">
            <form className='form-confirm'>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12 icon">
                <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12">
                <span className='title-confirm-popup'>Transaction Created</span>
              </div>
            </div>
            </form>
          </div>}
        </Modal> 
    </div>
    );
  }
}
Accounts = reduxForm({
  form: 'transactionForm',
  validate
})(Accounts);
