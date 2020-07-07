import React, { Component } from "react";

export class BuyerDestination extends Component {
  render() {
    return (
      <div className="id-cut">
        <strong className="x mr-2">Destination:</strong>
        {this.props.buyer.address}
      </div>
    );
  }
}

export default BuyerDestination;
