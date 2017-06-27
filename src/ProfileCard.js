import React, { Component } from "react";

import { Link } from "react-router-dom";

export default class ProfileCard extends Component {
  render() {
    const { onFollow, profile, isFollowing, buttonColor } = this.props;
    const { id, canopy, icon, name, bio, color } = profile;

    const iconURL = icon ? `url('https://ipfs.io/ipfs/${icon}')` : null;
    const canopyURL = canopy ? `url('https://ipfs.io/ipfs/${canopy}')` : null;
    return (
      <div className="h6 pb3 fl ma2 br3 overflow-hidden ba b--light-gray  mv2 bg-white">
        <Link to={`/@${id}`}>
          <div
            className={` ${canopy ? "bg-light-gray" : "bg-near-black"} h35 w-100 cover bg-center`}
            style={{
              backgroundImage: canopyURL,
              backgroundColor: color ? `#${color}` : null
            }}
          />
        </Link>
        <div className="flex items-center justify-between mh3">
          <Link to={`/@${id}`}>
            <div className="mln05 mtn2 overflow-hidden ba b--white bw2  br3 bg-light-gray">
              <div>
                <div
                  className="h3 w3 cover bg-center"
                  style={{
                    backgroundImage: iconURL
                  }}
                />
              </div>
            </div>
          </Link>
          <div className="ml2 mtn05">
            <button
              onClick={onFollow}
              className={`${isFollowing ? "bg-purple white b--purple" : "bg-white purple b--purple"} pointer ph2 pv1 br2 ba  f7 fw6`}
              style={{
                borderColor: `#${buttonColor}`,
                backgroundColor: isFollowing ? `#${buttonColor}` : null,
                color: isFollowing ? null : `#${buttonColor}`
              }}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        </div>
        <div className="w5-ns mh3 mt0 minh4 pl05 relative">
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
