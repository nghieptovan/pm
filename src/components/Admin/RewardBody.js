import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import '../Client/RewardsBody.scss';
import dataMap from '../../utils/config';
import ReactStars from 'react-stars';
import FilterUpload from '../Client/FilterUpload';
import * as ClientActions from '../../redux/actions/client';
import { connect } from 'react-redux';
import moment from 'moment';
import classNames from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import Modal from 'react-modal';
import ReactLoading from 'react-loading';
@connect(
    state => ({
      client: state.client,
      fileclients: state.fileclients
    }),
    ({ contentRewardedList: (id, token) => ClientActions.contentRewardedList(id, token) })
  )
export default class RewardBody extends Component {
  constructor(props) {
    super(props);
    this.state={
        rewardList: null,
        activeType: 'All',
        sortAlphaDirection: 'asc',
        sortDateDirection: 'asc',
        sortUnPaidDirection: 'asc',
        sortPaidDirection: 'desc',
        importSuccess: false,
        importError: '',
        importErrorStatus: false, 
        input: null,
        filtered: false,
        filterList: []
    };    
  }
    componentWillReceiveProps(nextProps){
      const { client, fileclients } = this.props;
      const { client: nextClient, fileclients: nextfileclients} = nextProps;
      if(fileclients.exportStatus !== nextfileclients.exportStatus && nextfileclients.exportStatus == 2 && nextfileclients.exportResult ){
        switch (nextfileclients.exportType || '') {
            case 'pdf':
            case 'xlsx':
            case 'csv': {
                //convert to save file from base64, code copy
                const byteCharacters = atob(nextfileclients.exportResult);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob1 = new Blob([byteArray], {type: "application/octet-stream"});
                const fileName1 = `EnTribe_Reward_List ${moment().format('MMDDYY hhmm')}.xlsx`;
                this.saveAs(blob1, fileName1)
                break;
            }      
            default: { 
              break;              
           } 
        }
      }
      if(fileclients.importStatus !== nextfileclients.importStatus && nextfileclients.importStatus == 2){
        this.setState({ importSuccess: true, rewardList: nextfileclients.importResult});
        setTimeout(() => {
          this.setState({ importSuccess: false });
        }, 1000);      
      }
      if(fileclients.importStatus !== nextfileclients.importStatus && nextfileclients.importStatus == 3){
        this.setState({ importErrorStatus: true, importError: nextfileclients.importError });
      }
      client.getList !== nextClient.getList && nextClient.rewardList ? this.setState({ rewardList: nextClient.rewardList, searchList: nextClient.rewardList, listFlag: nextClient.rewardList, listRating: nextClient.rewardList, listReward: nextClient.rewardList, originalList: nextClient.rewardList}) 
      : '';    
      client.loadingIcon !== nextClient.loadingIcon && nextClient.loadingIcon == 1? this.setState({loadingUpload: true}) : '';
      client.loadingIcon !== nextClient.loadingIcon && nextClient.loadingIcon != 1? this.setState({loadingUpload: false}) : '';
      fileclients.loadingIcon !== nextfileclients.loadingIcon && nextfileclients.loadingIcon == 1? this.setState({loadingUpload: true}) : '';
      fileclients.loadingIcon !== nextfileclients.loadingIcon && nextfileclients.loadingIcon != 1? this.setState({loadingUpload: false}) : '';
      this.props.searchReward !== nextProps.searchReward ?this.searchReward(nextProps.searchReward):'';
    }
  componentDidMount() {
      const {token } = getCurrentUser();
      const clientId = this.props.clientId;
      this.props.contentRewardedList(clientId, token);
      this.setState({loadingUpload: true})
  }
 handleReImport = (e) => {
  e.preventDefault();
  this.props.handleReImport();
  this.setState({ importErrorStatus: false });
}
closeModal = () => {
  this.setState({ importErrorStatus: false });
}
  saveAs = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;
    document.body.appendChild(anchorElem);
    anchorElem.click();
    document.body.removeChild(anchorElem);
    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
  }
  renderRewarded = (data, index) => {
      return(
        <tr key={`rewards${index}`} style={{width: 'calc(100% + 7px)'}}>          
            <td className="txt-oflo col-client-20 text-left">{data.creatorName}</td>
            <td className="col-client-20 text-left">{data.challenge}</td>    
            <td className="col-client-10 text-left">{data.rewardType}</td>            
            <td className="col-client-10">{data.rewardLevel}</td>
            <td className="col-client-15 text-left"><span>{data.reference || 'No Reference'}</span></td>
            <td className="col-client-10 text-left">{data.couponCode}</td>
            <td className="col-client-15"><span className={classNames('btn-paid', { 'btn-success btn-unpaid': data.paymentStatus == 'Paid', 'btn-danger': data.paymentStatus == 'Unpaid' })}>{data.paymentStatus}</span></td>
        </tr>    
      )
  }
  searchReward= (input) => {
    const { originalList } = this.state;  
    let searching = false;
    if(input && input.length > 0){
      searching = true;
      let resultCreatorName = originalList.filter(data => data.creatorName.toLowerCase().includes(input.toLowerCase()));
      let resultChallenge = originalList.filter(data => data.challenge.toLowerCase().includes(input.toLowerCase()));  
      let resultType = originalList.filter(data => data.rewardType.toLowerCase().includes(input.toLowerCase()));  
      let resultRewardLevel = originalList.filter(data => {return data.rewardLevel ? data.rewardLevel.includes(input) : false});
      let resultReference = originalList.filter(data => {return data.reference ? data.reference.toLowerCase().includes(input.toLowerCase()) : false});
      let resultCouponCode = originalList.filter(data => {return data.couponCode ? data.couponCode.toLowerCase().includes(input.toLowerCase()) : false});
      let resultPaymentStatus = originalList.filter(data => data.paymentStatus.toLowerCase() === input.toLowerCase());      
      let searchList = _.union(resultCreatorName, resultChallenge, resultType, resultRewardLevel, resultReference, resultCouponCode, resultPaymentStatus);
      this.setState({searchList, input, searching }, this.listHandler);  
    }else{
        this.setState({searchList: originalList, input, searching}, this.listHandler);
    }
  }
  ratingChanged = (value) =>{
    const list = this.state.originalList ;
    let result = [];
    let ratingFiltered = false;
    if (value.length == 0) {
      result = list;      
    } else {   
      ratingFiltered = true;  
      let temp=[];
      value.map((data) => {
        temp = list.filter((obj) => obj.content.star == data);
        result = _.union(result, temp);
      })  
    }
    this.setState({ listRating: result, ratingFiltered},this.listHandler);   
  }
  flagChanged = (value) =>{
    const list = this.state.originalList ;
    let result = [];
    let flagFiltered = false;
    if (value.length == 0) {
      result = list;     
    } else {       
      flagFiltered = true;      
        let temp=[];
        value.map((data) => {
          if(data !== 'NO FLAG'){
            temp = list.filter((obj) => { return obj.content.flagged ? obj.content.flagged.includes(data) : false});         
          } else {
            temp = list.filter((obj) => { return obj.content.flagged ? obj.content.flagged.length == 0 : true })
          }
          result = _.union(result, temp);        
        })           
      result = _.uniq(result);   
    }
    this.setState({ listFlag: result, flagFiltered},this.listHandler);   
  }
  rewardChanged = (value) =>{
    const list = this.state.originalList ;
    let result = [];
    let rewardFiltered = false;
    if (value.length == 0) {
      result = list;     
    } else {     
      rewardFiltered = true; 
        let temp=[];
        value.map((data) => {
          if(data !== 'OTHER'){
            temp = list.filter((obj) => {
                return obj.rewardLevel && obj.rewardLevel === data ? true : false;
            });         
          } else {
            temp = list.filter((obj) => {
              if(obj.rewardLevel){
                if(obj.rewardLevel != '$10' && obj.rewardLevel != '$20' && obj.rewardLevel != '$50' && obj.rewardLevel != '$100'  && obj.rewardLevel != '$500'){
                  return true;
                }             
              } 
              if(obj.rewardType == 'Coupon'){
                return true;
              }
            })
          }
          result = _.union(result, temp);
        })           
      result = _.uniq(result);      
    }
    this.setState({ listReward: result, rewardFiltered},this.listHandler );   
  }
  sortAlpha =() => {
    const { rewardList,sortAlphaDirection } = this.state;
    rewardList.sort( (a, b) => a.challenge.toLowerCase().localeCompare(b.challenge.toLowerCase()));       
    this.setState({rewardList:  sortAlphaDirection == 'asc' ? rewardList : rewardList.reverse(),
    sortAlphaDirection: sortAlphaDirection == 'asc' ? 'desc' : 'asc'});        
  }
  // sortDate = () => {
  //   const { rewardList,sortDateDirection } = this.state;    
  //   rewardList.sort( (a, b) => a.uploadedDate - b.uploadedDate);       
  //   this.setState({rewardList:  sortDateDirection == 'asc' ? rewardList : rewardList.reverse(),
  //   sortDateDirection: sortDateDirection == 'asc' ? 'desc' : 'asc'});        
  // } 

  sortPaid = () => {
    const { rewardList } = this.state;
    let temp = rewardList.filter( (data) => data.paymentStatus.toLowerCase() == 'paid');  
    let remaining = _.difference(rewardList,temp);      
    temp = temp.sort( (a, b) => b.rewardId - a.rewardId); 
    remaining = remaining.sort( (a, b) => b.rewardId - a.rewardId); 
    let finalList = _.concat(temp,remaining);     
    this.setState({ rewardList: finalList });        
  }

  sortUnPaid = () => {
    const { rewardList } = this.state;
    let temp = rewardList.filter( (data) => data.paymentStatus.toLowerCase() == 'unpaid');  
    let remaining = _.difference(rewardList,temp);      
    temp = temp.sort( (a, b) => b.rewardId - a.rewardId); 
    remaining = remaining.sort( (a, b) => b.rewardId - a.rewardId); 
    let finalList = _.concat(temp,remaining);  
    this.setState({ rewardList: finalList });        
  }
  listHandler = () => {
    let result = [];   
    let filterList = [];
    const { searchList, originalList } = this.state;       
    result = _.intersection(this.state.listRating, this.state.listReward, this.state.listFlag);  
    result = _.uniq(result); 
    filterList = _.cloneDeep(result); 
    result = _.intersection(result, searchList);      
    this.setState({rewardList: result, filterList: filterList});        
  }
  setError = error =>{
    this.setState({importErrorStatus: true, importError: error});
    setTimeout(() => {
      this.setState({ importErrorStatus: false });
    }, 1000);
  }
  render(){     
    const { searchList, searching } = this.props;  
    return (  
      <div id="page-wrapper">
        <Scrollbars autoHide style={{ height: window.innerHeight - 60, overflowX:'hidden' }} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff' }}/>
                  }>
        <div className="rewards-body">
          <div className="container-fluid">
            <div className="row">
              <div className="content-rewards" style={{ height: window.innerHeight - 70 + 'px'}}>
                <div className="col-lg-9 col-md-9 col-sm-12 col-xs-12 rewards-list" style={{ height: window.innerHeight - 70 + 'px'}}>
                <div className="table-responsive">
                                <table className="table table-reward">
                                    <thead>
                                        <tr style={{width: '100%'}}>
                                            <th className="col-client-20">Creator Name</th>
                                            <th className="col-client-20">Challenge</th>  
                                            <th className="col-client-10">Reward Type</th>                                            
                                            <th className="col-client-10 text-center">Cash</th>
                                            <th className="col-client-15">Reference</th>
                                            <th className="col-client-10">Coupon</th>
                                            <th className="col-client-15 text-center">Payment Status</th>
                                        </tr>
                                    </thead>                                    
                                    {!this.state.loadingUpload && 
                                    <tbody style={{height: window.innerHeight - 140 + 'px', overflowX: 'hidden'}}>
                                      {!searching && (this.state.rewardList && this.state.rewardList.length > 0) ? this.state.rewardList.map(this.renderRewarded, this, ''): <tr><td>No Upload Rewarded.</td></tr>}
                                    </tbody>
                                   }                                      
                                </table>
                                {this.state.loadingUpload && 
                                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                                 }
                            </div>              
                </div>
                <div className="col-lg-3 col-md-3 col-sm-12 col-xs-12 reward-filter">
                  <FilterUpload showPaid={true} sortAlpha={this.sortAlpha} sortDate={this.sortDate} sortPaid={this.sortPaid} sortUnPaid={this.sortUnPaid}
                  activeType={this.state.activeType} 
                  ratingChanged={this.ratingChanged} 
                  flagChanged={this.flagChanged} 
                  rewardChanged={this.rewardChanged}/>
                </div> 
              </div>               
            </div>
          </div>                
        </div>
        </Scrollbars>
        <Modal
          isOpen={this.state.importSuccess}       
          shouldCloseOnOverlayClick={false}
          onAfterOpen={this.afterOpenModal}
          className={{
            base: 'custom_Modal',
            afterOpen: 'modal_import_reward',
            beforeClose: 'custom_before-close'
          }}
          overlayClassName={{
            base: 'custom_Overlay',
            afterOpen: 'customOverlay_after-open',
            beforeClose: 'customOverlay_before-close'
          }}
          contentLabel="Example Modal"
          >          
            <div className="container-fluid">
              <form className='form-confirm'>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                  <button style={{margin: '10px'}} className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <span className='title-confirm-popup'>Import Success</span>
                </div>
              </div>
              </form>         
            </div>        
        </Modal>
        <Modal
        isOpen={this.state.importErrorStatus}       
        shouldCloseOnOverlayClick={false}
        onAfterOpen={this.afterOpenModal}
        className={{
          base: 'custom_Modal',
          afterOpen: 'modal_import_reward',
          beforeClose: 'custom_before-close'
        }}
        overlayClassName={{
          base: 'custom_Overlay',
          afterOpen: 'customOverlay_after-open',
          beforeClose: 'customOverlay_before-close'
        }}
        contentLabel="Example Modal"
      >          
        <div className="container-fluid">
        <form className='form-confirm'>
        <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12 icon">
            <button style={{marginTop: '15px', marginBottom: '-10px'}} className="btn btn-danger btn-circle btn-lg" type="button"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12">
            <span className='title-confirm-popup'>{this.state.importError}</span>
          </div>
        </div>
        {this.state.importError && this.state.importError.includes("coupon codes") &&
          <div className="row">
            <div className="col-md-6 col-lg-6 col-sm-6" >
              <button className="btn btn-success btn-ok" onClick={this.handleReImport}>OK</button>
            </div>
            <div className="col-md-6 col-lg-6 col-sm-6">
              <button className="btn btn-danger btn-cancel" onClick={this.closeModal}>Cancel</button>
            </div>
          </div>
        }
        {this.state.importError && !this.state.importError.includes("coupon codes") &&
            <div className="row">
              <div className="col-md-12 col-lg-12 col-sm-12" >
                <button className="btn btn-warning btn-ok-2" onClick={this.closeModal}>OK</button>
              </div>            
            </div>
          }
        </form>        
        </div>
      
        </Modal>
      </div> 
                    
      
    )
  }
    
    
  
}