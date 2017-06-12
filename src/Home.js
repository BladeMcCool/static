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
      name,
      profiles,
      posts,
      peerCount,
      onPublish,
      connectionError,
      icon,
      id,
      canopy,
      following
    } = this.props;

    const iconURL = `url('https://ipfs.io/ipfs/${icon}')`;
    const backgroundURL = `url('https://ipfs.io/ipfs/${canopy}')`;

    const filteredPosts = posts.filter(post => post.author.id === id);

    return (
      <main
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
      >
        <div className="flex justify-center items-start">
          <div className="minw5 dn db-l mw-post mv3 ml2-l  br3-l overflow-hidden ba b--light-gray bg-white">
            <Link to={`/@${id}`}>
              <div
                className={`h35 w-100 cover bg-center ${canopy ? "bg-light-gray" : "bg-near-black"}`}
                style={{
                  backgroundImage: backgroundURL
                }}
              />
            </Link>

            {
              // TODO: Factor this out
            }
            <div className="w5 minw55 mh3 mb3 minh4 pl05">
              <div className="flex items-center justify-start">
                <Link to={`/@${id}`}>

                  <div className="mln05 mtn2 overflow-hidden ba b--white bw2  br3  bg-light-gray">
                    <div
                      className="h3 w3 cover"
                      style={{
                        backgroundImage: iconURL
                      }}
                    />
                  </div>
                </Link>

                <div className="ml2 mtn05">

                  <Link to={`/@${id}`} className=" link db f6 fw6 near-black">
                    {name || "Anonymous"}
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
                  <Link to={`/@${id}`} className="h-100 no-underline mr4">
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
                    to={`@${id}/following`}
                    className="h-100 no-underline mr4"
                  >
                    <div className=" h-100    light-silver hover-near-black">
                      <h3 className="f5 mt0 mb0 near-black">
                        {Object.keys(following).length}
                      </h3>
                      <span className=" f7 fw4 ttu">
                        Following
                      </span>
                    </div>
                  </Link>

                  <Link to={`@${id}`} className="h-100 no-underline mr4">
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
          <div className="mw75">
            <PostEditor
              ref="editor"
              name={this.props.name || "Anonymous"}
              icon={this.props.icon}
              id={this.props.id}
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
                  selfIcon={icon}
                  verified={following[post.author.id]}
                />
              );
            })}
          </div>
        </div>
      </main>
    );
  }
}

Home.propTypes = {
  posts: PropTypes.array.isRequired
};
