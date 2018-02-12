import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Scrollbars } from 'react-custom-scrollbars';
import ReactLoading from 'react-loading';
export default class AccountList extends Component {
    constructor(props){
        super(props);
        this.state = {
          listTransaction: []          
        }
      }    
      static propTypes = { admin: PropTypes.object,
        getTransaction: PropTypes.func,    
        router: React.PropTypes.object
      };
    renderTransactionItem = (data, index) => {
        return(
        <div className="table-details" key={`itemAccountList${data.id}`}>
        <div className="row">
            <div className="col-lg-4 col-md-4 col-sm-4 no-padding">
                <div className="col-lg-5 col-md-5 col-sm-5 outer">
                    <div className="inner overload-text text-center">{moment(data.transactionDate).format("MM-DD-YYYY")}</div>
                </div>
                <div className="col-lg-7 col-md-7 col-sm-7 outer">
                    <div className="inner overload-text">{data.transactionDetail}</div>
                </div>
            </div>
            {
                data.transactionType == "FUNDS OUT" && 
            <div>
                <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">${data.transactionAmount}</div>
                </div>
                <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">-</div>
                </div>
            </div>
            }
            {
                data.transactionType == "FUNDS IN" && 
            <div>
                <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">-</div>
                </div>
                <div className="col-lg-1 col-md-1 col-sm-1 outer">
                    <div className="inner text-center">${data.transactionAmount}</div>
                </div>
            </div>
            }
            <div className="col-lg-6 col-md-6 col-sm-6 no-padding">               
                <div className="col-lg-3 col-md-3 col-sm-3 outer">
                    <div className="inner text-center">${data.balance}</div>
                </div>
               
                <div className="col-lg-3 col-md-3 col-sm-3 outer">
                    <div className="inner text-center"> {data.usableBudget && ('$'+data.usableBudget)}</div>
                </div>
                
                <div className="col-lg-6 col-md-6 col-sm-6 outer comment">
                    <div className="inner overload-text">{data.transactionComment}</div>
                </div>
            </div>
        </div>
    </div>
        )
    }
    render() {
        const { searchList, searching, transactionList } = this.props; 
        return (
            <div>           
            <Scrollbars autoHide style={{ height: window.innerHeight - 160 }} renderThumbVertical={({ style, ...props }) =>
            <div {...props} style={{ ...style, backgroundColor: '#151925', overflowX: 'hidden', right: '-2px' }}/>
            }>            
                {searching && (searchList && searchList.length > 0) ? searchList.map(this.renderTransactionItem, this, ''): ''}
                {searching && (searchList && searchList.length == 0) ? <span className="no-data">No transaction found.</span>: ''}
                {!searching && (transactionList && transactionList.length > 0) ? transactionList.map(this.renderTransactionItem, this, ''): ''}
                {!searching && (transactionList && transactionList.length === 0) ? <span className="no-data">No data</span>: '' }                  
                </Scrollbars>
                {this.props.loadingUpload && 
                <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
              }            
            </div>
            
        )
    }
}


