import React, { Component } from "react";
import PropTypes from "prop-types";

import PostEditor from "./Editor";
import Post from "./Post";
import Feed from "./Feed";

export default class Home extends Component {
  render() {
    const { posts, peers, onPublish } = this.props;
    return (
      <main className="mt0-ns">
        <PostEditor
          ref="editor"
          name={this.props.name || "Anonymous"}
          icon={this.props.icon}
          id={this.props.id}
          connectionError={this.props.error}
          onPublish={onPublish}
          onClose={this.toggleEditor}
          peerCount={peers.length}
        />
        {posts.map(post => {
          return (
            <Post
              key={post.author + post.date_published}
              author={post.author}
              id={post.id}
              icon={post.icon}
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
