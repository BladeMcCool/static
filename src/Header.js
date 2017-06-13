import React, { Component } from "react";
import PropTypes from "prop-types";
// import AutosizeInput from "react-input-autosize";

import { Link } from "react-router-dom";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { showDropdown: false };
  }

  onFocus() {
    this.setState({ showDropdown: true });
  }

  onBlur() {
    this.setState({ showDropdown: false });
  }

  render() {
    const { peerCount, icon, connectionError, id, name } = this.props;
    return (
      <header className="bg-white w-100 b--light-gray w-75 pa3 z-999 flex flex-row justify-between items-center">
        <div className="flex-auto flex flex-row items-center">
          <Link to="/" className="near-black f4 fw5 ttu sans-serif tl link">
            <svg fill="#111" width="15px" height="24px" viewBox="0 0 10 16">
              <polygon id="Shape" points="10 7 6 7 9 0 0 9 4 9 1 16" />
            </svg>
          </Link>
          <form className="w-100 relative mh3">
            {
              // action="/search"
            }
            <input
              className="search fw4 h2 w-100 mw6 ph2  input-reset br2 bn bg-near-white"
              placeholder="Search Static"
              autoComplete="off"
              spellCheck="off"
              type="text"
              name="q"
              onFocus={this.onFocus.bind(this)}
              onBlur={this.onBlur.bind(this)}
            />
            {this.state.showDropdown && !this.state.showDropdown
              ? <div className="z-999 w-100 mw6 mt0 absolute w5">
                  <div className="shadow-6 mt2 w-100 bg-white br2 pa3">
                    <ul className="pa0 ma0 list">
                      <li className="f6 gray flex items-center">
                        <div
                          className="pointer h2 w2 br2 cover bg-light-gray"
                          style={{
                            backgroundImage: `url('https://ipfs.io/ipfs/${icon}')`
                          }}
                        />
                        <div className="ml2 h2 flex flex-column justify-between">
                          <span className="db f6 fw6 near-black">Oliver</span>
                          <span className="db f7 silver">
                            @QmfP4b1xg6evDybA7y1gxWpHKxhmMrEGDiMSFdrYFS2B3m
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              : null}
          </form>

        </div>

        <div className="flex flex-row items-center justify-end">
          <div className="h2 flex flex-row items-center">
            <Link
              to={id ? `/@${id}` : "#"}
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
                  {name || "Anonymous"}
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
      </header>
    );
  }
}

Header.propTypes = {
  peerCount: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  name: PropTypes.string
};
