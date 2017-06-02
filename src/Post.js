import React, { Component } from "react";

import { Link } from "react-router-dom";
import Markdown from "markdown-to-jsx";
import moment from "moment";

// This should all be automatic
import { Image, Audio, Video, File } from "./Editor/Blocks";
import { IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES } from "./Editor/constants";

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

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starred: false
    };
    this.toggleStarred = this.toggleStarred.bind(this);
  }

  render() {
    const { author, content, date_published } = this.props;
    const iconURL = `url('https://ipfs.io/ipfs/${author.icon}')`;

    const contentElements = content.map(block => {
      if (block.type === "text" && block.text !== "")
        return (
          <div
            key={block.text.substr(0, 256)}
            className="block f5 ph0-ns ph3 serif near-black lh-copy"
          >
            <Markdown
              key={block.text.substr(0, 256)}
              className="f5 ph0-ns ph3 serif near-black lh-copy"
              options={{
                escapeHtml: true,
                overrides: {
                  h1: {
                    props: {
                      className: "mv0 f4 lh-title"
                    }
                  },
                  h6: {
                    props: {
                      className: "mv0 f7 lh-title"
                    }
                  },
                  a: {
                    props: {
                      className: "link blue"
                    }
                  }
                }
              }}
            >
              {block.text}
            </Markdown>
          </div>
        );
      if (IMAGE_TYPES.indexOf(block.type) !== -1)
        return (
          <Image key={block.hash} src={"https://ipfs.io/ipfs/" + block.hash} />
        );
      if (AUDIO_TYPES.indexOf(block.type) !== -1) {
        return (
          <Audio
            key={block.hash}
            title={block.title}
            artist={block.artist}
            album={block.album}
            artwork={block.artwork}
            date={block.date}
            src={"https://ipfs.io/ipfs/" + block.hash}
          />
        );
      }
      if (VIDEO_TYPES.indexOf(block.type) !== -1)
        return (
          <Video key={block.hash} src={"https://ipfs.io/ipfs/" + block.hash} />
        );
      if (block.type !== "text")
        return (
          <File
            key={block.hash}
            name={block.name}
            size={block.size}
            src={"https://ipfs.io/ipfs/" + block.hash}
            download={true}
          />
        );
      return null;
    });

    return (
      <article className="post center mv2-ns mv0 bg-white br2-ns ba-ns bb b--light-gray">
        <div className="pa3 fw6 w-100 flex items-start justify-between">
          <div className="h2 flex items-center">
            <Link
              to={`/@${author.id}`}
              className="link mv0 mr1 f6 fw6 near-black flex flex-row items-start"
            >
              <div
                className="pointer h2 w2 br2 cover bg-light-gray"
                style={{ backgroundImage: iconURL }}
              />
            </Link>
            <div className="ml2">
              <Link
                to={`/@${author.id}`}
                className="link mv0 mr1 f6 fw6 near-black flex flex-row items-start"
              >
                {author.name}
              </Link>

              <time className="pointer f6 fw4 silver" dateTime="999999">
                {moment(this.props.date_published).fromNow()}
              </time>
            </div>
          </div>

          <div className="fw6 flex items-center justify-end">

            <button
              ref="republish"
              className="hover-dark-green republish overflow-visible pointer pa0 bg-transparent bn mr3"
              aria-label="Republish"
              onClick={event => {
                this.refs.republish.blur();
              }}
            >
              <svg viewBox="0 .5 20 18" className="h1" fill="#AAA">
                <path d="M5,13V8h2L3.5,4L0,8h2v6c0,1.104,0.895,2,2,2h9.482l-2.638-3H5z M9.156,7L6.518,4H16c1.104,0,2,0.897,2,2v6h2l-3.5,4L13,12h2V7H9.156z" />
              </svg>
            </button>
            <button
              ref="star"
              className="star pointer overflow-visible pa0 bg-transparent bn"
              aria-label="Star"
              onClick={event => {
                this.toggleStarred();
                this.refs.star.blur();
              }}
            >
              <svg
                className="w1 h1"
                viewBox="0 0 14 13"
                fill={this.state.starred ? "#FFB700" : "#AAA"}
              >
                <polygon
                  stroke="none"
                  fillRule="nonzero"
                  points="14 5 9.1 4.36 7 0 4.9 4.36 0 5 3.6 8.26 2.67 13 7 10.67 11.33 13 10.4 8.26"
                />
              </svg>
            </button>
          </div>

        </div>

        <div className="content w-100 pb3 ph3-ns">
          {contentElements}
        </div>
      </article>
    );
  }

  toggleStarred() {
    this.setState({ starred: !this.state.starred });
  }
}

export default Post;
