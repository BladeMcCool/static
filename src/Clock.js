import React, { Component } from "react";

import moment from "moment";
moment.updateLocale("en", {
	relativeTime: {
		future: "in %s",
		past: "%s",
		s: "%ds",
		m: "1m",
		mm: "%dm",
		h: "1h",
		hh: "%dh",
		d: "1d",
		dd: "%dd",
		M: "1m",
		MM: "%dm",
		y: "1y",
		yy: "%dy"
	}
});

export default class Clock extends Component {
	constructor(props) {
		super(props);
		this.state = { date: new Date(props.date) };
	}

	componentDidMount() {
		this.timerID = setInterval(() => this.tick(), 1000);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	tick() {
		this.setState({
			date: new Date()
		});
	}

	render() {
		return (
			<time className="pointer f6 fw4 silver" dateTime={this.props.date}>
				{moment.unix(this.props.date / 1000).fromNow()}
			</time>
		);
	}
}
