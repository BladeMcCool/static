import React, { Component } from "react";

export default class ProfileHeader extends Component {
  render() {
    const { editing, canopy, onEdit } = this.props;

    return (
      <div>
        <input
          disabled={!editing}
          type="file"
          id="backgroundPicker"
          className="dn"
          onChange={event => onEdit(event, "background")}
        />
        <label htmlFor="backgroundPicker" className={editing ? "pointer" : ""}>
          <div
            className={
              editing || canopy
                ? "w-100 h6-xl h5-ns h4 bg-light-gray cover bg-center"
                : "w-100 h4 bg-near-black cover bg-center"
            }
            style={{
              backgroundImage: canopy
                ? `url('https://ipfs.io/ipfs/${canopy || "#"}`
                : "none"
            }}
          >
            <div
              className={
                editing
                  ? "flex items-center pa3 bg-black-50 w-100 h-100"
                  : "flex items-center pa3 w-100 h-100"
              }
            >
              {editing
                ? <p className="ma0 f5 fw6 tc center white">
                    {canopy
                      ? "Change your background photo"
                      : "Add a background photo"}
                  </p>
                : null}
            </div>
          </div>
        </label>
      </div>
    );
  }
}

ProfileHeader.propTypes = {};
