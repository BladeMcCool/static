import React, { Component } from "react";
import PropTypes from "prop-types";

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
      posts,
      peerCount,
      onPublish,
      connectionError,
      icon
    } = this.props;
    return (
      <main
        className="relative"
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
      >

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
              key={post.author.id + post.date_published}
              author={profiles[post.author.id]}
              content={post.content}
              date={post.date}
              selfIcon={icon}
              verified={
                (profiles &&
                  profiles[post.author.id] &&
                  profiles[post.author.id].following) ||
                  post.author.id === this.props.id
              }
            />
          );
        })}
      </main>
    );
  }
}

Home.propTypes = {
  posts: PropTypes.array.isRequired
};
