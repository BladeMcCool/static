import React, { Component } from "react";
import PropTypes from "prop-types";
// import AutosizeInput from "react-input-autosize";

import { Link } from "react-router-dom";

export default class Header extends Component {
  render() {
    const { peerCount, icon, connectionError, id } = this.props;
    return (
      <header className="bg-white w-100 b--light-gray w-75 pa3 z-999 flex flex-row justify-between items-center">
        <div className="flex-auto flex flex-row items-center">
          <Link to="." className="near-black f4 fw5 ttu sans-serif tl link">
            <svg fill="#111" width="15px" height="24px" viewBox="0 0 10 16">
              <polygon id="Shape" points="10 7 6 7 9 0 0 9 4 9 1 16" />
            </svg>
          </Link>
          <input
            className="search fw4 h2 w-100 mw6 ph2 mh3 input-reset br2 bn bg-near-white"
            placeholder="Search Static"
            spellCheck="false"
            type="text"
            name="search"
          />
        </div>

        <div className="flex flex-row items-center justify-end">
          <div className="h2 flex flex-row items-center">
            <Link
              to={`/@${id}`}
              className="link mv0 mr1 f6 fw6 near-black flex flex-row items-start"
            >
              <div
                className="pointer h2 w2 br2 cover bg-light-gray"
                style={{
                  backgroundImage: `url('https://ipfs.io/ipfs/${icon}')`
                }}
              />

              <div className="ml2 flex flex-column">
                <span className="nowrap pa0 f6 fw6 near-black">
                  {this.props.name || "Anonymous"}
                </span>

                <span
                  className={`fw5 nowrap ${connectionError ? "offline" : peerCount > 0 ? "connected" : "connecting"} f6`}
                >
                  {connectionError
                    ? "offline"
                    : peerCount > 0 ? "online" : "connecting..."}
                </span>
              </div>

            </Link>
          </div>
        </div>
        {
          // <div className="absolute z-999 right-0 top-0 mt4 pa0 mh3 near-black">
          //   <ul className="list mt35 bg-white br2 ba b--light-gray pa3">
          //     <li className="f7 mb2">@{id}</li>
          //     <li className="f6 mb2">Profile</li>
          //     <li className="f6 mb2">Settings</li>
          //   </ul>
          // </div>
        }
      </header>
    );
  }
}

Header.propTypes = {
  peerCount: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  name: PropTypes.string,
  onNameEdit: PropTypes.func.isRequired,
  onToggleEditor: PropTypes.func.isRequired
};
