import React, { Component } from "react";

import { Link } from "react-router-dom";

export default class Stats extends Component {
  render() {
    const {
      postCount,
      selected,
      followingCount,
      match,
      isFollowing,
      onFollow,
      onToggleEdit,
      isSelf,
      editing
    } = this.props;

    return (
      <div className="mt2 ph2">
        <div className="mtn4 flex justify-between">

          {
            //Make these a generic component
          }
          <div className="flex items-start">
            <Link to={match.url} className="no-underline">
              <div
                className={`h3 tc relative flex flex-column justify-center hover-near-black ${selected === "posts" ? "near-black" : "silver"}`}
              >
                <h3 className="mt0 mb1">
                  {postCount || 0}
                </h3>
                <span className="mh3 f7 fw4 ttu">
                  Posts
                </span>
                {selected === "posts"
                  ? <div className="absolute bottom-0 h05 w-100 bg-near-black" />
                  : null}
              </div>
            </Link>

            <Link to={`${match.url}/following`} className=" no-underline">
              <div
                className={`h3 tc relative flex flex-column justify-center hover-near-black ${selected === "following" ? "near-black" : "silver"}`}
              >
                <h3 className={"mt0 mb1"}>
                  {followingCount || 0}
                </h3>
                <span className="f7 fw4 ttu mh3">
                  Following
                </span>
                {selected === "following"
                  ? <div className="absolute bottom-0 h05 w-100 bg-near-black" />
                  : null}
              </div>
            </Link>

            <Link to={"#"} className="no-underline">
              <div className="h3 tc relative flex flex-column justify-center">
                <h3 className={"mt0 mb1 silver"}>
                  0
                </h3>
                <span className="mh3 f7 fw4 ttu silver">
                  Likes
                </span>
              </div>
            </Link>
          </div>
          {
            //Factor out Edit button
            <div className="h3 flex items-center">
              {isSelf
                ? <button
                    onClick={onToggleEdit}
                    className={`btn pointer br2 pv2 ph3 f6 fw6 ba bw05 bg-white ${editing ? "b--bright-blue bright-blue hover-bg-bright-blue-05" : "b--silver silver hover-bg-black-05"}`}
                  >
                    {editing ? "Done" : "Edit profile"}
                  </button>
                : <button
                    onClick={onFollow}
                    className={`btn pointer br2 pv2 ph3 f6 fw6 ba bw05 b--purple ${isFollowing ? "bg-purple white" : "bg-white purple"}`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>}
            </div>
          }

        </div>
      </div>
    );
  }
}
