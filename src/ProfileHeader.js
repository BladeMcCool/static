import React, { Component } from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

export default class ProfileHeader extends Component {
  render() {
    if (!this.props.metadata)
      return (
        <div className="bg-bright-blue pa3 flex items-center justify-center">
          <span className="white bg-bright-blue wrap-all">
            Direct profile links will work when js-ipfs supports ipns.
          </span>
        </div>
      );

    return (
      <div className="bg-transparent-ns bg-white">
        <input
          type="file"
          name="backgroundPicker"
          id="backgroundPicker"
          className="dn"
          onChange={this.setBackground}
        />

        <input
          type="file"
          name="iconPicker"
          id="iconPicker"
          className="dn"
          onChange={this.setIcon}
        />

        <label
          htmlFor="backgroundPicker"
          className={this.state.edit ? "pointer" : ""}
        >
          <div
            className={
              (this.state.edit && match.params.id === this.state.id) ||
                (this.state.profiles[match.params.id] &&
                  this.state.profiles[match.params.id].canopy)
                ? "w-100 h5-ns h4 bg-light-gray cover bg-center"
                : "w-100 h4 bg-near-black cover bg-center"
            }
            style={{
              backgroundImage: this.state.profiles[match.params.id] &&
                this.state.profiles[match.params.id].canopy
                ? `url('https://ipfs.io/ipfs/${this.state.profiles[match.params.id].canopy}`
                : "none"
            }}
          >
            <div
              className={
                this.state.edit && match.params.id === this.state.id
                  ? "pa3 bg-black-50 w-100 h-100"
                  : "pa3 w-100 h-100"
              }
            >
              <div className="flex justify-end items-start">
                {match.params.id === this.state.id
                  ? this.state.edit && match.params.id === this.state.id
                      ? // if user profile, show edit button
                        <div>
                          <button
                            onClick={this.toggleEdit.bind(this)}
                            className="btn mr3 pointer bg-white near-black near-black bn br1 pv2 ph3 f6 fw6"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={this.toggleEdit.bind(this)}
                            className="btn pointer bg-white bright-blue near-black bn br1 pv2 ph3 f6 fw6"
                          >
                            Save
                          </button>
                        </div>
                      : <button
                          onClick={this.toggleEdit.bind(this)}
                          className="btn pointer bg-white near-black bn br1 pv2 ph3 f6 fw6"
                        >
                          Edit profile
                        </button>
                  : // or just the follow button
                    <button
                      onClick={() => this.toggleFollow(match.params.id)}
                      className="btn pointer bg-white near-black bn br1 pv2 ph3 f6 fw6"
                    >
                      {this.state.profiles[match.params.id] &&
                        this.state.profiles[match.params.id].following
                        ? "Following"
                        : "Follow"}
                    </button>}
              </div>
              {this.state.edit && match.params.id === this.state.id
                ? <p className="pt5-ns pt2 mt0 f4 fw6 tc center white">
                    {this.state.profiles[match.params.id] &&
                      this.state.profiles[match.params.id].canopy
                      ? "Change your background photo"
                      : "Add a background photo"}
                  </p>
                : null}

            </div>
          </div>
        </label>

        <div
          className="mtn4-ns mtn3 center-ns mh3 ba b--white bw2 h4-ns w4-ns h3 w3 br3 cover bg-light-gray"
          style={{
            backgroundImage: this.state.profiles[match.params.id]
              ? `url('https://ipfs.io/ipfs/${this.state.profiles[match.params.id].icon}`
              : "none"
          }}
        >
          {this.state.edit && match.params.id === this.state.id
            ? <label
                htmlFor="iconPicker"
                className={
                  this.state.edit && match.params.id === this.state.id
                    ? "flex items-center justify-center w-100 h-100 pointer bg-black-50 bn w-100 h-100"
                    : ""
                }
              >

                <p className="tc btn white  pointer bn br1 pv2 ph2 f6 fw6">
                  {"Add a profile photo"}
                </p>

              </label>
            : null}
        </div>

        <div className="center flex flex-column items-center tc ph2 ">
          <div className="mv1-ns mv0  center">

            <h1 className="flex items-center justify-center-ns center-ns mv0 link f4 fw6 near-black">
              <AutosizeInput
                className="name nowrap ma0 input bn f4 fw6 near-black"
                type="text"
                inputStyle={{
                  padding: 0,
                  borderRadius: "0.25rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  paddingLeft: "0.5rem",

                  paddingRight: this.state.edit &&
                    match.params.id === this.state.id
                    ? "0.5rem"
                    : "0",
                  fontSize: "1.25rem",
                  border: "none",
                  backgroundColor: this.state.edit &&
                    match.params.id === this.state.id
                    ? "white"
                    : "transparent",
                  fontWeight: 600
                }}
                disabled={!this.state.edit || match.params.id !== this.state.id}
                onChange={this.handleNameEdit.bind(this)}
                placeholder="Anonymous"
                value={
                  this.state.edit && match.params.id === this.state.id
                    ? this.state.name
                    : this.state.profiles[match.params.id].name
                }
              />

              {(this.state.profiles[match.params.id] &&
                this.state.profiles[match.params.id].following) ||
                (match.params.id === id && !this.state.edit)
                ? <span>
                    <svg
                      className="pb1 center-ns"
                      fill="#5856D6"
                      width="18px"
                      height="18px"
                      viewBox="0 0 17 17"
                    >
                      <path
                        d="M16.67,8.06 L15.59,6.72 C15.42,6.5 15.31,6.24 15.28,5.95 L15.09,4.25 C15.01,3.55 14.46,3 13.76,2.92 L12.06,2.73 C11.76,2.7 11.5,2.57 11.28,2.4 L9.94,1.32 C9.39,0.88 8.61,0.88 8.06,1.32 L6.72,2.4 C6.5,2.57 6.24,2.68 5.95,2.71 L4.25,2.9 C3.55,2.98 3,3.53 2.92,4.23 L2.73,5.93 C2.7,6.23 2.57,6.49 2.4,6.71 L1.32,8.05 C0.88,8.6 0.88,9.38 1.32,9.93 L2.4,11.27 C2.57,11.49 2.68,11.75 2.71,12.04 L2.9,13.74 C2.98,14.44 3.53,14.99 4.23,15.07 L5.93,15.26 C6.23,15.29 6.49,15.42 6.71,15.59 L8.05,16.67 C8.6,17.11 9.38,17.11 9.93,16.67 L11.27,15.59 C11.49,15.42 11.75,15.31 12.04,15.28 L13.74,15.09 C14.44,15.01 14.99,14.46 15.07,13.76 L15.26,12.06 C15.29,11.76 15.42,11.5 15.59,11.28 L16.67,9.94 C17.11,9.39 17.11,8.61 16.67,8.06 L16.67,8.06 Z M7.5,13 L4,9.5 L5.5,8 L7.5,10 L12.5,5 L14,6.55 L7.5,13 L7.5,13 Z"
                        id="Shape"
                        stroke="none"
                      />
                    </svg>
                  </span>
                : null}
            </h1>
          </div>

          <h2 className="mv0 mh2 f6-ns f6 tc-ns tl fw4 lh-copy light-silver break-all">
            @
            <span>
              {match.params.id.substr(0, 23)}
            </span>
            <span>
              {match.params.id.substr(23, 23)}
            </span>
          </h2>

          {this.state.profiles[match.params.id].bio
            ? <p className="mt2 mb0 w-100 tc-ns tl lh-copy measure f6 near-black">
                {this.state.profiles[match.params.id].bio}
              </p>
            : null}

        </div>

        {
          //User Stats
        }
        <div className="mv3 near-black center flex justify-center">
          <div className="mh3 tc">
            <h3 className="mv0"> {filteredPosts.length}</h3>
            <span className="near-black f7 fw6 ttu">Posts</span>
          </div>
          <div className="mh3 tc">
            <h3 className="mv0 gray">0</h3>
            <span className="silver f7 fw6 ttu">Following</span>
          </div>
          <div className="mh3 tc">
            <h3 className="mv0 gray">0</h3>
            <span className="silver f7 fw6 ttu">Likes</span>
          </div>
        </div>

      </div>
    );
  }
}

ProfileHeader.propTypes = {};
