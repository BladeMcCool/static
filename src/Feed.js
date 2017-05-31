import React, { Component } from "react";

import Post from "./Post";

export default class Feed extends Component {
  render() {
    return this.props.posts.map(post => {
      return (
        <Post
          key={post.author + post.date_published}
          author={post.author}
          icon={post.icon}
          content={post.content}
          date_published={post.date_published}
        />
      );
    });
  }
}
