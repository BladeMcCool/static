import React, { Component } from "react";

import Textarea from "react-textarea-autosize";

export default class ProfileInfo extends Component {
	render() {
		const {
			profile,
			online,
			editing,
			onEdit,
			isFollowing,
			isSelf
		} = this.props;
		const { id, icon, name, bio, location, website, color } = profile;

		return (
			<div className="mh2 ba b--transparent pa3 minw5">
				<div className="w5">
					<div
						style={{ backgroundColor: color ? `#${color}` : "#111" }}
						className="mtn6-ns mtn3 mln1 overflow-hidden ba b--white bw2 h45-ns w45-ns h35 w35 br4 bg-light-gray"
					>
						<div
							className="h-100 w-100 cover bg-center"
							style={
								icon
									? { backgroundImage: `url('https://ipfs.io/ipfs/${icon}` }
									: null
							}
						>
							<input
								type="file"
								name="iconPicker"
								id="iconPicker"
								className="dn"
								onChange={event => onEdit(event, "icon")}
							/>
							{editing || (!icon && isSelf)
								? <label
										htmlFor="iconPicker"
										className={`flex flex-column items-center justify-center w-100 h-100 pointer  bn w-100 h-100 ${icon ? "bg-black-50" : ""}`}
									>

										<svg className="mv2" width="32px" viewBox="0 0 16 12">
											<path
												d="M15,1 L7,1 C7,0.45 6.55,0 6,0 L2,0 C1.45,0 1,0.45 1,1 C0.45,1 0,1.45 0,2 L0,11 C0,11.55 0.45,12 1,12 L15,12 C15.55,12 16,11.55 16,11 L16,2 C16,1.45 15.55,1 15,1 L15,1 Z M6,3 L2,3 L2,2 L6,2 L6,3 L6,3 Z M10.5,10 C8.56,10 7,8.44 7,6.5 C7,4.56 8.56,3 10.5,3 C12.44,3 14,4.56 14,6.5 C14,8.44 12.44,10 10.5,10 L10.5,10 Z M13,6.5 C13,7.88 11.87,9 10.5,9 C9.13,9 8,7.87 8,6.5 C8,5.13 9.13,4 10.5,4 C11.87,4 13,5.13 13,6.5 L13,6.5 Z"
												id="Shape"
												stroke="none"
												fill="#FFF"
												fill-rule="nonzero"
											/>
										</svg>
										<p className="ma0 tc btn white lh-copy pointer bn br1 pv2 ph2 f5 fw6">
											{icon && isSelf
												? "Change your profile photo"
												: "Add a profile photo"}
										</p>
									</label>
								: null}
						</div>
					</div>

					{
						//factor these out into a generic componenet
					}
					<div className="mln2 flex flex-column">
						{editing
							? <input
									className="mv2 pa2 br2 ba b--light-gray tl f4 fw6 near-black"
									style={{ resize: "none" }}
									placeholder="Name"
									onChange={event => onEdit(event, "name")}
									value={name || ""}
								/>
							: <h1 className={`ma2 flex ${online ? "mb1" : null} f4`}>
									{name || "Anonymous"}
									{isFollowing
										? <span>
												<svg
													className="pl1"
													fill={`#${color || "5856D6"}`}
													width="20px"
													viewBox="0 0 17 17"
												>
													<path
														d="M16.67,8.06 L15.59,6.72 C15.42,6.5 15.31,6.24 15.28,5.95 L15.09,4.25 C15.01,3.55 14.46,3 13.76,2.92 L12.06,2.73 C11.76,2.7 11.5,2.57 11.28,2.4 L9.94,1.32 C9.39,0.88 8.61,0.88 8.06,1.32 L6.72,2.4 C6.5,2.57 6.24,2.68 5.95,2.71 L4.25,2.9 C3.55,2.98 3,3.53 2.92,4.23 L2.73,5.93 C2.7,6.23 2.57,6.49 2.4,6.71 L1.32,8.05 C0.88,8.6 0.88,9.38 1.32,9.93 L2.4,11.27 C2.57,11.49 2.68,11.75 2.71,12.04 L2.9,13.74 C2.98,14.44 3.53,14.99 4.23,15.07 L5.93,15.26 C6.23,15.29 6.49,15.42 6.71,15.59 L8.05,16.67 C8.6,17.11 9.38,17.11 9.93,16.67 L11.27,15.59 C11.49,15.42 11.75,15.31 12.04,15.28 L13.74,15.09 C14.44,15.01 14.99,14.46 15.07,13.76 L15.26,12.06 C15.29,11.76 15.42,11.5 15.59,11.28 L16.67,9.94 C17.11,9.39 17.11,8.61 16.67,8.06 L16.67,8.06 Z M7.5,13 L4,9.5 L5.5,8 L7.5,10 L12.5,5 L14,6.55 L7.5,13 L7.5,13 Z"
														id="Shape"
														stroke="none"
													/>
												</svg>
											</span>
										: null}
								</h1>}

						{online
							? <span
									className={
										"pl2 mb2 fw5 nowrap connected f5 flex items-center"
									}
								>
									online
								</span>
							: null}

						<h2 className="mt0 mb2 pl2 mt0 f6 tl fw4 light-silver break-all">
							@<span>{id}</span>
						</h2>

						{editing
							? <Textarea
									className="mb1 pa2 br2 ba b--light-gray tl f6 near-black"
									style={{ resize: "none", minWidth: "9rem" }}
									placeholder="Bio"
									onChange={event => onEdit(event, "bio")}
									value={bio}
								/>
							: bio
									? <p className="pl2 mb2 mt0 w-100 tl lh-copy measure f6 near-black">
											{bio}
										</p>
									: null}

						{editing
							? <input
									className="mb1 pa2 br2 ba b--light-gray tl f6 near-black"
									style={{ resize: "none" }}
									placeholder="Location"
									onChange={event => onEdit(event, "location")}
									value={location}
								/>
							: location
									? <div className="pointer ml2 mv1 f6 near-black flex items-center">
											<svg
												className="mr2 ph05"
												width="12px"
												height="16px"
												viewBox="0 0 12 16"
												fill="#555"
											>
												<path d="M6,0 C2.69,0 0,2.5 0,5.5 C0,10.02 6,16 6,16 C6,16 12,10.02 12,5.5 C12,2.5 9.31,0 6,0 L6,0 Z M6,14.55 C4.14,12.52 1,8.44 1,5.5 C1,3.02 3.25,1 6,1 C7.34,1 8.61,1.48 9.56,2.36 C10.48,3.22 11,4.33 11,5.5 C11,8.44 7.86,12.52 6,14.55 L6,14.55 Z M8,5.5 C8,6.61 7.11,7.5 6,7.5 C4.89,7.5 4,6.61 4,5.5 C4,4.39 4.89,3.5 6,3.5 C7.11,3.5 8,4.39 8,5.5 L8,5.5 Z" />
											</svg>
											<p className="ma0">
												{location}
											</p>
										</div>
									: null}

						{editing
							? <input
									className="mb1 pa2 br2 ba b--light-gray tl f6 near-black"
									style={{ resize: "none" }}
									placeholder="Website"
									onChange={event => onEdit(event, "website")}
									value={website}
								/>
							: website
									? <div className="pointer mh2 mv1 f6 near-black flex items-center">

											<svg
												className="mr2"
												width="15px"
												height="10px"
												viewBox="0 0 15 10"
												fill="#555"
											>

												<path
													d="M3,6 L4,6 L4,7 L3,7 C1.5,7 0,5.31 0,3.5 C0,1.69 1.55,0 3,0 L7,0 C8.45,0 10,1.69 10,3.5 C10,4.91 9.09,6.22 8,6.75 L8,5.59 C8.58,5.14 9,4.32 9,3.5 C9,2.22 7.98,1 7,1 L3,1 C2.02,1 1,2.22 1,3.5 C1,4.78 2,6 3,6 L3,6 Z M12,3 L11,3 L11,4 L12,4 C13,4 14,5.22 14,6.5 C14,7.78 12.98,9 12,9 L8,9 C7.02,9 6,7.78 6,6.5 C6,5.67 6.42,4.86 7,4.41 L7,3.25 C5.91,3.78 5,5.09 5,6.5 C5,8.31 6.55,10 8,10 L12,10 C13.45,10 15,8.31 15,6.5 C15,4.69 13.5,3 12,3 L12,3 Z"
													id="Shape"
													stroke="none"
												/>
											</svg>
											<a
												href={"https://" + website}
												rel="noopener noreferrer"
												target="_blank"
												className="link ma0 mb0 w-100 tl lh-copy measure f6 blue"
												style={{ color: color ? `#${color}` : null }}
											>
												{website}
											</a>
										</div>
									: null}

						{editing
							? <div className="br2 overflow-hidden ba b--light-gray flex items-center bg-white mv1">
									<div
										onClick={event =>
											onEdit({ target: { value: "e7040f" } }, "color")}
										className="pointer h2 w2 bg-dark-red"
									/>
									<div
										onClick={event =>
											onEdit({ target: { value: "ff6300" } }, "color")}
										className="pointer h2 w2 bg-orange"
									/>
									<div
										onClick={event =>
											onEdit({ target: { value: "ffd700" } }, "color")}
										className="pointer h2 w2 bg-yellow"
									/>
									<div
										onClick={event =>
											onEdit({ target: { value: "19a974" } }, "color")}
										className="pointer h2 w2 bg-green"
									/>
									<div
										onClick={event =>
											onEdit({ target: { value: "357edd" } }, "color")}
										className="pointer h2 w2 bg-blue"
									/>
									<div
										onClick={event =>
											onEdit({ target: { value: "5856D6" } }, "color")}
										className="pointer h2 w2 bg-purple"
									/>
									<input
										className="ttu w3 pa2 bn tl f6 near-black"
										style={{
											backgroundColor: color &&
												(color.length === 6 || color.length === 3)
												? `#${color}`
												: null,
											color: color && (color.length === 6 || color.length === 3)
												? "#FFF"
												: null,
											resize: "none"
										}}
										placeholder="#"
										onChange={event => {
											const color = event.target.value;
											const isValidColor = color.length <= 6;
											if (isValidColor) onEdit(event, "color");
										}}
										value={color}
									/>
								</div>
							: null}

						<span className="pl2 mv1 f6 near-black flex items-center">
							<svg
								className="mr2"
								fill={color}
								width="13px"
								height="14px"
								viewBox="0 0 13 14"
							>

								<path
									d="M12,1 L11,1 L11,2.5 C11,2.78 10.78,3 10.5,3 L8.5,3 C8.22,3 8,2.78 8,2.5 L8,1 L5,1 L5,2.5 C5,2.78 4.78,3 4.5,3 L2.5,3 C2.22,3 2,2.78 2,2.5 L2,1 L1,1 C0.45,1 0,1.45 0,2 L0,13 C0,13.55 0.45,14 1,14 L12,14 C12.55,14 13,13.55 13,13 L13,2 C13,1.45 12.55,1 12,1 L12,1 Z M12,13 L1,13 L1,4 L12,4 L12,13 L12,13 Z M4,2 L3,2 L3,0 L4,0 L4,2 L4,2 Z M10,2 L9,2 L9,0 L10,0 L10,2 L10,2 Z M5,6 L4,6 L4,5 L5,5 L5,6 L5,6 Z M7,6 L6,6 L6,5 L7,5 L7,6 L7,6 Z M9,6 L8,6 L8,5 L9,5 L9,6 L9,6 Z M11,6 L10,6 L10,5 L11,5 L11,6 L11,6 Z M3,8 L2,8 L2,7 L3,7 L3,8 L3,8 Z M5,8 L4,8 L4,7 L5,7 L5,8 L5,8 Z M7,8 L6,8 L6,7 L7,7 L7,8 L7,8 Z M9,8 L8,8 L8,7 L9,7 L9,8 L9,8 Z M11,8 L10,8 L10,7 L11,7 L11,8 L11,8 Z M3,10 L2,10 L2,9 L3,9 L3,10 L3,10 Z M5,10 L4,10 L4,9 L5,9 L5,10 L5,10 Z M7,10 L6,10 L6,9 L7,9 L7,10 L7,10 Z M9,10 L8,10 L8,9 L9,9 L9,10 L9,10 Z M11,10 L10,10 L10,9 L11,9 L11,10 L11,10 Z M3,12 L2,12 L2,11 L3,11 L3,12 L3,12 Z M5,12 L4,12 L4,11 L5,11 L5,12 L5,12 Z M7,12 L6,12 L6,11 L7,11 L7,12 L7,12 Z M9,12 L8,12 L8,11 L9,11 L9,12 L9,12 Z"
									id="Shape"
									stroke="none"
								/>
							</svg>
							Joined June 2017
							{
								// todo make this real
							}
						</span>
					</div>
				</div>
			</div>
		);
	}
}
