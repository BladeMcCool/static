import React, { Component } from "react";
import "./App.css";

import { BrowserRouter as Router, Route } from "react-router-dom";

import async from "async-es";
import format from "date-fns/format";
// import Metascraper from "metascraper";

import AutosizeInput from "react-input-autosize";

import Home from "./Home";
import Header from "./Header";
import Post from "./Post";

import { IMAGE_TYPES, AUDIO_TYPES } from "./Editor/constants";

// import IPFS from "ipfs";
const node = new window.Ipfs({
  EXPERIMENTAL: {
    pubsub: true,
    dht: true
  }
});

function rand(items) {
  return items[~~(Math.random() * items.length)];
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.publish = this.publish.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.setIcon = this.setIcon.bind(this);
    this.setBackground = this.setBackground.bind(this);

    const name = localStorage.getItem("name");
    const icons = [
      "QmSgU5UrnPgZ1YdkwbtmU6gPZ4ULhbX9MukjVnvPrM8WEj",
      "QmXmFMmaNurZZ95NSn5WNBpwoNy8U5MjNj3SvsdsZK5PNQ",
      "QmNSqqvYRvCgzRd1UMcGPwYuSFRW9vCpW6mtUMe6oW9muU",
      "QmYNBRkrP4kwQVRmPSaaSEVUg3NXArA63v5d9J68UfJMg6",
      "QmSYUjoh5ptNiL2ZKkmADjweHC7FbRWo9ZVLjFjWKWSQ1G",
      "Qmf9ETausmHGse2BGjwZBX4QB7iMHR8QsMsubqNTeR8odQ"
    ];

    const version = 2;
    // Obviously make a migration procedure in the future
    if (version > localStorage.getItem("version")) {
      localStorage.removeItem("posts");
      localStorage.removeItem("profiles");
    }

    localStorage.setItem("version", version);

    const id = localStorage.getItem("id");

    const icon = localStorage.getItem("icon") || rand(icons);
    if (!localStorage.getItem("icon")) localStorage.setItem("icon", icon);

    const canopy = localStorage.getItem("canopy");
    const description = localStorage.getItem("description") || "";

    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const profiles = JSON.parse(localStorage.getItem("profiles")) || {};

    this.state = {
      id,
      name,
      icon,
      posts,
      canopy,
      description,
      profiles,
      peers: []
    };

    const t = this;

    console.log(node);

    node
      .on("start", () => {
        node.pubsub.subscribe("static.network", this.handleMessage);
        this.updatePeerCount();
        setInterval(this.updatePeerCount.bind(this), 1000);
        node
          .id()
          .then(id => {
            console.log(id);
            this.setState({ id: id.id });
            localStorage.setItem("id", id.id);

            if (
              !localStorage.getItem("profiles") ||
              localStorage.getItem("profiles") === {}
            ) {
              let newProfiles = {};
              newProfiles[id.id] = {
                id: id.id,
                name: this.state.name || "Anonymous",
                icon: this.state.icon,
                canopy: this.state.canopy
              };
              t.setState({ profiles: newProfiles });
              localStorage.setItem("profiles", JSON.stringify(newProfiles));
            }
          })
          .catch(err => console.error(err));
      })
      .on("error", error => {
        t.setState({ error });
      });
  }

  updatePeerCount() {
    node.swarm
      .peers()
      .then(peers => {
        if (peers.length !== this.state.peers.length)
          this.setState({ peers: peers });
      })
      .catch(err => console.error(err));
  }

  getInitialState() {
    return;
  }

  handleMessage(msg) {
    // TODO first make sure data is correct length of hash!!
    const hash = msg.data.toString();

    node.files.cat(hash, (err, stream) => {
      var res = "";

      stream.on("data", chunk => {
        res += chunk.toString();
      });

      stream.on("error", err => {
        console.error("Error - ipfs files cat ", err);
      });

      stream.on("end", () => {
        let post;
        try {
          post = JSON.parse(res);
        } catch (err) {
          return console.error("Could not parse post", err);
        }

        const { author } = post;
        // if (this.state.profiles[author.id]) {
        // const localProfile = this.state.profiles[author.id];
        // display a warning if a trusted user has changed their name
        // if (author !== localProfile) {
        //   post.warning = true;
        // }
        // } else {

        // !!! DANGEROUS !!! SAFETY CHECKS NEEDED
        let newProfiles = this.state.profiles;
        newProfiles[author.id] = author;
        this.setState({ profiles: newProfiles });

        // }
        this.setState({ posts: [post, ...this.state.posts] });
        localStorage.setItem("posts", JSON.stringify(this.state.posts));
        localStorage.setItem("profiles", JSON.stringify(this.state.profiles));
      });
    });
  }

  toggleEditor(event) {
    this.setState({
      showEditor: !this.state.showEditor
    });
  }

  publish(blocks) {
    // close editor immediately.. show publishing feedback live in stream
    this.toggleEditor();

    const addBuffer = (buffer, cb) => {
      node.files.add(buffer, function(err, res) {
        if (err || res === null || res.length === 0) {
          cb(err);
          return;
        }
        const hash = res.pop().hash;
        cb(null, hash);
      });
    };

    const block2buffer = (block, cb) => {
      if (!block) {
        return cb("Block is null.");
      }
      if (block.file) {
        const reader = new FileReader();
        reader.onload = () => {
          cb(null, new Buffer(reader.result));
        };
        reader.readAsArrayBuffer(block.file);
      } else if (block.text != null) {
        cb(null, new Buffer(block.text));
      } else {
      }
    };

    const addBlock = (block, cb) => {
      block2buffer(block, (err, buffer) => {
        if (err) {
          cb(err);
          return;
        }
        addBuffer(buffer, (err, hash) => {
          if (block.type === "text")
            cb(null, {
              type: block.type,
              text: block.text
            });
          else if (AUDIO_TYPES.indexOf(block.type) !== -1) {
            if (block.picture) {
              node.files.add(new Buffer(block.picture[0].data), (err, res) => {
                cb(null, {
                  title: block.title,
                  artist: block.artist,
                  album: block.album,
                  date: block.date,
                  artwork: res[0].hash,
                  // also duration!
                  type: block.type,
                  name: block.name,
                  size: block.size,
                  hash
                });
              });
            } else
              cb(null, {
                title: block.title,
                artist: block.artist,
                album: block.album,
                date: block.date,
                // also duration!
                type: block.type,
                name: block.name,
                size: block.size,
                hash
              });
          } else
            cb(null, {
              type: block.type,
              name: block.name,
              size: block.size,
              hash
            });
        });
      });
    };

    const addContent = (blocks, cb) => {
      async.map(blocks, addBlock, (err, content) => {
        if (err) {
          cb(err);
          return;
        }

        cb(null, content);
      });
    };

    const pub = content => {
      node.files.add(
        new Buffer(
          JSON.stringify({
            author: {
              id: this.state.id,
              name: this.state.name || "Anonymous",
              icon: this.state.icon,
              canopy: this.state.canopy,
              description: this.state.description
            },
            content: content,
            date_published: format(
              new Date(Date.now()),
              "YYYY-MM-DDTHH:mm:ss.SSSZ"
            )
          })
        ),
        (err, res) => {
          if (err || !res) {
            console.error("Did not add the IPFS file.", err);
          } else {
            res.forEach(file => {
              node.pubsub.publish(
                "static.network",
                new Buffer(file.hash),
                (err, res) => {
                  if (err) console.error(err);
                }
              );
            });
          }
        }
      );
    };

    addContent(blocks, (err, res) => {
      if (err) console.error(err);
      else {
        pub(res);
      }
    });
  }

  toggleEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ edit: !this.state.edit });
  }

  toggleFollow(id) {
    if (!this.state.profiles[id])
      return console.error("Excpected peer in locall db");

    let newProfiles = this.state.profiles;
    newProfiles[id].following = !newProfiles[id].following;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  setBackground(event) {
    const files = event.target.files || event.dataTransfer.files;
    if (!files || files.length !== 1) return;
    const reader = new FileReader();
    const t = this;
    reader.onload = () => {
      node.files.add(new Buffer(reader.result), function(err, res) {
        if (err || res === null || res.length === 0) {
          return console.error(err);
        }
        const hash = res.pop().hash;
        t.setState({ canopy: hash });
        localStorage.setItem("canopy", hash);

        let newProfiles = t.state.profiles;
        newProfiles[t.state.id].canopy = hash;
        t.setState({ profiles: newProfiles });
        localStorage.setItem("profiles", JSON.stringify(newProfiles));
      });
    };
    if (IMAGE_TYPES.indexOf(files[0].type) === -1) return;
    reader.readAsArrayBuffer(files[0]);
  }

  setIcon(event) {
    const files = event.target.files || event.dataTransfer.files;
    if (!files || files.length !== 1) return;
    const reader = new FileReader();
    const t = this;
    reader.onload = () => {
      node.files.add(new Buffer(reader.result), function(err, res) {
        if (err || res === null || res.length === 0) {
          return console.error(err);
        }
        const hash = res.pop().hash;
        t.setState({ icon: hash });
        localStorage.setItem("icon", hash);

        let newProfiles = t.state.profiles;
        newProfiles[t.state.id].icon = hash;
        t.setState({ profiles: newProfiles });
        localStorage.setItem("profiles", JSON.stringify(newProfiles));
      });
    };
    if (IMAGE_TYPES.indexOf(files[0].type) === -1) return;
    reader.readAsArrayBuffer(files[0]);
  }

  handleDragOver() {
    // this.refs.editor.focus();
  }

  handleDragLeave() {
    // this.refs.editor.blur();
    // this.refs.editor.hideBackdrop();
  }

  handleNameEdit(event) {
    this.setState({ name: event.target.value });
    localStorage.setItem("name", event.target.value);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].name = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  render() {
    const { peers, profiles, posts, name, icon, id } = this.state;
    return (
      <Router>
        <div
          onDragOver={this.handleDragOver.bind(this)}
          onDragLeave={this.handleDragLeave.bind(this)}
        >
          <Header
            connectionError={this.state.error}
            peerCount={peers.length}
            name={name}
            icon={icon}
            id={id}
            onToggleEditor={this.toggleEditor}
            setIcon={this.setIcon}
            onNameEdit={this.handleNameEdit.bind(this)}
          />
          <Route
            exact
            path="/"
            render={props => {
              return (
                <Home
                  peerCount={peers.length}
                  posts={posts}
                  profiles={profiles}
                  connectionError={this.state.error}
                  onPublish={this.publish}
                  icon={icon}
                  id={id}
                  name={name}
                />
              );
            }}
          />
          <Route
            path="/@:id"
            render={({ match }) =>
              (this.state.profiles[match.params.id]
                ? <div>

                    <input
                      disabled={
                        !this.state.edit && match.params.id === this.state.id
                      }
                      type="file"
                      name="backgroundPicker"
                      id="backgroundPicker"
                      className="dn"
                      onChange={this.setBackground}
                    />
                    <input
                      type="file"
                      name="iconPicker"
                      id="iconPicker"
                      className="dn"
                      onChange={this.setIcon}
                    />

                    <label
                      htmlFor="backgroundPicker"
                      className={
                        this.state.edit && match.params.id === this.state.id
                          ? "pointer"
                          : ""
                      }
                    >
                      <div
                        className={
                          this.state.profiles[match.params.id] &&
                            this.state.profiles[match.params.id].canopy
                            ? "pa3  w-100 h5-ns h4 bg-light-gray cover bg-center"
                            : "pa3  w-100 h4 bg-near-black cover bg-center"
                        }
                        style={{
                          height: (this.state.edit &&
                            match.params.id === this.state.id) ||
                            (this.state.profiles[match.params.id] &&
                              this.state.profiles[match.params.id].canopy)
                            ? "16rem"
                            : "8rem",
                          backgroundImage: this.state.profiles[
                            match.params.id
                          ] && this.state.profiles[match.params.id].canopy
                            ? `url('https://ipfs.io/ipfs/${this.state.profiles[match.params.id].canopy}`
                            : "none"
                        }}
                      >

                        <div className="flex justify-end items-start">
                          {match.params.id === this.state.id
                            ? this.state.edit &&
                                match.params.id === this.state.id
                                ? // if user profile, show edit button
                                  <div>
                                    <button
                                      onClick={this.toggleEdit.bind(this)}
                                      className="btn mr3 pointer bg-white near-black near-black bn br1 pv2 ph3 f6 fw6"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={this.toggleEdit.bind(this)}
                                      className="btn pointer bg-white bright-blue near-black bn br1 pv2 ph3 f6 fw6"
                                    >
                                      Save
                                    </button>
                                  </div>
                                : <button
                                    onClick={this.toggleEdit.bind(this)}
                                    className="btn pointer bg-white near-black bn br1 pv2 ph3 f6 fw6"
                                  >
                                    Edit profile
                                  </button>
                            : // or just the follow button
                              <button
                                onClick={() =>
                                  this.toggleFollow(match.params.id)}
                                className="btn pointer bg-white near-black bn br1 pv2 ph3 f6 fw6"
                              >
                                {this.state.profiles[match.params.id] &&
                                  this.state.profiles[match.params.id].following
                                  ? "Following"
                                  : "Follow"}
                              </button>}
                        </div>
                        {this.state.edit && match.params.id === this.state.id
                          ? <p className="pt4 f4 fw6 tc center white">
                              {this.state.profiles[match.params.id] &&
                                this.state.profiles[match.params.id].canopy
                                ? "Change your background photo"
                                : "Add a background photo"}
                            </p>
                          : null}

                      </div>

                    </label>

                    <div
                      className="mtn5 flex items-center justify-center center ba b--white bw1 h4 w4 minw4 br2 cover bg-light-gray"
                      style={{
                        backgroundImage: this.state.profiles[match.params.id]
                          ? `url('https://ipfs.io/ipfs/${this.state.profiles[match.params.id].icon}`
                          : "none"
                      }}
                    >
                      {this.state.edit && match.params.id === this.state.id
                        ? <label
                            htmlFor="iconPicker"
                            className={
                              this.state.edit &&
                                match.params.id === this.state.id
                                ? "flex items-center justify-center w-100 h-100 pointer bg-black-50 bn w-100 h-100"
                                : ""
                            }
                          >

                            <p className="tc btn white  pointer bn br1 pv2 ph2 f6 fw6">
                              {"Add a profile photo"}
                            </p>

                          </label>
                        : null}
                    </div>

                    <div className="center tc ph3">
                      <div className="mv2 center flex items-center justify-center">

                        <h1 className="flex items-center  mv0 link f4 fw6 near-black">
                          <AutosizeInput
                            className="name nowrap ma0 input bn f4 fw6 near-black"
                            type="text"
                            inputStyle={{
                              padding: 0,
                              borderRadius: "0.25rem",
                              paddingTop: "0.25rem",
                              paddingBottom: "0.25rem",
                              paddingLeft: "0.5rem",

                              paddingRight: this.state.edit &&
                                match.params.id === this.state.id
                                ? "0.5rem"
                                : "0",
                              fontSize: "1.25rem",
                              border: this.state.edit &&
                                match.params.id === this.state.id
                                ? "1px solid #EEEEEE"
                                : "none",
                              backgroundColor: this.state.edit &&
                                match.params.id === this.state.id
                                ? "white"
                                : "transparent",
                              fontWeight: 600
                            }}
                            disabled={
                              !this.state.edit &&
                                match.params.id !== this.state.id
                            }
                            onChange={this.handleNameEdit.bind(this)}
                            placeholder="Anonymous"
                            value={
                              this.state.edit &&
                                match.params.id === this.state.id
                                ? this.state.name
                                : this.state.profiles[match.params.id].name
                            }
                          />

                          {!this.state.edit &&
                            match.params.id !== this.state.id &&
                            ((this.state.profiles[match.params.id] &&
                              this.state.profiles[match.params.id].following) ||
                              match.params.id === id)
                            ? <span>
                                <svg
                                  className="pb1"
                                  fill="#5856D6"
                                  width="18px"
                                  height="18px"
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
                        </h1>
                      </div>

                      <h2 className="mv2 f6 fw4 lh-copy silver break-all">
                        @
                        <span className="nowrap">
                          {match.params.id.substr(0, 23)}
                        </span>
                        <span className="nowrap">
                          {match.params.id.substr(23, 23)}
                        </span>
                      </h2>

                      <p className="measure tc mv2 center f6 fw4 lh-copy near-black">
                        {this.state.profiles[match.params.id].description}
                      </p>

                    </div>
                    <div className="mt4 mb5">
                      {posts
                        .filter(post => post.author.id === match.params.id)
                        .map(post => {
                          return (
                            <Post
                              key={post.author.id + post.date_published}
                              author={profiles[post.author.id]}
                              content={post.content}
                              date_published={post.date_published}
                            />
                          );
                        })}
                    </div>
                  </div>
                : <div className="bg-bright-blue pa3 flex items-center justify-center">
                    <span className="white bg-bright-blue wrap-all">
                      This will work when js-ipfs supports ipns...
                    </span>
                  </div>)}
          />

        </div>
      </Router>
    );
  }
}
