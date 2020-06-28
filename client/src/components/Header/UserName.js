import React from "react";
import { connect } from "react-redux";

import "./UserName.css";
// import User from "./User";

class UserName extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div id="header-username">
        <h3 className="secondary-text">Hi,{this.props.user.firstName}</h3>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
  };
};

export default connect(mapStateToProps)(UserName);
