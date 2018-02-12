import React, { Component, PropTypes } from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { getCurrentUser, getClientShortName } from '../../utils/common';
import Modal from 'react-modal';
import moment from 'moment';
import { Field, reduxForm, formValueSelector, change } from 'redux-form';
import { validateChallengeForm } from './../../utils/formValidation';
import { renderField, renderTextArea, renderTags, renderDropdownList } from "../ReduxField";
import DatePickerCustom from '../DatePickerCustom/DatePickerCustom';
import * as ContentActions from '../../redux/actions/content';
import Dropzone from 'react-dropzone';
import Multiselect from 'react-widgets/lib/Multiselect'
import 'react-widgets/lib/scss/react-widgets.scss';

const validate = values => {
  return validateChallengeForm(values, false);
};

const selector = formValueSelector('uploadCreator');

@connect(
  state => ({
    challenge: state.challenge,
    content: state.content,
    fields: selector(state, 'challengeSelect')
  }),
  ({
    creatorUpload: (input, token, time) => ContentActions.creatorUpload(input, token, time),
    changeFieldValue: (field, value) => change('uploadCreator', field, value)
  }
  )
)
export default class AddCreator extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      defaultModalStatus: true,
      disableOverlay: false,
      challengeError: '',
      contentError: '',
      imageFileName: null,
      imageContent: '',
      typeContent: '',
      uploadStatus: true
    });
  }
  static propTypes = {
    creatorUpload: PropTypes.func,
    closeModal: PropTypes.func,
    changeChallengeType: PropTypes.func,
    isDashboard: PropTypes.bool,
    createChallenge: PropTypes.func,
    disabled: PropTypes.bool,
    dropup: PropTypes.bool,
    group: PropTypes.bool,
    isOpen: PropTypes.bool,
    tag: PropTypes.string,
    tether: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    toggle: PropTypes.func,
    clickDatePicker: PropTypes.func
  }

  componentWillReceiveProps(nextProps) {
    const { content: nextContent } = nextProps;
    const { content } = this.props;
    if( content.uploaded !== nextContent.uploaded && nextContent.resultUpload){
      this.setState({uploadStatus: false});
      setTimeout(() => {
        this.closeModal();
      }, 2000);
    }else if(content.uploaded !== nextContent.uploaded && !nextContent.resultUpload){
      this.setState({ contentError: nextContent.error })
    }
  }


  closeModal = () => {
    this.props.reset();
    this.props.closeModal();
    this.setState({imageContent: null, imageFileName: null});
  };

  afterOpenModal = () => {
    this.setState({uploadStatus: true});
    this.props.reset();
    const { idChallengeSet, challenge : { listLiveChallenges } } = this.props;        
    this.setState({
      challengeError: '',
      contentError: ''
    });
    if(idChallengeSet !== 0){
      this.props.changeFieldValue('challengeSelect', idChallengeSet)
    }
    
  };

  onDrop = (files, type) => {
    const fileType = files[0].type.split('/')[0];
    if(fileType === 'video' || fileType === 'image'){
      this.setState({ contentError: '' });
      let reader = new FileReader();
      reader.readAsDataURL(files[0]);
      
      reader.onload = () => {
        this.setState({ imageContent: reader.result.split(',')[1], imageFileName: files[0].name, typeContent: fileType })
      };
    }else{
      this.setState({ contentError: 'Please upload video or image.' });
    }
    
  }

  handleUpload = (e) => {
    e.preventDefault();
    const { fields, idChallengeSet } = this.props;

    let idChallenge = 0;
    if(idChallengeSet !== 0){
      idChallenge = idChallengeSet;
    }else{
      fields ? idChallenge = fields.id : '';
    }
    const dataValid = {
      idChallenge: idChallenge,
      imageFileName: this.state.imageFileName
    }

    const isOk = this.checkCondition(dataValid);

    const access_time = moment();

    if(isOk){

      const dataInput = {
        challengeId: idChallenge,
        name: this.state.imageFileName,
        type: this.state.typeContent,
        content: this.state.imageContent
      }
      this.props.creatorUpload(dataInput, getCurrentUser().token, access_time);
      this.setState({ imageFileName: null, typeContent: '', imageContent: '' });
    }
  }

  checkCondition = (data) => {
    let returnData = true;
    let errorStr = 'This field is required!';

    if (!data.idChallenge) {
      returnData = false;
      this.setState({ challengeError: errorStr });
    } else {
      this.setState({ challengeError: '' });
    }

    if (!data.imageFileName) {
      returnData = false;
      this.setState({ contentError: errorStr });
    } else {
      this.setState({ contentError: '' });
    }
    return returnData;
  }

  startTimer = () => {
    this.setState({ timeCountDown: 2000 });
  }
  render() {
    const { valid, pristine, idChallengeSet, nameChallengeSet, challenge : { listLiveChallenges } } = this.props;
    return (
      <div>
        <Modal
          isOpen={this.props.openAddCreator}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          shouldCloseOnOverlayClick={true}
          className={{
            base: 'custom_Modal',
            afterOpen: 'custom_after-open-upload',
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
            {this.state.uploadStatus && <form>
                <div className="row">
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">                  
                  {idChallengeSet === 0 && <Field
                  name="challengeSelect"
                  label="Challenge Name"
                  component={renderDropdownList}
                  data={listLiveChallenges}
                  valueField="id"
                  textField="name" />
                  
                  }
                  {idChallengeSet !== 0 && <Field name="totalBudget" type="text"
                      label={nameChallengeSet}
                      autoFocus={true}
                      component={renderField}
                      readOnly={true}
                    />}
                  <p className="text-danger">{this.state.challengeError}</p> 
                  </div>
                </div>
                <div className="row" style={{height: '140px'}}>
                <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                  <Dropzone onDrop={(files) => this.onDrop(files)} className="inputImage">
                  <div className="upload-area">                  
                    <span className="title">{this.state.imageFileName ? this.state.imageFileName :'Drag and drop to upload media'} </span>
                    <div className="icon-file">
                      <i className="fa fa-arrow-circle-o-up" aria-hidden="true"></i>
                    </div>
                    <div className="choose-file">
                      <span>Choose File</span>
                    </div>               
                  </div>
                  </Dropzone>
                  <p className="text-danger">{this.state.contentError}</p>                   
                </div>
                
                </div>

                <div className="row">
                  <div className="inputrow col-md-12 col-lg-12 col-sm-12 col-xs-12">
                    <span onClick={(e) => this.handleUpload(e)} className="upload pull-right">Upload</span>
                  </div>
                </div>
            </form>}
            {!this.state.uploadStatus &&  <form className='form-confirm'>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12 icon">
                  <button className="btn btn-success btn-circle btn-lg" type="button"><i className="fa fa-thumbs-up" aria-hidden="true"></i></button>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-lg-12 col-sm-12">
                  <span className='title-confirm-popup'>Successfully Uploaded</span>
                </div>
              </div>
            </form>}
          </div>
        </Modal>
      </div>
    )
  }
}
AddCreator = reduxForm({
  form: 'uploadCreator',
  validate
})(AddCreator);