import React, { Component, PropTypes } from 'react';
import './Brand.scss';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import * as AdminActions from '../../redux/actions/admin';
import Sidebar from '../Sidebar/Sidebar';
import NavHeader from '../NavHeader/NavHeader';
import { Link } from 'react-router';
import { Scrollbars } from 'react-custom-scrollbars';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import ReactLoading from 'react-loading';
@connect(
  state => ({
    admin: state.admin
  }),
  ({ getActiveClients: token => AdminActions.getActiveClients(token) })
)
export default class BrandBody extends Component {
  constructor(props){
    super(props);
    this.state = {
      listClient: [],     
      error: ''     
    }
  }
  static propTypes = { admin: PropTypes.object,
    getActiveClients: PropTypes.func,    
    router: React.PropTypes.object
  };

  componentDidMount(){
    const { token } = getCurrentUser();
    this.props.getActiveClients(token);
    this.setState({loadingUpload: true})
  }
  componentWillReceiveProps(nextProps) {
    const { admin } = this.props;
    const { admin: nextAdmin } = nextProps;    
    admin.getClient !== nextAdmin.getClient && nextAdmin.clientList ? this.setState({listClient: nextAdmin.clientList})
      : '';                                                                                                          
    admin.loadingIcon !== nextAdmin.loadingIcon && nextAdmin.loadingIcon == 1 ? this.setState({loadingUpload: true}) : '';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    admin.loadingIcon !== nextAdmin.loadingIcon && nextAdmin.loadingIcon != 1 ? this.setState({loadingUpload: false}) : '';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  }
  
  renderBrand = (data, index) => {
    let name =data.brand_name.replace(/\s/g,'');
    return (
      <div className="col-lg-2 col-md-3 col-sm-4 col-xs-6 item-report" key={`dataBrand${data.id}`}>
      {this.props.type =='accounts' ?
        <Link to={`/admin/report/accounts/${data.id}/${name}`}>
          <button type="button" className="button-fix">{data.brand_name}</button>
        </Link>   :
        <Link to={`/admin/report/rewards/${data.id}`}>
          <button type="button" className="button-fix">{data.brand_name}</button>
        </Link> 
      }       
    </div>      
    )
  }
  render() {
    const { searchList, searching } = this.props;     
    return (
      <div className="container-fluid report-page-fix">
      <Scrollbars autoHide style={{ height: window.innerHeight - 100 }} renderThumbVertical={({ style, ...props }) =>
                  <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                  }>
        <div className="row challenge-rows">

          {searching && (searchList && searchList.length > 0) ? searchList.map(this.renderBrand, this, ''): ''}
          {searching && !this.state.loadingUpload && (searchList && searchList.length == 0) ? <span className="no-data">No client found.</span>: ''}

          {!searching && (this.state.listClient && this.state.listClient.length > 0) ? this.state.listClient.map(data => this.renderBrand(data)) : ''}
          {!searching && !this.state.loadingUpload && (this.state.listClient && this.state.listClient.length === 0) ? <span className="no-data">No data</span>: '' }
        </div>
      </Scrollbars>    
      {this.state.loadingUpload && 
                  <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                }
      </div>
    );
  }
}
