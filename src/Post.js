import React, { Component } from "react";

import { Link } from "react-router-dom";
import Markdown from "markdown-to-jsx";

import Clock from "./Clock";

// This should all be automatic
import { Image, Audio, Video, File } from "./Editor/Blocks";
import { IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES } from "./Editor/constants";

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      starred: false
    };
    this.toggleStarred = this.toggleStarred.bind(this);
  }

  render() {
    const { author, content, date, verified, selfIcon } = this.props;

    const iconURL = author ? `url('https://ipfs.io/ipfs/${author.icon}')` : "#";
    const selfIconURL = author
      ? `url('https://ipfs.io/ipfs/${selfIcon}')`
      : "#";

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
                      className: "mv3 f4 lh-title"
                    }
                  },
                  h6: {
                    props: {
                      className: "mv0 f7 lh-title"
                    }
                  },
                  p: {
                    props: {
                      className: `${content.length <= 3 ? "f5 mv0" : "f5 mv2"}`
                    }
                  },
                  a: {
                    props: {
                      className: "link blue break-all"
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
      <article className="mw-post w-100 mv2-ns mv0 bg-white br2-ns ba-ns bb b--light-gray">
        <div className="pa3 fw6 w-100 flex items-start justify-between">
          <div className="h2 w-100 flex items-center">
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
                className="link mv0 mr1 f6 fw6 near-black flex items-center"
              >
                {author.name || "Anonymous"}
                {verified
                  ? <span>
                      <svg
                        className="mtn1 pl1px"
                        fill="#5856D6"
                        width="14px"
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
              </Link>

              <Clock date={date} />
            </div>
          </div>

          <div className="fw6 flex items-center justify-end">

            <button
              ref="reply"
              className="hover-dark-green reply overflow-visible pointer pa0 bg-transparent bn mr3"
              aria-label="Reply"
              onClick={event => {
                this.setState({ replying: !this.state.replying }, () => {
                  if (this.state.replying) this.refs.replyBox.focus();
                });
                // this.refs.reply.blur();
              }}
            >

              <svg fill="#CCC" height="12px" viewBox="0 0 12 11">
                <path
                  d="M6,0.5 L0,5 L6,9.5 L6,6.5 C7.73,6.5 11.14,7.45 12,10.88 C12,6.33 8.94,3.83 6,3.5 L6,0.5 L6,0.5 Z"
                  id="Shape"
                  stroke="none"
                />
              </svg>
            </button>

            <button
              ref="republish"
              className="hover-dark-green republish overflow-visible pointer pa0 bg-transparent bn mr3"
              aria-label="Republish"
              onClick={event => {
                this.refs.republish.blur();
              }}
            >
              <svg viewBox="0 1.25 20 18" height="14px" fill="#CCC">
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

              <svg fill="#CCC" width="12px" height="11px" viewBox="0 0 12 11">
                <path
                  d="M11.2,1 C10.68,0.37 9.95,0.05 9,0 C8.03,0 7.31,0.42 6.8,1 C6.29,1.58 6.02,1.92 6,2 C5.98,1.92 5.72,1.58 5.2,1 C4.68,0.42 4.03,0 3,0 C2.05,0.05 1.31,0.38 0.8,1 C0.28,1.61 0.02,2.28 0,3 C0,3.52 0.09,4.52 0.67,5.67 C1.25,6.82 3.01,8.61 6,11 C8.98,8.61 10.77,6.83 11.34,5.67 C11.91,4.51 12,3.5 12,3 C11.98,2.28 11.72,1.61 11.2,0.98 L11.2,1 Z"
                  id="Shape"
                  stroke="none"
                />
              </svg>
            </button>
          </div>

        </div>

        <div className="content w-100 pb3 ph3-ns">
          {contentElements}
        </div>
        {this.state.replying
          ? <div className="ph3-ns pv3 flex bg-near-white">
              <div
                className="pointer h2 w2 minw2 br2 mr2 cover bg-light-gray"
                style={{ backgroundImage: selfIconURL }}
              />
              <div className="flex items-center pl2 pr1 w-100 bg-white  b--light-gray bw-5 ba br2">
                <input
                  ref="replyBox"
                  type="text"
                  placeholder={`Reply to ${author.name} (not working yet)`}
                  className="replyBox bg-white br2 f6 serif bn w-100 "
                />
                <button className="bn pointer f7 fw6 pv1 ph2 br2 white bg-bright-blue">
                  Reply
                </button>
              </div>
            </div>
          : null}
      </article>
    );
  }

  toggleStarred() {
    this.setState({ starred: !this.state.starred });
  }
}

export default Post;
