import React from "react";
import { NavLink } from "react-router-dom";
import { RiDashboardLine } from "react-icons/ri";
import { MdRateReview } from "react-icons/md";
import { BsFillBagFill } from "react-icons/bs";
import { GoClippy, GoSettings } from "react-icons/go";
import { GiCancel } from "react-icons/gi";

import "./SellerDashBoardMenu.css";
import ProfileImage from "../Header/ProfileImage";

class SellerDashBoardMenu extends React.Component {
  render() {
    return (
      <div className="primary-background" id="seller-dashboard-menu">
        <ul id="seller-menu-items">
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller-dashboard"
          >
            <li>
              <RiDashboardLine className="mr-2" />
              Dashboard
            </li>
          </NavLink>
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller-products"
          >
            <li>
              <BsFillBagFill className="mr-2" />
              Products
            </li>
          </NavLink>
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller-orders"
          >
            <li>
              <GoClippy className="mr-2" />
              Orders
            </li>
          </NavLink>
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller-review"
          >
            <li>
              <MdRateReview className="mr-2" />
              Reviews
            </li>
          </NavLink>
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller/products/rejected"
          >
            <li>
              <GiCancel className="mr-2" />
              Rejects
              <span
                className="badge ml-2"
                style={{ color: "#fff", backgroundColor: "#f76b1a" }}
              >
                1
              </span>
            </li>
          </NavLink>
          <NavLink
            className="link"
            activeClassName="seller-menu-active"
            to="/seller/settings"
          >
            <li>
              <GoSettings className="mr-2" />
              Settings
            </li>
          </NavLink>
        </ul>
        <div id="seller-menu-profile">
          <ProfileImage id="seller-menu-user-icon" size={"70px"} />
          <h6 className="ml-2">Hi Mbuthia</h6>
        </div>
      </div>
    );
  }
}

export default SellerDashBoardMenu;
