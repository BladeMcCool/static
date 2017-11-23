import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import { Link } from "react-router-dom";
import Markdown from "markdown-to-jsx";

import Clock from "./Clock";

// This should all be automatic
import { Image, Audio, Video, File, PDF } from "./Editor/Blocks";
import {
  IMAGE_TYPES,
  AUDIO_TYPES,
  VIDEO_TYPES,
  PDF_TYPES
} from "./Editor/constants";

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // this belongs in a backdrop component
  showBackdrop() {
    if (!this.state.showBackdrop) this.setState({ showBackdrop: true });
  }

  hideBackdrop() {
    if (this.state.showBackdrop)
      this.setState({ showBackdrop: false, replying: !this.state.replying });
  }

  toggleBackdrop() {
    this.setState({ showBackdrop: !this.state.showBackdrop });
  }

  render() {
    const { author, content, date, verified, hash, onLike } = this.props;

    const iconURL = author && author.icon
      ? `url('https://ipfs.io/ipfs/${author.icon}')`
      : "#";

    let i = 0;
    const contentElements = content.map(block => {
      if (block.type === "text" && block.text !== "")
        return (
          <div
            key={block.text.substr(0, 256) + i++}
            className="block f5 ph0-ns ph3 serif near-black lh-copy"
          >
            <Markdown
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
                      className: "mv2 f7 lh-title"
                    }
                  },
                  p: {
                    props: {
                      className: "f5 mv2"
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

      if (PDF_TYPES.indexOf(block.type) !== -1)
        return (
          <PDF key={block.hash} src={"https://ipfs.io/ipfs/" + block.hash} />
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
      <div className="z-5 flex overflow-auto">
        <ReactCSSTransitionGroup
          transitionName="editor"
          transitionEnterTimeout={333}
          transitionLeaveTimeout={333}
        >
          {this.state.showBackdrop
            ? <div
                onClick={this.hideBackdrop.bind(this)}
                className=" z-5 backdrop left-0 right-0 bottom-0 top-0 bg-black-90 blurred"
              />
            : null}
        </ReactCSSTransitionGroup>
        <article
          className={`${this.state.showBackdrop ? "editor" : null} z-6 mw-post-ns w-100 mh2-ns mt2-ns mv0 bg-white br2-ns ba-ns bb b--light-gray`}
        >
          <div className="pa3 fw6 w-100 flex items-start justify-between">
            <div className="h2 w-100 flex items-center">
              <Link
                to={`/@${author.id}`}
                className="link mv0 mr1 f6 fw6 near-black flex flex-row items-start"
              >
                <div
                  className="h2 w2 br2 overflow-hidden bg-light-gray"
                  style={{
                    backgroundColor: author.color ? `#${author.color}` : "#111"
                  }}
                >
                  <div
                    className="h-100 w-100 cover bg-center"
                    style={{
                      backgroundImage: author.icon ? iconURL : null
                    }}
                  />
                </div>
              </Link>
              <div className="ml1">
                <Link
                  to={`/@${author.id}`}
                  className="link mv0 mr1 f6 fw6 near-black flex items-center"
                >
                  {author.name || "Anonymous"}
                  {verified
                    ? <span>
                        <svg
                          className="mtn1 pl1px"
                          fill={`#${author.color || "5856D6"}`}
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
                <Link
                  to={`/p/${hash}`}
                  className="link mv0 mr1 f6 fw6 near-black"
                >
                  <Clock date={date} />
                </Link>
              </div>
            </div>

            <div className="svg-hover-near-black flex items-start justify-end">
              <button className="pointer pa0 ma0 bn bg-transparent flex items-start">
                <svg fill="#B5B5B5" width="12px" viewBox="0 4 10 7">
                  <g
                    id="chevron-down"
                    stroke="none"
                    strokeWidth="1"
                    transform="translate(0.000000, 4.000000)"
                  >
                    <path
                      d="M5.70577316,6.29422684 C5.31598541,6.68401459 4.68722761,6.68722761 4.29422684,6.29422684 L0.70577316,2.70577316 C0.315985407,2.31598541 0.31811142,1.68188858 0.706077039,1.29392296 L0.793922961,1.20607704 C1.18387854,0.816121458 1.81060165,0.832787484 2.18314392,1.23193992 L5,4.25 L7.81685608,1.23193992 C8.19414605,0.827700662 8.81811142,0.81811142 9.20607704,1.20607704 L9.29392296,1.29392296 C9.68387854,1.68387854 9.68722761,2.31277239 9.29422684,2.70577316 L5.70577316,6.29422684 Z"
                      id="Shape"
                    />
                  </g>
                </svg>
              </button>
            </div>

            <div className="dni fw6 flex items-start justify-end">

              <button
                ref="reply"
                className="hover-dark-green reply overflow-visible pointer pa0 bg-transparent bn mr3"
                aria-label="Reply"
                onClick={event => {
                  this.setState({ replying: !this.state.replying }, () => {
                    if (this.state.replying) this.refs.replyBox.focus();
                    this.toggleBackdrop();
                  });
                  // this.refs.reply.blur();
                }}
              >
                {
                  <svg fill="#CCC" height="12px" viewBox="0 0 12 11">
                    <path
                      d="M12,3 L11.9986415,5.98630331 C11.9700012,6.77999878 11.6600037,7.47000122 11.06,8.05999756 C10.4599963,8.6499939 9.77999878,8.92582761 9,8.99862841 L3,8.99862841 C2.22050271,8.92445602 1.43950095,8.44021385 0.940002441,7.95442174 C0.44050393,7.46862963 0.0305002678,6.77862719 6.4780357e-14,6.03999996 L2,5 C2,5 2,6.05788979 2,6.01418481 C2,6.17999983 2.09999466,6.49000025 2.30999756,6.69000006 C2.52000046,6.88999987 2.73051247,6.9786394 3,6.99862841 L9,6.99862841 C9.2704905,6.9786394 9.48001099,6.89138624 9.69,6.69000244 C9.89998901,6.48861864 9.99295252,6.26998901 10.019647,6.01418481 L10,3 C9.99,2.73 9.9,2.51001465 9.69,2.31 C9.48,2.10998535 9.27,2.02 9,2 L3,2 C2.73001099,2.01998901 2.52000046,2.10998535 2.30999756,2.31 C2.09999466,2.51001465 2,2.81663405 2,3 L2,4.99640341 C2,5.04051208 1.58697024,5.18544526 0.995034353,5.4967421 C0.403098469,5.80803893 7.96122427e-15,6.03999996 7.96122427e-15,6.03999996 C-9.95153034e-15,6.5 7.96122427e-15,3 7.96122427e-15,3 C0.0305002678,2.22000122 0.44050393,1.52999878 0.940002441,0.940002441 C1.43950095,0.350006104 2.22050271,0.0299987793 3,0 L9,0 C9.77999878,0.03 10.46,0.35 11.06,0.94 C11.66,1.53 11.97,2.22 12,3 Z M4,9 L7,9 L4,11 L4,9 Z"
                      id="Combined-Shape"
                      stroke="none"
                    />
                  </svg>
                }

              </button>

              <button
                ref="republish"
                className="hover-dark-green republish overflow-visible pointer pa0 bg-transparent bn mr3"
                aria-label="Republish"
                onClick={event => {
                  this.refs.republish.blur();
                }}
              >

                <svg fill="#CCC" height="12px" viewBox="0 0 18 11">
                  <path
                    d="M4,3.00277973 C4.02,2.73277973 4.11,2.52277973 4.31,2.31277973 C4.51,2.10277973 4.73,2.01277973 5,2.00277973 L8,2.00277973 C8.5,2.00277973 9.00152576,1.50336615 9.00366211,1.00747944 C9.00579846,0.511592738 8.5,0.00277973491 8,0.00277973491 L5,0.00277973491 C4.22,0.0327797349 3.53,0.342779735 2.94,0.942779735 C2.35,1.54277973 2.03,2.22277973 2,3.00277973 L2,8.00277973 L-1.77635684e-15,8.00277973 L3,11.0027797 L6,8.00277973 L4,8.00277973 L4,3.00277973 Z M11.0008891,11 C11.7808891,10.97 12.4708891,10.66 13.0608891,10.06 C13.6508891,9.46 13.9708891,8.78 14.0008891,8 L14.0008891,3 L16.0008891,3 L13.0008891,3.6739404e-16 L10.0008891,3 L12.0008891,3 L12.0008891,8 C11.9808891,8.27 11.8908891,8.48 11.6908891,8.69 C11.4908891,8.9 11.2708891,8.99 11.0008891,9 L7.96088916,9 C7.5041606,9 7.00277973,9.49692383 7.00277973,10 C7.00277973,10.5030762 7.50132857,11 8.00088912,11 L11.0008891,11 Z"
                    stroke="none"
                    transform="translate(8.000445, 5.501390) scale(-1, 1) translate(-8.000445, -5.501390) "
                  />
                </svg>
              </button>

              <button
                ref="star"
                className="flex items-center f6 star pointer overflow-visible pa0 bg-transparent bn"
                aria-label="Star"
                onClick={event => {
                  if (onLike) onLike();
                  this.refs.star.blur();
                }}
              >
                <svg fill="#CCC" height="12px" viewBox="0 0 12 11">
                  <path
                    d="M11.2,1 C10.68,0.37 9.95,0.05 9,0 C8.03,0 7.31,0.42 6.8,1 C6.29,1.58 6.02,1.92 6,2 C5.98,1.92 5.72,1.58 5.2,1 C4.68,0.42 4.03,0 3,0 C2.05,0.05 1.31,0.38 0.8,1 C0.28,1.61 0.02,2.28 0,3 C0,3.52 0.09,4.52 0.67,5.67 C1.25,6.82 3.01,8.61 6,11 C8.98,8.61 10.77,6.83 11.34,5.67 C11.91,4.51 12,3.5 12,3 C11.98,2.28 11.72,1.61 11.2,0.98 L11.2,1 Z"
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
            ? <div className="ph3-ns pv3 pt0 flex flex-column items-end bg-near-white">
                <div className="bg-white flex items-center w-100 bg-white b--light-gray bw-5 ba br2">
                  <input
                    ref="replyBox"
                    type="text"
                    placeholder={`Reply to ${author.name}`}
                    className="replyBox pa2 bg-transparent br2 f6 serif bn w-100 "
                  />
                </div>
                <button className="mt3 bn pointer f6 fw6 pv2 ph3 br2 white bg-bright-blue">
                  Reply
                </button>
              </div>
            : null}
        </article>
      </div>
    );
  }
}

export default Post;
