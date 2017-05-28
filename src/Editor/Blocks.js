import React, { Component } from "react";
import ReactHowler from "react-howler";
import raf from "raf";

export class Image extends Component {
  render() {
    return (
      <img
        className="w-100 mv2 db block"
        alt={this.props.name}
        src={this.props.src}
      />
    );
  }
}

export class Audio extends Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.handleOnLoad = this.handleOnLoad.bind(this);
    this.handleOnEnd = this.handleOnEnd.bind(this);
    this.handleOnPlay = this.handleOnPlay.bind(this);
    this.renderSeekPos = this.renderSeekPos.bind(this);
    this.state = {
      playing: false,
      loaded: false,
      mute: false,
      volume: 1.0
    };
  }

  componentWillUnmount() {
    this.handleOnEnd();
  }

  handleOnLoad() {
    this.setState({
      loaded: true,
      duration: this.refs.player.duration()
    });
    this.renderSeekPos();
  }

  handleOnPlay() {
    this.setState({
      playing: true
    });
    this.renderSeekPos();
  }

  handleOnEnd() {
    this.setState({
      playing: false
    });
    this.clearRAF();
  }

  handleStop() {
    this.refs.player.stop();
    this.setState({
      playing: false // Need to update our local state so we don't immediately invoke autoplay
    });
    this.renderSeekPos();
  }

  handleToggle() {
    this.renderSeekPos();
    this.setState({
      playing: !this.state.playing
    });
  }

  renderSeekPos() {
    this.setState({
      seek: this.refs.player.seek()
    });
    if (this.state.playing) {
      this._raf = raf(this.renderSeekPos);
    }
  }

  clearRAF() {
    raf.cancel(this._raf);
  }

  render() {
    return (
      <div
        onClick={e => {
          e.preventDefault();
          this.handleToggle();
        }}
        className="pointer overflow-hidden block mv2 flex items-center relative cover ba b--light-gray overflow-hidden br2"
      >
        <ReactHowler
          ref="player"
          src={[
            this.props.src,
            this.props.src,
            this.props.src,
            this.props.src,
            this.props.src
          ]}
          format={["x-m4a", "flac", "x-flac", "m4a", "mp3"]}
          playing={this.state.playing}
          download={this.props.name}
          onLoad={this.handleOnLoad}
          onPlay={this.handleOnPlay}
          onEnd={this.handleOnEnd}
        />
        <div className="relative w-100 flex items-center">
          {this.props.pictureBlob || this.props.artwork
            ? <div
                className="flex items-center justify-center h3 w3 cover"
                style={{
                  backgroundImage: `url('${this.props.pictureBlob || "https://ipfs.io/ipfs/" + this.props.artwork}')`
                }}
              />
            : null}
          <div
            className={`f6 mh3 flex-column justify-around light-silver sans-serif ${this.props.pictureBlob || this.props.artwork ? "" : "ma3"}`}
          >
            <span className="db nowrap  lh-title f5 fw6 near-black">
              {this.props.title}
            </span>
            <span className="db lh-copy ">
              {this.props.artist} - {this.props.album} ({this.props.date})
            </span>

          </div>
          <div
            className={`absolute bottom-0 h025 ${this.state.playing ? "bg-bright-blue" : "bg-black-50"}`}
            style={{ width: `${this.state.seek / this.state.duration * 100}%` }}
          />
        </div>

      </div>
    );
  }
}

export class Video extends Component {
  render() {
    return (
      <video controls className="block mv2 w-100 db">
        <source src={this.props.src} />
      </video>
    );
  }
}

export class PDF extends Component {
  render() {
    return (
      <object
        aria-label={this.props.name}
        data={this.props.src}
        width="100%"
        height="486rem"
        type="application/pdf"
      />
    );
  }
}

export class File extends Component {
  render() {
    if (!this.props.name || !this.props.size) return null;
    return (
      <a
        ref="download"
        className="link download near-black block"
        download={this.props.name}
        href={this.props.src}
        onClick={() => {
          this.refs.download.blur();
        }}
      >
        <div className="pointer shadow-0 flex items-center pa3 br2 ba hover-b--moon-gray b--light-gray">
          <svg className="h2 pr3" fill="#111" viewBox="0 0 12 14">

            <path
              d="M8.5,0 L1,0 C0.44771525,0 0,0.44771525 0,1 L0,13 C0,13.5522847 0.44771525,14 1,14 L11,14 C11.5522847,14 12,13.5522847 12,13 L12,3.5 L8.5,0 Z M11,13 L1,13 L1,1 L4,1 L4,2 L5,2 L5,1 L8,1 L11,4 L11,13 L11,13 Z M5,3 L5,2 L6,2 L6,3 L5,3 L5,3 Z M4,3 L5,3 L5,4 L4,4 L4,3 L4,3 Z M5,5 L5,4 L6,4 L6,5 L5,5 L5,5 Z M4,5 L5,5 L5,6 L4,6 L4,5 L4,5 Z M5,7 L5,6 L6,6 L6,7 L5,7 L5,7 Z M4,8.28 C3.38491093,8.63510459 3.00428692,9.2897779 3,10 L3,11 L7,11 L7,10 C7,8.8954305 6.1045695,8 5,8 L5,7 L4,7 L4,8.28 L4,8.28 Z M6,9 L6,10 L4,10 L4,9 L6,9 L6,9 Z"
              id="Shape"
            />

          </svg>
          <div>
            <p className="lh-title mv0 sans-serif fw6 f5">
              {this.props.name}
            </p>
            <p className="sans-serif f6 mv0 lh-copy light-silver">
              {`${(this.props.size / 1000000).toFixed(1)} MB`}
            </p>
          </div>

        </div>
      </a>
    );
  }
}
