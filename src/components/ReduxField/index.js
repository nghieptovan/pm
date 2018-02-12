import React from 'react';
import {getMaxLengthField} from  './../../utils/formValidation';
import DropdownList from 'react-widgets/lib/DropdownList';
import 'react-widgets/dist/css/react-widgets.css';
import asyncValidate from './../../utils/asyncValidate';

const renderFieldAsync = ({ input, label, type, placeholder, meta: {asyncValidating, touched, error }, autoFocus = false, className = '', readOnly = false, hideError = false}) => (
  <div className="group">      
    <input {...input} className={asyncValidating ? `async-validating` : ``} required type={type} placeholder={placeholder}  autoComplete="new-password" maxLength={getMaxLengthField(input.name)}/>
    <span className="highlight"></span>
    <span className="bar"></span>
    {touched && ((error && !hideError) && <span className='redux-form-error-message'>{error}</span>)}
    <label>{label}</label>
  </div>
);
const renderField = ({ input, label, type, meta: { touched, error }, autoFocus = false, className = '', readOnly = false}) => (
  <div>
    <input {...input} placeholder={label} type={type}  autoComplete="new-password" maxLength={getMaxLengthField(input.name)} autoFocus = {autoFocus} className = {className} readOnly={readOnly}/>
    {touched && (error && <span className='redux-form-error-message'>{error}</span>)}
  </div>
);
const renderFieldWidget = ({ input, label, type, meta: { touched, error }, autoFocus = false, className = '', readOnly = false}) => (
  <div>
    <label className="label-new">{label}</label>
    <input {...input}  type={type} autoComplete="new-password" maxLength={getMaxLengthField(input.name)} autoFocus = {autoFocus} className = {className} readOnly={readOnly}/>
    {touched && (error && <span className='redux-form-error-message'>{error}</span>)}
  </div>
);

const renderMaterialField = ({ input, label, type, placeholder, meta: { touched, error }, autoFocus = false, className = '', readOnly = false}) => ( 
  <div className="group">      
    <input {...input} required type={type} placeholder={placeholder}  autoComplete="new-password" maxLength={getMaxLengthField(input.name)} readOnly = {readOnly}/>
    <span className="highlight"></span>
    <span className="bar"></span>
    {touched && (error && <span className='redux-form-error-message'>{error}</span>)}
    <label>{label}</label>
  </div>
);

const renderTextArea = ({ input, label, type, defaultValue, meta: { touched, error }, autoFocus = false, className = '', readOnly}) => (
  <div>
    <textarea {...input} placeholder={label} type="text" autoFocus = {autoFocus} className = {className}  readOnly = {readOnly} value={defaultValue} />
    {touched && (error && <span className='redux-form-error-message'>{error}</span>)}
  </div>
);

const renderTags = ({ input, label, type, meta: { touched, error }, autoFocus = false, className = '', readOnly = false}) => (
  <div>
    <textarea {...input} placeholder={label} type="text" autoFocus = {autoFocus} className = {className} readOnly={readOnly}/>
    {touched && (error && <span className='redux-form-error-message'>{error}</span>)}
  </div>
);

const renderDropdownList = ({ input, data, valueField, textField, label}) => 
  <DropdownList {...input}
  data={data}
  valueField={valueField}
  textField={textField}
  onChange={input.onChange} 
  placeholder={label}
 /> 
export {
  renderField,
  renderTextArea,
  renderTags,
  renderDropdownList,
  renderMaterialField,
  renderFieldAsync,
  renderFieldWidget
};
