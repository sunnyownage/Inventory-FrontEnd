//Used to view and edit custom fields
// @author Patrick Terry

var React = require('react');
var Bootstrap = require('react-bootstrap');
import {restRequest, checkAuthAndAdmin, handleErrors, handleServerError} from "../Utilities.js";
import AlertComponent from '../AlertComponent';
import TextEntryFormElement from '../TextEntryFormElement';
import TypeConstants from '../TypeConstants';
var Button = Bootstrap.Button;
var Form = Bootstrap.Form;

class FieldViewerAndEditor extends React.Component {

  constructor(props) {
    super(props);
    this.refDict = {};
    this.state = {
      itemData: null,
      selectedRequest: null,
      fieldData: null,
      responseData: null,
    }
    this.saveCustomFields = this.saveCustomFields.bind(this);
    this.populateFieldData = this.populateFieldData.bind(this);
    this.renderDisplayFields = this.renderDisplayFields.bind(this);
    this.renderEditFields = this.renderEditFields.bind(this);
    this.customFieldRequest = this.customFieldRequest.bind(this);
    this.typeCheck = this.typeCheck.bind(this);
  }

  populateFieldData(response) {
    var data = [];
    //Custom Fields:
    var typesArray = TypeConstants.Array;
    var responseDataArrays = [response.int_fields, response.float_fields, response.short_text_fields, response.long_text_fields];
    this.setState({responseData: responseDataArrays});
    for(var i = 0; i < typesArray.length; i++) {
      for(var j = 0; j < responseDataArrays[i].length; j++) {
        var field = responseDataArrays[i][j];
        if((localStorage.isStaff === "true") || !field.private) {
          data.push({name: field.field, type: typesArray[i], value: field.value});
        }
      }
    }
    this.setState({fieldData: data});
  }

  saveCustomFields(cb) {
    //Save Custom Fields
    var itemDataArrays = this.state.responseData;
      var types = TypeConstants.RequestStrings;
      for(var i = 0; i < itemDataArrays.length; i++) {
        var oldFields = itemDataArrays[i];
        for(var j = 0; j < oldFields.length; j++) {
          var newValue = this.refDict[oldFields[j].field].state.value;
          if(oldFields[j].value !== newValue && this.typeCheck(newValue, types[i])) {
            this.customFieldRequest(types[i], oldFields[j].id, newValue);
          }
          if(cb != null) {
            cb();
          }
        }
      }

  }

  typeCheck(value, type) {
    return (type === 'short_text' || type === 'long_text' || value !== "");
  }

  customFieldRequest(type, id, value) {
    var requestBody = {
      "value": value
    }
    var jsonResult = JSON.stringify(requestBody);
    restRequest("PATCH", this.props.apiSource + type + "/" + id, "application/json", jsonResult,
    (responseText)=>{
      var response = JSON.parse(responseText);
    },
    (status, errResponse)=>{
      handleErrors(errResponse, this.props.alertchild);
    });
  }

  renderDisplayFields() {
    if(this.state.fieldData != null) {
      let displayFields = this.state.fieldData.map((field) => {
        return(<p key={field.name}> <b>{field.name}:</b> {field.value} </p>);
      });
      return (displayFields);
    }
  }

  renderEditFields() {
    if(this.state.fieldData != null) {
      let editFields = this.state.fieldData.map((field) => {
        if(field.isImmutable) {
          return null;
        } else {
          return(<TextEntryFormElement key={field.name} controlId={"formHorizontal" + field.name}
          label={field.name} type={field.type} initialValue={field.value}
          ref={child => this.refDict[field.name] = child}/>);
        }
      });
      return(editFields);
    }
  }

  render() {
    if(this.state.fieldData == null) return null;
    const isStaff = (localStorage.isStaff === "true");
    return (
      <div>
      {this.props.isEditing ?
      <Form horizontal>
      {this.renderEditFields()}
      </Form>
      :
      this.renderDisplayFields()
      }
      </div>
    )
  }
}

export default FieldViewerAndEditor
