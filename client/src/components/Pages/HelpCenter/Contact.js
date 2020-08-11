import React from "react";

import "./Contact.css";
import HelpCenterHeader from "./HelpCenterHeader";
import Footer from "../../Footer/Footer";
import MiniMenuWrapper from "../../MiniMenuWrapper/MiniMenuWrapper";

class Contact extends React.Component {
  render() {
    return (
      <div className="main">
        <div className="content white-body">
          <HelpCenterHeader />
          <div
            className="container-fluid p-0 m-0"
            style={{ backgroundColor: "#fff" }}
          >
            <h3 style={{ textAlign: "center" }}>Contact Us</h3>
            <form className="form-group"></form>
          </div>
        </div>
        <Footer />
        <MiniMenuWrapper />
      </div>
    );
  }
}

export default Contact;
