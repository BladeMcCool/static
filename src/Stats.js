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
      color,
      isSelf,
      editing
    } = this.props;

    return (
      <div className="mt2 bl-ns br-ns b--transparent">
        <div className="bl br b--transparent ph2-ns mtn4-ns flex flex-row-ns justify-between">

          {
            //Make these a generic component
          }
          <div className="flex items-start">
            <Link to={match.url} className="no-underline">
              <div
                className={`tc h3 relative flex flex-column-ns flex-row items-top justify-center hover-near-black ${selected === "posts" ? "near-black" : "moon-gray"}`}
                style={selected === "posts" ? { color: `#${color}` } : null}
              >
                <span className="mt0 mb1 font-stats fw6 ml3 mr3-ns mr2">
                  {postCount || 0}
                </span>
                <span className="mh3-ns f6 fw6">
                  Posts
                </span>
                {selected === "posts"
                  ? <div
                      className="dn db-ns absolute bottom-0 h05 w-100 bg-near-black"
                      style={{ backgroundColor: `#${color}` }}
                    />
                  : null}
              </div>
            </Link>

            <Link to={`${match.url}/following`} className=" no-underline">
              <div
                className={`h3 tc relative flex flex-column-ns flex-row items-top justify-center hover-near-black ${selected === "following" ? "near-black" : "moon-gray"}`}
                style={selected === "following" ? { color: `#${color}` } : null}
              >
                <span className="mt0 mb1 font-stats fw6 ml3 mr3-ns mr2">
                  {followingCount || 0}
                </span>
                <span className="mh3-ns f6 fw6">
                  Following
                </span>
                {selected === "following"
                  ? <div
                      className="dn db-ns absolute bottom-0 h05 w-100 bg-near-black"
                      style={{ backgroundColor: `#${color}` }}
                    />
                  : null}
              </div>
            </Link>

            <Link to={"#"} className="no-underline">
              <div
                className={`h3 tc relative flex flex-column-ns flex-row items-center justify-center hover-near-black ${selected === "likes" ? "near-black" : "moon-gray"}`}
                style={selected === "likes" ? { color: `#${color}` } : null}
              >
                <span className="mt0 mb1 font-stats fw6 ml3 mr3-ns mr2">
                  {0}
                </span>
                <span className="mh3-ns f6 fw6">
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
                    onClick={event => {
                      // this.refs.button.blur();
                      //remove hover
                      onToggleEdit(event);
                    }}
                    style={{
                      backgroundColor: editing
                        ? color ? `#${color}` : "#111"
                        : "#FFF",
                      borderColor: color ? `#${color}` : "#111",
                      color: !editing ? color ? `#${color}` : "#111" : "#FFF"
                    }}
                    ref="button"
                    className={`mr3 btn pointer br2 pv2 ph3 f6 fw6 ba bw05 bg-white`}
                  >
                    {editing ? "Done" : "Edit profile"}
                  </button>
                : <button
                    onClick={event => {
                      this.refs.button.blur();
                      onFollow(event);
                    }}
                    ref="button"
                    className={`silver mr3 btn pointer br2 pv2 ph3 f6 fw6 ba bw05`}
                    style={{
                      backgroundColor: isFollowing
                        ? color ? `#${color}` : "#111"
                        : "#FFF",
                      borderColor: color ? `#${color}` : "#111",
                      color: !isFollowing
                        ? color ? `#${color}` : "#111"
                        : "#FFF"
                    }}
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
