import React, { Component } from "react";
import PropTypes from "prop-types";

import { Link } from "react-router-dom";

import PostEditor from "./Editor";
import Post from "./Post";

export default class Home extends Component {
  handleDragOver() {
    this.refs.editor.focus();
    this.refs.editor.showBackdrop();
  }

  handleDragLeave() {
    this.refs.editor.blur();
    this.refs.editor.hideBackdrop();
  }

  render() {
    const {
      profiles,
      posts, // this should just be an array of hashes in the profile
      peerCount,
      onPublish,
      connectionError,
      id,
      following,
      onlinePeers
    } = this.props;

    const selfProfile = profiles[id] || {};
    const iconURL = `url('https://ipfs.io/ipfs/${selfProfile.icon}')`;
    const backgroundURL = `url('https://ipfs.io/ipfs/${selfProfile.canopy}')`;
    const filteredPosts = posts.filter(post => post.author.id === id);

    return (
      <main
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
      >
        <div className="flex justify-center items-start">
          <div className="minw5 dn db-l mw-post mv3 mh2-l  br3-l overflow-hidden ba b--light-gray bg-white">
            <Link to={id ? `/@${id}` : "#"}>
              <div
                className={`h35 w-100 cover bg-center ${selfProfile.canopy ? "bg-light-gray" : "bg-near-black"}`}
                style={
                  selfProfile.canopy
                    ? {
                        backgroundImage: backgroundURL
                      }
                    : null
                }
              />
            </Link>

            {
              // TODO: Factor this out
            }
            <div className="w5 minw55 mh3 mb3 minh4 pl05">
              <div className="flex items-center justify-start">
                <Link to={id ? `/@${id}` : "#"}>

                  <div className="mln05 mtn2 overflow-hidden ba b--white bw2  br3  bg-light-gray">
                    <div
                      className="h3 w3 cover"
                      style={
                        selfProfile.icon
                          ? {
                              backgroundImage: iconURL
                            }
                          : null
                      }
                    />
                  </div>
                </Link>

                <div className="ml2 mtn05">

                  <Link
                    to={id ? `/@${id}` : "#"}
                    className=" link db f6 fw6 near-black"
                  >
                    {selfProfile.name || "Anonymous"}
                  </Link>

                  {
                    // Make this a component
                  }
                  <span
                    className={`fw5 nowrap ${connectionError ? "offline" : peerCount > 0 ? "connected" : "connecting"} f6`}
                  >
                    {connectionError
                      ? "offline"
                      : peerCount > 0 ? "online" : "connecting..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center">

                {
                  // Stats bar -- factor out to a component
                }
                <div className="mt3 ph0 h-100 w-100 flex items-center justify-start">
                  <Link
                    to={id ? `/@${id}` : "#"}
                    className="h-100 no-underline mr4"
                  >
                    <div className="tl light-silver hover-near-black">
                      <h3 className="f5 mt0 mb0 near-black">
                        {filteredPosts.length}
                      </h3>
                      <span className="f7 fw4 ttu ">
                        Posts
                      </span>
                    </div>
                  </Link>
                  <Link
                    to={id ? `@${id}/following` : "#"}
                    className="h-100 no-underline mr4"
                  >
                    <div className=" h-100    light-silver hover-near-black">
                      <h3 className="f5 mt0 mb0 near-black">
                        {selfProfile && selfProfile.following
                          ? Object.keys(selfProfile.following).length
                          : 0}
                      </h3>
                      <span className=" f7 fw4 ttu">
                        Following
                      </span>
                    </div>
                  </Link>

                  <Link
                    to={id ? `/@${id}` : "#"}
                    className="h-100 no-underline mr4"
                  >
                    <div className="  light-silver hover-near-black">
                      <h3 className="f5 mt0 mb0 near-black">
                        0
                      </h3>
                      <span className=" f7 fw4 ttu">
                        Likes
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {
              // End self profile card
            }

          </div>
          <div className="mw75 flex w-100">
            <div className="w-100 bl br b--transparent">
              <PostEditor
                ref="editor"
                name={selfProfile.name || "Anonymous"}
                icon={selfProfile.icon}
                id={id}
                connectionError={connectionError}
                onPublish={onPublish}
                onClose={this.toggleEditor}
                peerCount={peerCount}
              />
              {posts.sort((a, b) => b.date - a.date).map(post => {
                return (
                  <Post
                    key={post.hash}
                    author={profiles[post.author.id]}
                    content={post.content}
                    date={post.date}
                    selfIcon={selfProfile.icon}
                    verified={following[post.author.id]}
                  />
                );
              })}
            </div>
            <div className="dn db-xl pa3 mh2 br2 ba b--light-gray mt3 bg-white self-start">
              <div className="w5">
                <h2 className="f7 ttu silver mv0">
                  {onlinePeers.length
                    ? `${onlinePeers.length} people online`
                    : "Nobody online"}
                </h2>
                {onlinePeers.length
                  ? <ul className="list pa0 ma0 mt2">
                      {onlinePeers.map(peerID => (
                        <li className="mv1" key={peerID}>
                          <span>
                            <Link
                              to={profiles[peerID] ? `/@${peerID}` : `#`}
                              className="pointer link mv0 mr1 f6 fw6 near-black flex items-center"
                            >
                              {profiles[peerID]
                                ? profiles[peerID].name
                                : peerID.substr(0, 8)}
                              {following[peerID]
                                ? <span>
                                    <svg
                                      className="mtn1 pl1px"
                                      fill="#5856D6"
                                      width="14px"
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
                            </Link>
                          </span>
                        </li>
                      ))}
                    </ul>
                  : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

Home.propTypes = {
  posts: PropTypes.array.isRequired
};
