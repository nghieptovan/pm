import React, {Component, PropTypes} from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {connect} from 'react-redux';
import Modal from 'react-modal';
import LoginSocial from '../SocialLogin';
import UploadCreator from '../Creator/Upload';
import ExpireToken from './ExpireToken';
import CreateClient from '../Admin/CreateClient';
import SuccessModal from './SuccessModal';
import AddClientSuccessful from '../Admin/CreateClient';
import EditCient from '../Admin/EditClient';

export default class ModalModule extends Component {
  constructor(props){
    super(props);
    this.state = ({
      classAfterModal: null,
      type: null     
    });
  }  
  static propTypes = {
    closeModal: PropTypes.func,
    closeWithData: PropTypes.func,
  }

  closeModal = () => {
    this.props.closeModal();
  };

  closeWithData = (data) => {
    
    const { classModal } = this.props;
    if(data.newModal){
      data.newModalClass ? this.setState({
        classAfterModal: data.newModalClass,
        type: data.newModalType      
      }) : '';
        setTimeout(() => {       
          this.props.closeModal();
          this.setState({type: null, classAfterModal: null});
      }, 1000);       

    }else{
      data.className ? this.setState({classAfterModal: data.className}) : '';
      setTimeout(() => {       
        this.props.closeModal();
        this.setState({classAfterModal: classModal});
     }, data.timeOut);
    }    
  };
  render() {  
    const { openModal, classModal, dataModal, clientID, comment, typeSuccess } = this.props;
    let type = this.state.type || this.props.type;    
    return (
        <Modal
            isOpen={openModal}       
            shouldCloseOnOverlayClick={true}
            onRequestClose={this.closeModal}
            className={{
                base: 'custom_Modal',
                afterOpen: this.state.classAfterModal || classModal,
                beforeClose: 'custom_before-close'
            }}
            overlayClassName={{
                base: 'custom_Overlay',
                afterOpen: 'customOverlay_after-open',
                beforeClose: 'customOverlay_before-close'
            }}
            contentLabel="Example Modal"
            >
            {type == 'Login' && <LoginSocial/>}
            {type == 'Upload' && <UploadCreator 
            idChallengeSet={dataModal ? dataModal.id : 0} 
            nameChallengeSet={dataModal ? dataModal.name : ''} 
            hashtags={dataModal ? dataModal.hashtags : ''} 
            closeModal={this.closeModal}
            closeWithData={(data) => this.closeWithData(data)}
            />}
            {type == 'ExpireToken' && <ExpireToken/>}
            {type == 'SuccessModal' && <SuccessModal typeSuccess={typeSuccess}/>}
            {type == 'CreateClient' && <CreateClient closeModal={this.closeModal} closeWithData={(data) => this.closeWithData(data)}/>}
            {type == 'EditClient' && <EditCient clientID={clientID} comment={comment}  closeModal={this.closeModal}  closeWithData={(data) => this.closeWithData(data)}/>}
        </Modal> 
    );
  }
}
