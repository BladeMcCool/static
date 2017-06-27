import React, { Component } from "react";

export default class ProfileHeader extends Component {
  render() {
    const { editing, canopy, color, onEdit } = this.props;

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
          <div style={{ backgroundColor: color ? "#" + color : "#111" }}>
            <div
              className={
                editing || canopy
                  ? "w-100 h6-xl h5-ns h4 cover bg-center"
                  : "w-100 h45 bg-near-black cover bg-center"
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
                    ? `flex items-center pa3 w-100 h-100 ${canopy ? "bg-black-50" : "bg-near-black"}`
                    : "flex items-center pa3 w-100 h-100"
                }
                style={{
                  backgroundColor: !canopy && color ? "#" + color : null
                }}
              >
                {editing
                  ? <div className="tc center flex flex-column items-center">
                      <svg className="mv3" width="32px" viewBox="0 0 16 12">
                        <path
                          d="M15,1 L7,1 C7,0.45 6.55,0 6,0 L2,0 C1.45,0 1,0.45 1,1 C0.45,1 0,1.45 0,2 L0,11 C0,11.55 0.45,12 1,12 L15,12 C15.55,12 16,11.55 16,11 L16,2 C16,1.45 15.55,1 15,1 L15,1 Z M6,3 L2,3 L2,2 L6,2 L6,3 L6,3 Z M10.5,10 C8.56,10 7,8.44 7,6.5 C7,4.56 8.56,3 10.5,3 C12.44,3 14,4.56 14,6.5 C14,8.44 12.44,10 10.5,10 L10.5,10 Z M13,6.5 C13,7.88 11.87,9 10.5,9 C9.13,9 8,7.87 8,6.5 C8,5.13 9.13,4 10.5,4 C11.87,4 13,5.13 13,6.5 L13,6.5 Z"
                          id="Shape"
                          stroke="none"
                          fill="#FFF"
                          fill-rule="nonzero"
                        />
                      </svg><p className="ma0 f5 fw6 white">
                        {canopy
                          ? "Change your background photo"
                          : "Add a background photo"}
                      </p>
                    </div>
                  : null}
              </div>
            </div>
          </div>
        </label>
      </div>
    );
  }
}

ProfileHeader.propTypes = {};
