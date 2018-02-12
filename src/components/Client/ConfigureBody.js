import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as ClientActions from '../../redux/actions/client';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import ConfigureEditor from './ConfigureEditor';
import Modal from 'react-modal';
import moment from 'moment';
import 'react-widgets/lib/scss/react-widgets.scss';
import TinyMCE from 'react-tinymce';
import { Checkbox, CheckboxGroup } from 'react-checkbox-group';
import dataMap from '../../utils/config';
import {getCurrentUser} from '../../utils/common';
import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';
import { hostname, s3URL} from '../../config';
import { Scrollbars } from 'react-custom-scrollbars';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.scss';
import { resetIdCounter } from 'react-tabs';
import {Toggle, Group} from 'react-controls';
import SwitchButton from 'lyef-switch-button';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import { validateTemplateForm } from './../../utils/formValidation';
import ReactLoading from 'react-loading';
const validate = values => {
    return validateTemplateForm(values, false);
};

const selector = formValueSelector('createTemplate');
@connect(
    state => ({
      client: state.client,
      fields: selector(state,'title', 'description')
    }),
    ({
        changeFieldValue: (field, value) => change('createTemplate', field, value),
        getConfigureMail: (token, clientId) => ClientActions.getConfigureMail(token, clientId),
        changeStatus: (token, clientId, templateId, status) => ClientActions.changeStatus(token, clientId, templateId, status),
        createTemplate: (token, data) => ClientActions.createTemplate(token, data),
        deleteTemplate: (token, tempId, clientId) => ClientActions.deleteTemplate(token, tempId, clientId) 
    }
    )
  )
