import React, { Component } from "react";

import ProfileHeader from "./ProfileHeader";
import ProfileInfo from "./ProfileInfo";

export default class Profile extends Component {
	render() {
		const {
			id,
			editing,
			profile,
			online,
			onEdit,
			isFollowing,
			isSelf
		} = this.props;

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
						@{id}
					</span>
				</div>
			);

		return (
			<div>
				<ProfileHeader
					editing={editing}
					canopy={profile.canopy}
					color={profile.color}
					onEdit={onEdit}
				/>

				<div className="dn db-ns h3 shadow-0 bg-white" />
				<div className="flex-ns justify-center mb6">
					<ProfileInfo
						profile={profile}
						online={online}
						color={profile.color}
						isFollowing={isFollowing}
						editing={editing}
						onEdit={onEdit}
						isSelf={isSelf}
					/>
					<div className="mw75">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}
