import React, { Component } from "react";

export default class Stats extends Component {
  render() {
    return (
      <div className="ph0-l ph3 h-100 flex items-center">
        <Link to={props.url} className="h-100 no-underline">
          <div className="h-100 tc relative flex flex-column justify-center">
            <h3
              className={`mt0 mb1 ${props.selected == "posts" ? "near-black" : "silver"}`}
            >
              {filteredPosts.length}
            </h3>
            <span className="mh3 f7 fw4 ttu silver">
              Posts
            </span>
            {match.isExact
              ? <div className="absolute bottom-0 h05 w-100 bg-near-black" />
              : null}
          </div>
        </Link>
        <Link to={`${match.url}/following`} className="h-100 no-underline">
          <div className="relative h-100 mh3 tc silver  flex flex-column justify-center">
            <h3
              className={`mt0 mb1 ${match.isExact ? "silver" : "near-black"}`}
            >
              {this.state.profiles[match.params.id] &&
                this.state.profiles[match.params.id].following
                ? Object.keys(this.state.profiles[match.params.id].following)
                    .length
                : 0}
            </h3>
            <span className="silver f7 fw4 ttu">
              Following
            </span>
            {match.isExact
              ? null
              : <div className="absolute bottom-0 h05 w-100 bg-near-black" />}
          </div>
        </Link>

        <div className="mh3 tc pointer">
          <h3 className="mv0 silver">0</h3>
          <span className="silver f7 fw4 ttu">Likes</span>
        </div>
      </div>
    );
  }
}
