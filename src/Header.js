import React, { Component } from "react";
import PropTypes from "prop-types";
import AutosizeInput from "react-input-autosize";

export default class Header extends Component {
  render() {
    const { peerCount, icon, toggleEditor } = this.props;
    return (
      <header className="w-100 bg-white bb b--light-gray w-75 pa3 z-999 flex flex-row justify-between items-center">
        <div className="flex-auto flex flex-row items-center">
          <a href="." className="near-black f4 fw5 ttu sans-serif tl link">
            <svg fill="#111" width="15px" height="24px" viewBox="0 0 10 16">
              <polygon id="Shape" points="10 7 6 7 9 0 0 9 4 9 1 16" />
            </svg>
          </a>
          <input
            className="search fw4 h2 w-100 mw6 ph2 mh3 input-reset br2 bn bg-near-white"
            placeholder="Search Static"
            spellCheck="false"
            type="text"
            name="search"
          />
        </div>

        <div className="flex flex-row items-center justify-end">
          <div className="h2 flex flex-row items-center mr3">
            <input
              type="file"
              name="iconPicker"
              id="iconPicker"
              className="dn"
              onChange={this.setIcon}
            />
            <label htmlFor="iconPicker">
              <div
                className="pointer h2 w2 br2 cover bg-near-black"
                style={{
                  backgroundImage: `url('https://ipfs.io/ipfs/${icon}')`
                }}
              />
            </label>

            <div className="ml2 flex flex-column">
              <AutosizeInput
                className="nowrap pa0 input-reset bn f6 fw6 near-black"
                type="text"
                inputStyle={{
                  padding: 0,
                  border: "none",
                  fontSize: ".875rem",
                  fontWeight: 600
                }}
                onChange={event => {
                  this.setState({ name: event.target.value });
                  localStorage.setItem("name", event.target.value);
                }}
                placeholder="Anonymous"
                value={this.props.name || ""}
              />

              <span
                className={`fw5 nowrap ${peerCount > 0 ? "connected" : "connecting"} f6`}
              >
                {peerCount > 0
                  ? `${peerCount} ${peerCount === 1 ? "peer" : "peers"}`
                  : "connecting..."}
              </span>
            </div>
          </div>

          <button
            onClick={toggleEditor}
            className="pointer nowrap bn h2 ph2 br2 f5 fw5 white bg-bright-blue sans-serif"
          >
            New Post
          </button>
        </div>
      </header>
    );
  }
}

Header.propTypes = {
  peerCount: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};
