import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import MiniMenuWrapper from "../MiniMenuWrapper/MiniMenuWrapper";
import FormField from "../Checkout/FormField";
import { connect } from "react-redux";
import { updatePasswordLoggedIn } from "../../redux/actions";

export class ChangePassword extends Component {
  render() {
    return (
      <React.Fragment>
        <Header />
        <div className="container">
          <div className="row">
            <div
              className="col-md-9 my-5 mx-auto box-container"
              id="address-form"
            >
              <h3 className="legend">Change Password</h3>
              <hr />
              <form
                onSubmit={this.props.handleSubmit(formValues => {
                  console.log(formValues);
                  //  updatePasswordLoggedIn()
                })}
              >
                <Field
                  type="password"
                  name="currentPassword"
                  label="Current Password"
                  component={FormField}
                />
                <Field
                  type="password"
                  name="newPassword"
                  label="New Password"
                  component={FormField}
                />
                <Field
                  type="password"
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  component={FormField}
                />
                <button
                  className="btn btn-md btn-block address-btn mt-3 "
                  disabled={!this.props.valid || this.props.loading}
                  type="submit"
                >
                  {this.props.loading && (
                    <span
                      className="spinner-grow spinner-grow-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                  )}
                  {this.props.loading ? (
                    <span> {"  "}Loading...</span>
                  ) : (
                    <span>Save And Continue</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
        <MiniMenuWrapper />
      </React.Fragment>
    );
  }
}

const validate = formValues => {
  const errors = {};

  if (
    !formValues.currentPassword ||
    (formValues.currentPassword && formValues.currentPassword.length < 6)
  ) {
    errors.currentPassword = "Please enter a valid password";
  }
  if (
    !formValues.newPassword ||
    (formValues.newPassword && formValues.newPassword.length < 6)
  ) {
    errors.newPassword = "Your password must be atleast six characters";
  }
  if (formValues.confirmNewPassword !== formValues.newPassword) {
    errors.confirmNewPassword = "Passwords do not patch";
  }
  return errors;
};
const mapStateToProps = state => {
  return {
    loading: state.auth.loading
  };
};
export default reduxForm({ validate, form: "ChangePassword" })(
  connect(mapStateToProps)(ChangePassword)
);
