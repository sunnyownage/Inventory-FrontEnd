import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button} from 'react-bootstrap';

import ConfigureEmailModal from './ConfigureEmailModal.js';
import SubscribedManagerTable from './SubscribedManagerTable.js';
import SubscribeButton from './SubscribeButton.js';
import DateComponent from './DateComponent.js';
import AlertComponent from '../AlertComponent';

export default class EmailComponent extends React.Component {

  constructor(props){
    super(props);
    this.didPressConfigureEmail = this.didPressConfigureEmail.bind(this);
  }

  didPressConfigureEmail() {
    this._configureEmailModal.openModal();
  }

  render() {
    return(
      <div>
      <SubscribeButton cb={this}/>
      {localStorage.isSuperUser ? <SubscribedManagerTable ref={(child) => { this._subscribedManagerTable = child; }}/> : null}
      <br/>
      <h4> Configure </h4>
      <Button onClick={this.didPressConfigureEmail} bsStyle="primary">Configure Loan Reminder Emails</Button>
      <br/>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <ConfigureEmailModal alertchild={this._alertchild} ref={child => this._configureEmailModal = child} />
      <br/>
      <DateComponent />
      <br/>
      <br/>
      <br/>
      </div>
    );
  }

}
