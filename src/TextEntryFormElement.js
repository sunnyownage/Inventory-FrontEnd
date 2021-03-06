// Text entry element for React Bootstrap formHorizontalDescription
// @author Patrick Terry

import TypeEnum from './TypeEnum';
var React = require('react');
var Bootstrap = require('react-bootstrap');
var FormGroup = Bootstrap.FormGroup;
var Col = Bootstrap.Col;
var ControlLabel = Bootstrap.ControlLabel;
var FormControl = Bootstrap.FormControl;

class TextEntryFormElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: (this.props.initialValue == null) ? "" : this.props.initialValue
    }
    this.handleChange = this.handleChange.bind(this);
    this.renderSelectOptions = this.renderSelectOptions.bind(this);
  }

  handleChange(evt) {
    this.setState({value: evt.target.value});
    if(this.props.changeHandleCallback != null) {
      this.props.changeHandleCallback.handleChange(evt);
    }
  }

  renderSelectOptions() {
    if(this.props.selectOptions != null) {
      let selectOptions = this.props.selectOptions.map((optionString) => {
        return(<option key={optionString} value={optionString}>{optionString}</option>);
      });
      return (selectOptions);
    }
  }

  render() {
    return (
      <FormGroup controlId={this.props.controlId}>
      <Col componentClass={ControlLabel} sm={2}>
      {this.props.label}
      </Col>
      <Col sm={10}>
      {this.props.type === TypeEnum.SELECT ?
      <FormControl componentClass="select" placeholder={this.props.placeholder}
      onChange={this.handleChange} ref={(child) => { this._selectFormControl = child; }}>
      {this.renderSelectOptions()}
      </FormControl>
      :
      <FormControl componentClass={(this.props.type === TypeEnum.LONG_STRING) ? "textarea" : "input"}
      type={(this.props.type === TypeEnum.INTEGER || this.props.type === TypeEnum.FLOAT) ? "number" : "text"}
      value={this.state.value} onChange={this.handleChange}/>}
      </Col>
      </FormGroup>
    )
  }
}

export default TextEntryFormElement
