import React, { Component } from "react";

import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";

export default class Profile extends Component {
    render() {
        const { id, editing, profile, onEdit } = this.props;

        if (id.length !== 46)
            return (
                <div className="bg-bright-blue pa3 flex items-center justify-center">
                    <span className="white bg-bright-blue wrap-all">
                        Invalid id: {id}
                    </span>
                </div>
            );

        if (!profile)
            return (
                <div className="bg-bright-blue pa3 flex items-center justify-center">
                    <span className="white bg-bright-blue wrap-all">
                        Linking to profiles like this requires ipns.
                    </span>
                </div>
            );

        return (
            <div>
                <ProfileHeader
                    editing={editing}
                    canopy={profile.canopy}
                    onEdit={onEdit}
                />

                <div className="dn db-ns h3 shadow-0 bg-white" />
                <div className="flex-ns justify-center mb5 mh3-ns">
                    <ProfileInfo
                        profile={profile}
                        editing={editing}
                        onEdit={onEdit}
                    />
                    <div className="mw75">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}
