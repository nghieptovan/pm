import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import * as ClientActions from '../../redux/actions/client';
import NavHeaderClient from '../NavHeader/NavHeaderClient';
import SidebarClient from '../Sidebar/SidebarClient';
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
import ReactLoading from 'react-loading';
@connect(
    state => ({
      client: state.client
    }),
    ({
        updateConfigureMail: (token, clientId, type, data) => ClientActions.updateConfigureMail(token, clientId, type, data),
        getConfigureMail: (token, clientId) => ClientActions.getConfigureMail(token, clientId),
    }
    )
  )
  
export default class ConfigureEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
        bodyEmail: null,
        currentBody: '',
        successSend: false,
        error: '',
        loadingSend: false,
        isEdit: false
        }
    }
    static propTypes = {
        client: PropTypes.object,
        updateConfigureMail: PropTypes.func,
        getConfigureMail: PropTypes.func,
        closeModal: PropTypes.func,
    }     
    componentWillMount() {
        const { clientId, token } = getCurrentUser();
    }
    componentWillReceiveProps(nextProps) {
        const { client, typeMail } = this.props;
        const { client: nextClient } = nextProps; 
        if(client.updateConfigureStatus !== nextClient.updateConfigureStatus && nextClient.updateConfigureStatus == 1){
            this.setState({loadingSend: true});
        }
        if(client.updateConfigureStatus !== nextClient.updateConfigureStatus && nextClient.updateConfigureStatus == 2){
            this.setState({successSend: true, loadingSend: false});
            setTimeout(() => {
                this.closeModal();
            }, 2000);
        }
        if(client.updateConfigureStatus !== nextClient.updateConfigureStatus && nextClient.updateConfigureStatus == 3){
            this.setState({loadingSend: false, error: nextClient.updateConfigureError });
        }
        
    }
    closeModal = () => {
       this.setState({successSend: false}); 
       this.props.closeModal();
    }
    handleEditorChange = () => {       
       !this.state.isEdit ? this.setState({isEdit: true }) :'';       
    }  
    updateConfigureMail = () => {
        const { clientId, token } = getCurrentUser();     
        const { title, typeMail, id } = this.props;            
        let body = tinymce.activeEditor ? tinymce.activeEditor.getContent():'';
        if (this.state.isEdit) {          
            if( body && body.length >0){                  
                    const dataInput = {
                        content: body,
                        id
                    }
                    this.props.updateConfigureMail(token, clientId, typeMail, dataInput);
                    this.setState({error: ''})
                } else{
                    this.setState({error: 'Content should not be empty.'});
                }
        }else {
            const dataInput = {
                content: this.props.contentMail,
                id
            }
            this.props.updateConfigureMail(token, clientId, typeMail, dataInput);
            this.setState({error: ''})  
        }       
    }
  
  render() {    
    const { titleMail, typeMail, contentMail } = this.props;
    return (
      <div id="container-fluid">            
            <div className="message-block" style={{ height: window.innerHeight - 144 + 'px'}}>
                <div className="title-message">
                    <span>{titleMail}</span><span className="edit-mail">Edit</span>
                    <i className="icon-thick-delete-icon" onClick={this.closeModal}></i>
                </div>
                <div className="body-message">
                {titleMail &&
                <TinyMCE
                content={contentMail}
                config={{
                    selector: 'textarea',
                    plugins: 'image code',
                    toolbar: 'undo redo | image code',
                    templates: [{
                        title: 'Test template 1',
                        content: 'Test 1'
                      }, {
                        title: 'Test template 2',
                        content: 'Test 2'
                      }],
                    image_title: true, 
                    // enable automatic uploads of images represented by blob or data URIs
                    automatic_uploads: true,
                    // URL of our upload handler (for more details check: https://www.tinymce.com/docs/configure/file-image-upload/#images_upload_url)
                    // images_upload_url: 'postAcceptor.php',
                    // here we add custom filepicker only to Image dialog
                    file_picker_types: 'image', 
                    // and here's our custom image picker
                    file_picker_callback: function(cb, value, meta) {
                    let input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    
                    // Note: In modern browsers input[type="file"] is functional without 
                    // even adding it to the DOM, but that might not be the case in some older
                    // or quirky browsers like IE, so you might want to add it to the DOM
                    // just in case, and visually hide it. And do not forget do remove it
                    // once you do not need it anymore.
                
                    input.onchange = function() {
                        var file = this.files[0];
                        var reader = new FileReader();
                        reader.onload = function () {
                            // Note: Now we need to register the blob in TinyMCEs image blob
                            // registry. In the next release this part hopefully won't be
                            // necessary, as we are looking to handle it internally.
                            var id = 'blobid' + (new Date()).getTime();
                            var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
                            var base64 = reader.result.split(',')[1];
                            var blobInfo = blobCache.create(id, file, base64);                            
                            blobCache.add(blobInfo);
                            var url = hostname+"/api/content/mail/upload";
                            var data = {};
                            data.content = base64;
                            var json = JSON.stringify(data);
                            new Promise((resolve, reject) => {
                                const xhr = new XMLHttpRequest();
                                xhr.open("POST", url, true);
                                xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
                                xhr.onload = () => {
                                    var result = JSON.parse(xhr.response);
                                    cb(s3URL+result.result, { title: file.name });                                                   
                                    resolve(xhr.responseText);
                                }
                                xhr.onerror = () => {
                                    cb(blobInfo.blobUri(), { title: file.name });
                                    reject(xhr.statusText);
                                } 
                                xhr.send(json);
                            });                             

                        // call the callback and populate the Title field with the file name
                        
                        };
                        reader.readAsDataURL(file);
                    };
                    
                    input.click();
                    },
                    height: window.innerHeight - 274                     
                }}
                    onChange={this.handleEditorChange}
                />
                }
                
                </div>
                <div className="footer-message">
                    <span className="error-msg pull-left">{this.state.error}</span>
                    <span className="send-button pull-right" onClick={this.updateConfigureMail}>Save</span>
                </div>
            </div>
            <Modal
                isOpen={this.state.successSend}
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
                            <span className='title-confirm-popup'>Update sucessful.</span>
                        </div>
                        </div>
                    </form> 
                </div>        
            </Modal>       
      </div>
    );
  }
}

