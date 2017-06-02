import React, { Component } from "react";
import PropTypes from "prop-types";

import PostEditor from "./Editor";
import Post from "./Post";
import Feed from "./Feed";

export default class Home extends Component {
  handleDragOver() {
    this.refs.editor.focus();
  }

  handleDragLeave() {
    this.refs.editor.blur();
    this.refs.editor.hideBackdrop();
  }

  render() {
    const { posts, peerCount, onPublish, connectionError } = this.props;
    return (
      <main
        onDragOver={this.handleDragOver.bind(this)}
        onDragLeave={this.handleDragLeave.bind(this)}
        className="mt0-ns"
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
        {posts.map(post => {
          return (
            <Post
              key={post.author.id + post.date_published}
              author={post.author}
              content={post.content}
              date_published={post.date_published}
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
