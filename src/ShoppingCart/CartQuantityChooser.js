var React = require('react');

import '../DropdownTable.css';
import {Button, FormGroup, FormControl, InputGroup, Label, OverlayTrigger, Tooltip} from 'react-bootstrap';

// import { hashHistory } from 'react-router';
import { checkAuthAndAdmin, restRequest } from '../Utilities';

export default class CartQuantityChooser extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      shouldUpdateCart: false
    }
    this.toggleRequestType = this.toggleRequestType.bind(this);
  }

  componentDidMount(){
    this.setState({shouldUpdateCart: this.props.shouldUpdateCart});
    this.setState({showLabel: (this.props.showLabel === true) });
    }

  generateHighQuantityTextBox(row){
    return(
                  <FormControl
                    type="number"
                    min="1"
                    value={row.quantity_cartitem}
                    style={{width: "72px"}}
                    onChange={(e)=>{
                      row.quantity_cartitem=e.target.value;
                      row.shouldUpdate = row.inCart;
                      this.forceUpdate();
                    }}
                  />

      );
  }

  updateRowQuantity(row){
    checkAuthAndAdmin(()=>{
        row.shouldUpdate = false;
        var id = (row.cartId ? row.cartId : row.id);
        var Quantity = parseInt(row.quantity_cartitem, 10);
        const isStaff = (localStorage.isStaff === "true");
        var updateJSON = JSON.stringify({
            type: row.status,
            quantity: Quantity
        });

        var url = "/api/request/modifyQuantityRequested/"+id+"/";
        restRequest("PATCH", url, "application/JSON", updateJSON,
            (responseText)=>{
                this.forceUpdate();
                // this.props.cb.forceUpdate();
                this.props.cb._alertchild.generateSuccess("Successfully updated quantity");
                row.original_quantity = row.quantity_cartitem;
            }, (status, errResponse)=>{
              let errs = JSON.parse(errResponse);
              for (var key in errs){
                if (errs.hasOwnProperty(key)){
                  this.props.cb._alertchild.generateError("Error: " + ((key === "email") ? errs[key][0] : errs[key]));
                }
              }
                row.quantity_cartitem = row.original_quantity;
            }
        );
    })
  }

// TODO: account for disbusement vs. loan
  onAddtoCartClick(row){
    checkAuthAndAdmin(()=>{
        const isStaff = (localStorage.isStaff === "true");
        var addItemJson = JSON.stringify({
            item_id: row.id,
            quantity: row.quantity_cartitem
        });
        var url = "/api/request/disbursement/";
        restRequest("POST", url, "application/json", addItemJson,
            (responseText)=>{
                var response = JSON.parse(responseText);
                //alert("Added " + row.quantity + " of " + row.name + " to cart!");
                localStorage.setItem("cart_quantity", parseInt(localStorage.cart_quantity, 10) + 1);
                this.props.cb._alertchild.generateSuccess("Successfully added " + row.quantity_cartitem + " of " + row.name + " to cart!");
                row.inCart = true;
                row.cartId = response.id;
                row.status = "disbursement"
                this.setState({shouldUpdateCart: true});
                this.forceUpdate();
            }, (status, errResponse)=>{
                let err = JSON.parse(errResponse);
                if(err.quantity != null) {
                    this.props.cb._alertchild.generateError(JSON.parse(errResponse).quantity[0]);
                } else if(err.detail != null) {
                    this.props.cb._alertchild.generateError(JSON.parse(errResponse).detail);
                }
            });
    })
  }

  toggleRequestType(){
    checkAuthAndAdmin(()=>{
      var row = this.props.row;
      var id = (row.cartId ? row.cartId : row.id);
      var url = "/api/request/convertRequestType/";
      var changeTypeJSON = JSON.stringify({
          current_type: row.status,
          pk: id
      });
      restRequest("POST", url, "application/JSON", changeTypeJSON,
          (responseText)=>{
              var response = JSON.parse(responseText);
              row.cartId = response.id;
              row.status === "disbursement" ? row.status = "loan" : row.status = "disbursement";
              row.id = response.id;
              this.forceUpdate();
              this.props.cb.forceUpdate();
              if (typeof this.props.cb.resetTable === "function") {
                this.props.cb.resetTable();
              }
          }, (status, errResponse)=>{

          }
      );
    });
  }

  render(){
    var row = this.props.row;

    const tooltip = (
      <Tooltip id="tooltip">Click to toggle between loan and disbursement.</Tooltip>
    );
    return (
      <div>
      <FormGroup style={{marginBottom: "0px"}} controlId="formBasicText" >
      <InputGroup>
      {this.generateHighQuantityTextBox(row)}
      {row.shouldUpdate === true ? <Button bsStyle="success" onClick={() => this.updateRowQuantity(row)}>Update</Button> : null}
      {row.inCart === true ? null : <Button bsStyle="success" onClick={() => this.onAddtoCartClick(row)}>Add to Cart</Button>}
      {(this.state.showLabel && row.inCart) ? <Label style={{marginLeft: "5px", marginTop: "10px"}} bsStyle="info">In Cart</Label> : null}
      {(row.inCart && row.status != null) ?
        <OverlayTrigger placement="bottom" overlay={tooltip}>
        <Button bsSize="xsmall" style={{marginLeft: "5px", marginTop: "1px", fontSize: "9.5px"}}
                bsStyle={row.status === "disbursement" ? "primary" : "warning"}
                onClick={this.toggleRequestType}>
                <strong>{row.status === "disbursement" ? "Disbursement" : "Loan"}
                </strong></Button></OverlayTrigger> : null}
      </InputGroup>
      </FormGroup>
      </div>
    );
  }

}
