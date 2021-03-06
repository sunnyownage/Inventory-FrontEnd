var React = require('react');
var ReactBsTable = require('react-bootstrap-table');
var BootstrapTable = ReactBsTable.BootstrapTable;
var TableHeaderColumn = ReactBsTable.TableHeaderColumn;
import {restRequest, checkAuthAndAdmin, handleErrors} from "../Utilities.js"
import { Button } from 'react-bootstrap';
import SelectAssetsModal from "../Requests/SelectAssetsModal.js"
import SelectionType from '../Requests/SelectionEnum.js';
import AlertComponent from '../AlertComponent.js';
var moment = require('moment');



export default class BackfillDetailTable extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data: []
    }
    this.stateBackfill = this.stateBackfill.bind(this);
    this.renderBackfillState = this.renderBackfillState.bind(this);
    this.renderCancelButton = this.renderCancelButton.bind(this);
    this.didFinishSelection = this.didFinishSelection.bind(this);
  }

  formatPDF(cell, row){
    return (
      <Button bsStyle="link" href={row.pdf_url}>Download PDF</Button>
    );
  }

  stateBackfill(type, row){
    checkAuthAndAdmin(()=>{
      if (type === "satisfy" && row.is_asset) {
        this._selectAssetsModal.setState({type: "loan"});
        this._selectAssetsModal.setState({dispensementID: row.loan_id});
        this._selectAssetsModal.setState({numAssetsNeeded: row.quantity});
        this._selectAssetsModal.setState({backfillID: row.id});
        this._selectAssetsModal.setState({selectionType: SelectionType.SATISFY});
        this._selectAssetsModal.openModal();
      } else {
        restRequest("PATCH", "/api/request/backfill/" + type + "/" + row.id + "/",  "application/json", null,
                    (responseText)=>{
                      var response = JSON.parse(responseText);
                      var backfillMap = {"approve": "backfill_transit",
                                 "deny": "backfill_denied",
                                 "fail": "backfill_failed",
                                 "satisfy": "backfill_satisfied",
                                 "cancel": "backfill_cancelled"};
                      row.status = backfillMap[type];
                      this.forceUpdate();
                      // this.props.cb.closeModal();
                      this._alertchild.generateSuccess(type: " success");
                    }, (status, errResponse)=>{
                      handleErrors(errResponse, this._alertchild);
                    });
      }
    });
  }

  didFinishSelection() {
    this._alertchild.generateSuccess("Successfully satisfied");
  }

  renderBackfillState(cell, row){
    if (this.props.requestState === "fulfilled" && row.status === "backfill_request") {
      return(
      <div>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("approve", row)}}>Approve</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("deny", row)}}>Deny</Button>
      </div>);
    }
    else if (row.status === "backfill_transit" && (this.props.requestState === "fulfilled" || this.props.requestState === "approved")) {
      return(<div>
        <Button bsStyle="success" onClick={()=>{this.stateBackfill("satisfy", row)}}>Satisfy</Button>
        <Button bsStyle="danger" onClick={()=>{this.stateBackfill("fail", row)}}>Fail</Button>
      </div>);
    }
    return null;
  }

  renderCancelButton(cell, row){
    return(
      (row.status === "backfill_request" && this.props.requestState === "fulfilled") ?
      <Button bsStyle="danger" onClick={()=>{this.stateBackfill("cancel", row)}}>Cancel</Button> :
      null
    )
  }

  render(){
    const isStaff = (localStorage.isStaff === "true");

    return(
      <div>
      <SelectAssetsModal updateCallback={this}
      ref={(child) => { this._selectAssetsModal = child; }}/>
      <AlertComponent ref={(child) => { this._alertchild = child; }}></AlertComponent>
      <BootstrapTable ref="backfillTable" data={this.props.data} striped hover>
      <TableHeaderColumn isKey dataField='id' hiddenOnInsert hidden>id</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_owner'>Cart Owner</TableHeaderColumn>
      <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
      <TableHeaderColumn dataField='timestamp'>Timestamp</TableHeaderColumn>
      <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
      <TableHeaderColumn dataField='pdf_url' dataAlign="center" dataFormat={this.formatPDF}>PDF</TableHeaderColumn>
      <TableHeaderColumn dataField='denyApprove' dataAlign="center" dataFormat={this.renderBackfillState} hidden={!(isStaff)}></TableHeaderColumn>
      <TableHeaderColumn dataField='cancel' dataAlign="center" dataFormat={this.renderCancelButton} hidden={(isStaff)}></TableHeaderColumn>
      </BootstrapTable>
      </div>
    );
  }


}
