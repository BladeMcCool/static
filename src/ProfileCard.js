import React, { Component } from "react";

import { Link } from "react-router-dom";

export default class ProfileCard extends Component {
  render() {
    const { onFollow, profile, isFollowing } = this.props;
    const { id, canopy, icon, name, bio } = profile;

    const iconURL = icon ? `url('https://ipfs.io/ipfs/${icon}')` : null;
    const canopyURL = canopy ? `url('https://ipfs.io/ipfs/${canopy}')` : null;

    return (
      <div className="profile-card fl h5 ma2 br3 overflow-hidden ba b--light-gray  mv2 bg-white">
        <Link to={`/@${id}`}>
          <div
            className={` ${canopy ? "bg-light-gray" : "bg-near-black"} h35 w-100 cover bg-center`}
            style={{
              backgroundImage: canopyURL
            }}
          />
        </Link>
        <div className="flex items-center justify-between mh3">
          <Link to={`/@${id}`}>
            <div className="mln05 mtn2 overflow-hidden ba b--white bw2  br3 bg-light-gray">
              <div
                className="h3 w3 cover"
                style={{
                  backgroundImage: iconURL
                }}
              />
            </div>
          </Link>
          <div className="ml2 mtn05">
            <button
              onClick={onFollow}
              className={`${isFollowing ? "bg-purple white b--purple" : "bg-white purple b--purple"} pointer ph2 pv1 br2 ba  f7 fw6`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
        <div className="w5 mh3 mt0 minh4 pl05 relative">
          {name
            ? <Link
                to={`/@${id}`}
                className="link db f5 mv2 mt0 fw6 near-black"
              >
                {name}
              </Link>
            : null}
          <Link
            to={`/@${id}`}
            className="link f6 db mv2 light-silver break-all"
          >
            @{id}
          </Link>
          {bio
            ? <p className="f6 mv2 fw5 mid-gray lh-copy">
                {bio}
              </p>
            : null}
        </div>
      </div>
    );
  }
}