export default class ConfigureBody extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openAddCreator: false,
            receiptContent: '',
            rewardContent: '',
            onestarContent: '',
            configureMail: [],
            editMailConfig: false,
            editStatus: false,
            description:'',
            titleMail: '',
            typeMail: '',
            contentMail: '',
            showCreate: true       
        }    
    }
    static propTypes = {
        client: PropTypes.object,
        getConfigureMail: PropTypes.func,
    } 

    componentWillMount() {
        const { clientId, token } = getCurrentUser();
        if (token && clientId) {
            this.props.getConfigureMail(token, clientId);
            this.setState({loadingUpload: true});
        }
    }
    componentWillReceiveProps(nextProps) {
        const { client, typeMail } = this.props;
        const { client: nextClient } = nextProps;
        if((client.configureMailStatus !== nextClient.configureMailStatus && nextClient.configureMailStatus == 2) 
            || (client.updateConfigureStatus !== nextClient.updateConfigureStatus && nextClient.updateConfigureStatus == 2) ){
            const configureMail = nextClient.configureMail;          
            if(configureMail){
                this.setState({configureMail});         
            }
        }
        client.loadingIcon !== nextClient.loadingIcon && nextClient.loadingIcon == 1 ? this.setState({loadingUpload: true}) :'';
        client.loadingIcon !== nextClient.loadingIcon && nextClient.loadingIcon != 1 ? this.setState({loadingUpload: false}) :'';
        if((client.createStatus !== nextClient.createStatus && nextClient.createStatus == 2)){       
        const createdInfo = nextClient.createdInfo;          
            if(createdInfo){
                this.setState({mode: 'create'},this.showModal(createdInfo) );                               
            }
        }
        if((client.deleteStatus !== nextClient.deleteStatus && nextClient.deleteStatus == 2)){       
            const deleteInfo = nextClient.deleteInfo;          
                if(deleteInfo){
                    this.setState({mode: 'delete'}, this.showModal(deleteInfo));                    
                }
            }
        if((client.changeStatus !== nextClient.changeStatus && nextClient.changeStatus == 2)){       
            const changedInfo = nextClient.changedInfo;          
                if(changedInfo){
                  this.setState({configureMail: changedInfo});             
                }
            }
        if(nextClient.createError){
            this.setState({error: nextClient.createError});
        }
        if(nextClient.deleteError){
            this.setState({error: nextClient.deleteError});
        }
    }
    showModal = (data) => {        
        this.props.reset();
        this.setState({description: '', error: '', configureMail: data, showModal: true});
        this.props.changeFieldValue('description','');    
        setTimeout(() => {
            this.setState({ showModal: false});
        }, 2000);
    }
    closeModal = () => {
        this.setState({ showModal: false, error: ''});
    }
   
    renderItemMail = (data, index) => {     
        return (
            <div className="row item-mail" key={data.id}>
                <div className="info">
                    <span>{data.title || data.type}</span>
                    <p>{data.description || `No description`}</p>
                </div>
                <div className="status">
                    <SwitchButton
                        id={'my-button' + data.id}
                        isChecked={this.state.configureMail[index].status == 'On' ? true : false}
                        action={() => this.editMailStatus(data.id, data.status)}
                    />
                </div>
                <div className="action edit">
                    <button onClick={() => this.editMailConfig(data)}>Edit</button>                   
                </div>
                <div className="action delete">
                    <button onClick={() => this.handleDelete(data)}>Delete</button> 
                </div>
            </div>   
        )
    }
    editMailStatus = (id, status) => {
        const { clientId, token } = getCurrentUser();
        const statusChange = status == 'On' ? 'Off' : 'On';
        this.props.changeStatus(token, clientId, id, statusChange);
    }
    editMailConfig = (data) => {
        this.setState({
            editMailConfig: true, 
            editStatus: true,
            titleMail: data.title || data.type,
            typeMail: data.type,
            id: data.id, 
            contentMail: data.body
         });
    }
    handleDelete = (data) => {
        const { token, clientId } = getCurrentUser();
        this.props.deleteTemplate(token, data.id, clientId);
    }
    closeModal = () => {
        this.setState({editMailConfig: false, editStatus: false, titleMail: '', typeMail: '', contentMail: ''});
    }
    // showCreate = () => {
    //     this.props.reset();
    //     this.setState({error: null})
    //     this.setState(prevState => ({
    //         showCreate: !this.state.showCreate,            
    //     }));
    // }
    reset = (e)=>{
        e.preventDefault();
        this.props.reset();
        this.setState({error: null});        
    }
    handleSave = (e)=>{
        e.preventDefault();
        const { clientId, token } = getCurrentUser();
        const data = { title: this.props.fields.title, description: this.props.fields.description, clientId}
        this.props.createTemplate(token, data);
    }
  render() { 
    const {  valid, pristine } = this.props;
      const disableBtnStyle =  { cursor: 'pointer' };
      if (!valid || pristine) {
        disableBtnStyle.opacity = 0.5;
        disableBtnStyle.pointerEvents = 'none';
    }     
    return (
        <div id="page-wrapper">        
            <div className="configure-client">
                <div className="header-config">
                    <span>E-mail Templates</span>
                </div>
                {this.state.loadingUpload && 
                    <ReactLoading type={'spinningBubbles'} color={'#d25408'} delay={0} height={64} width={64} className="spinner-loading" />
                    } 
                  <Scrollbars style={{ height: window.innerHeight - 100 + 'px' }} renderThumbVertical={({ style, ...props }) =>
                        <div {...props} style={{ ...style, backgroundColor: '#fff', overflowX: 'hidden' }}/>
                        }>
                <div className="body-config" style={{ height: 'auto'}}>   
                    <div className="list-email">                
                        {this.state.configureMail && this.state.configureMail.length > 0 ? this.state.configureMail.map(this.renderItemMail, this, ''):
                    <div>
                        No template avaiable.
                    </div>
                    }                        
                    </div>                                          
                    <div className="create-email">
                        <div className="row">
                            <button className="button-create">+ Create Template</button>
                        </div>
                        <form>
                            <div className="template-content-wrapper">
                                <div className="row title">
                                <Field name="title" type="text"
                                    label="Enter title"
                                    component={renderField}
                                />
                                </div>
                                <div className="row content">
                                <Field name="description" type="text"
                                    label="Enter description"
                                    component={renderTextArea}
                                    defaultValue={this.props.fields.description || ''}
                                    />
                                </div>
                                <div className="row action" style={{height:'30px'}}>
                                    <button className="btn-mail" onClick={e => this.reset(e)}>Cancel</button>
                                    <button className="btn-mail" style={disableBtnStyle} onClick={e => this.handleSave(e)}>Save</button>
                                </div>
                                <div className="row error" style={{color: '#fa2400', marginTop:'35px',whiteSpace:'nowrap'}}>                               
                                    {this.state.error}                               
                                </div>
                            </div>
                        </form>
                    </div>     
                </div>
                </Scrollbars>   
            </div>
            <Modal
                isOpen={this.state.editMailConfig}
                onRequestClose={this.closeModal}
                shouldCloseOnOverlayClick={false}
                className={{
                    base: 'custom_Modal',
                    afterOpen: this.state.editStatus ? 'edit-configure-mail': 'edit-configure-mail-success',
                    beforeClose: 'custom_before-close'
                }}
                overlayClassName={{
                    base: 'custom_Overlay',
                    afterOpen: 'customOverlay_after-open',
                    beforeClose: 'customOverlay_before-close'
                }}
                contentLabel="Example Modal"
                parentSelector={() => document.body}
                >
            <div className="container-fluid">
                <ConfigureEditor titleMail={this.state.titleMail} id ={this.state.id} typeMail={this.state.typeMail} contentMail={this.state.contentMail} closeModal={this.closeModal} />
            </div>
        </Modal>   
        <Modal
            isOpen={this.state.showModal}
            className={{
                base: 'custom_Modal',
                afterOpen: 'custom_Modal_confirmRemove',
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
                        <span className='title-confirm-popup'>{this.state.mode =='create' ?'Template created.' : 'Template deleted.'}</span>
                    </div>
                    </div>
                </form> 
            </div>        
        </Modal>
        </div>
    );
  }
}
ConfigureBody = reduxForm({
    form: 'createTemplate',
    validate
})(ConfigureBody);