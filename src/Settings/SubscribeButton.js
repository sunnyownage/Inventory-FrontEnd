import React from "react";
import {checkAuthAndAdmin, restRequest} from "../Utilities.js";
import {Button} from 'react-bootstrap';
import AlertComponent from '../AlertComponent';

export default class SubscribeButton extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isSubscribed : false,
    }
    this.subscribeManager = this.subscribeManager.bind(this);
    this.unsubscribeManager = this.unsubscribeManager.bind(this);
    this.assignSubscriptionStatus = this.assignSubscriptionStatus.bind(this);
  }

  componentWillMount() {
    this.assignSubscriptionStatus();
  }

  assignSubscriptionStatus() {
    restRequest("GET", "/api/email/subscribedManagers/current/", "application/json", null,
                  (responseText)=>{
                    let response = JSON.parse(responseText);
                    this.setState({isSubscribed: true});
                  }, ()=>{
                  });
  }

  subscribeManager() {
    restRequest("POST", "/api/email/subscribe/", "application/json", null,
                (responseText)=>{
                  this.setState({isSubscribed: true});
                  this.props.cb._subscribedManagerTable.getSubscribedManagers();
                  this._alertchild.generateSuccess("Successfully subscribed");
                }, ()=>{
                  this._alertchild.generateSuccess("Failed to subscribe");
                });
  }

  unsubscribeManager() {
    restRequest("POST", "/api/email/unsubscribe/", "application/json", null,
                (responseText)=>{
                  this.setState({isSubscribed: false});
                  this.props.cb._subscribedManagerTable.getSubscribedManagers();
                  this._alertchild.generateSuccess("Successfully unsubscribed");
                }, ()=>{
                  this._alertchild.generateSuccess("Failed to unsubscribe");
                });
  }

  render() {
    return(
      <div>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      {this.state.isSubscribed ?
        <Button onClick={this.unsubscribeManager} bsStyle="danger">Unsubscribe</Button>
        :
        <Button onClick={this.subscribeManager} bsStyle="primary">Subscribe</Button>
      }
      </div>
    )
  }

}
