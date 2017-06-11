import React, { Component } from "react";
import "./App.css";

import { Link, BrowserRouter as Router, Route } from "react-router-dom";

import async from "async-es";
import format from "date-fns/format";
// import Metascraper from "metascraper";

// import isIPFS from "is-ipfs";

import Home from "./Home";
import Header from "./Header";
import Post from "./Post";

import { IMAGE_TYPES, AUDIO_TYPES } from "./Editor/constants";

import Textarea from "react-textarea-autosize";

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

    const version = 5;
    // Obviously make a migration procedure in the future
    if (version > localStorage.getItem("version")) {
      if (version === 5) {
        localStorage.removeItem("following");
      } else if (version === 3) {
        localStorage.removeItem("posts");
      } else {
        localStorage.removeItem("posts");
        localStorage.removeItem("profiles");
      }
    }

    localStorage.setItem("version", version);

    const id = localStorage.getItem("id");

    const icon = localStorage.getItem("icon") || rand(icons);
    if (!localStorage.getItem("icon")) localStorage.setItem("icon", icon);

    const canopy = localStorage.getItem("canopy");
    const bio = localStorage.getItem("bio") || "";

    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
    const following = JSON.parse(localStorage.getItem("following")) || {};

    this.state = {
      id,
      name,
      icon,
      posts,
      canopy,
      bio,
      profiles,
      following,
      peers: []
    };

    console.log(this.state);

    const t = this;

    node
      .on("start", () => {
        node.pubsub.subscribe("static.network", this.handleMessage);
        this.updatePeerCount();
        setInterval(this.updatePeerCount.bind(this), 1000);
        node
          .id()
          .then(id => {
            this.setState({ id: id.id });
            localStorage.setItem("id", id.id);

            if (
              !localStorage.getItem("profiles") ||
              localStorage.getItem("profiles") === {}
            ) {
              let newProfiles = {};
              newProfiles[id.id] = {
                id: id.id,
                name: this.state.name,
                icon: this.state.icon,
                canopy: this.state.canopy,
                following: {}
              };
              t.setState({ profiles: newProfiles });
              localStorage.setItem("profiles", JSON.stringify(newProfiles));
            }
          })
          .catch(err => console.error(err));
      })
      .on("error", error => {
        node
          .id()
          .then(id => {
            this.setState({ id: id.id });
            localStorage.setItem("id", id.id);
            if (
              !localStorage.getItem("profiles") ||
              localStorage.getItem("profiles") === {}
            ) {
              let newProfiles = {};
              newProfiles[id.id] = {
                id: id.id,
                name: this.state.name,
                icon: this.state.icon,
                canopy: this.state.canopy,
                following: {}
              };
              t.setState({ profiles: newProfiles });
              localStorage.setItem("profiles", JSON.stringify(newProfiles));
            }
          })
          .catch(err => console.error(err));

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

  handleHash(hash) {
    // Ignore posts we have seen
    if (this.postByHash(hash).length) return;

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

        const { author, previous } = post;

        post.hash = hash;

        // if (this.state.profiles[author.id]) {
        // const localProfile = this.state.profiles[author.id];
        // display a warning if a trusted user has changed their name
        // if (author !== localProfile) {
        //   post.warning = true;
        // }
        // } else {

        // !!! DANGEROUS !!! SAFETY CHECKS NEEDED
        let newProfiles = this.state.profiles;

        // If unseen profile, just add it to the store
        if (!newProfiles[author.id]) {
          newProfiles[author.id] = author;
          newProfiles[author.id].lastUpdate = Date.now();
          this.setState({ profiles: newProfiles });
          localStorage.setItem("profiles", JSON.stringify(this.state.profiles));
        } else if (
          !this.state.profiles[author.id].lastUpdate ||
          post.date > this.state.profiles[author.id].lastUpdate
        ) {
          // make sure this is new information
          // otherwise update information
          // TODO display warning flag next to name until user confirms changes
          newProfiles[author.id] = author;
          newProfiles[author.id].lastUpdate = Date.now();
          this.setState({ profiles: newProfiles });
          localStorage.setItem("profiles", JSON.stringify(this.state.profiles));
        }

        // }
        this.setState({ posts: [post, ...this.state.posts] });
        localStorage.setItem("posts", JSON.stringify(this.state.posts));

        // Do some more safety checks here obviously
        // if (isIPFS.multihash(previous)) {
        if (previous && previous.length === 46) this.handleHash(previous);

        if (post.content && post.content[0] && post.content[0].text) {
          new Notification(author.name, {
            icon: `https://ipfs.io/ipfs/${author.icon}`,
            body: post.content[0].text
          });
        } else if (
          post.content &&
          post.content[1] &&
          IMAGE_TYPES.indexOf(post.content[1].type) !== -1
        ) {
          new Notification(author.name, {
            icon: `https://ipfs.io/ipfs/${author.icon}`,
            image: `https://ipfs.io/ipfs/${post.content[1].hash}`
          });
        } else {
          new Notification(author.name, {
            icon: `https://ipfs.io/ipfs/${author.icon}`,
            body: "New post"
          });
        }

        // }
      });
    });
  }

  postByHash(hash) {
    return this.state.posts.filter(post => post.hash === hash);
  }

  handleMessage(msg) {
    // TODO first make sure data is correct length of hash!!
    const hash = msg.data.toString();

    this.handleHash(hash);
  }

  toggleEditor(event) {
    this.setState({
      showEditor: !this.state.showEditor
    });
  }

  lastPost() {
    const selfPosts = this.state.posts.filter(
      post => post.author.id === this.state.id
    );
    return selfPosts.length ? selfPosts[0].hash : null;
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
              bio: this.state.bio,
              location: this.state.location,
              website: this.state.website,
              following: this.state.following
            },
            content: content,
            date_published: format(
              new Date(Date.now()),
              "YYYY-MM-DDTHH:mm:ss.SSSZ"
            ),
            date: Date.now(),
            previous: this.lastPost()
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
    let newFollowing = this.state.following;
    if (!this.state.following[id]) newFollowing[id] = true;
    else delete newFollowing[id];
    this.setState({ following: newFollowing });
    localStorage.setItem("following", JSON.stringify(newFollowing));
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
        let newProfiles = t.state.profiles;
        newProfiles[t.state.id].canopy = hash;

        t.setState({ canopy: hash, profiles: newProfiles });
        localStorage.setItem("canopy", hash);
        localStorage.setItem("profiles", JSON.stringify(newProfiles));
      });
    };
    if (IMAGE_TYPES.indexOf(files[0].type) === -1) return;
    reader.readAsArrayBuffer(files[0]);
  }

  updateProfile(id, key, value) {}

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
        let newProfiles = t.state.profiles;
        newProfiles[t.state.id].icon = hash;

        t.setState({ profiles: newProfiles, icon: hash });
        localStorage.setItem("icon", hash);
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

  // factor these out to one function
  handleNameEdit(event) {
    this.setState({ name: event.target.value });
    localStorage.setItem("name", event.target.value);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].name = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  handleBioEdit(event) {
    this.setState({ bio: event.target.value });
    localStorage.setItem("bio", event.target.value);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].bio = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  handleLocationEdit(event) {
    this.setState({ location: event.target.value });
    localStorage.setItem("location", event.target.value);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].location = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  handleWebsiteEdit(event) {
    this.setState({ website: event.target.value });
    localStorage.setItem("website", event.target.value);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].website = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  render() {
    const {
      peers,
      profiles,
      posts,
      name,
      icon,
      id,
      canopy,
      following
    } = this.state;
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
                  canopy={canopy}
                  id={id}
                  name={name}
                  following={following}
                />
              );
            }}
          />

          <Route
            path="/@:id"
            render={({ match }) => {
              const filteredPosts = posts.filter(
                post => post.author.id === match.params.id
              );

              return this.state.profiles[match.params.id]
                ? <div className="bg-transparent-ns bg-white">

                    <input
                      disabled={
                        !this.state.edit || match.params.id !== this.state.id
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
                          (this.state.edit &&
                            match.params.id === this.state.id) ||
                            (this.state.profiles[match.params.id] &&
                              this.state.profiles[match.params.id].canopy)
                            ? "w-100 h5-ns h4 bg-light-gray cover bg-center"
                            : "w-100 h4 bg-near-black cover bg-center"
                        }
                        style={{
                          backgroundImage: this.state.profiles[
                            match.params.id
                          ] && this.state.profiles[match.params.id].canopy
                            ? `url('https://ipfs.io/ipfs/${this.state.profiles[match.params.id].canopy}`
                            : "none"
                        }}
                      >
                        <div
                          className={
                            this.state.edit && match.params.id === this.state.id
                              ? "flex items-center pa3 bg-black-50 w-100 h-100"
                              : "flex items-center pa3 w-100 h-100"
                          }
                        >
                          {this.state.edit && match.params.id === this.state.id
                            ? <p className="ma0 f5 fw6 tc center white">
                                {this.state.profiles[match.params.id] &&
                                  this.state.profiles[match.params.id].canopy
                                  ? "Change your background photo"
                                  : "Add a background photo"}
                              </p>
                            : null}

                        </div>
                      </div>
                    </label>

                    <div className="h3 shadow-0 bg-white flex items-center justify-center" />

                    <div className="flex justify-center">
                      <div className="w5 minw5 mh3 ">
                        <div
                          className="mln1 mtn4-ns mtn3 overflow-hidden ba b--white bw2 h45-ns w45-ns h3 w3 br4 cover bg-light-gray"
                          style={{
                            backgroundImage: this.state.profiles[
                              match.params.id
                            ]
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

                                <p className="tc btn white lh-copy pointer bn br1 pv2 ph2 f5 fw6">
                                  Change your profile photo
                                </p>

                              </label>
                            : null}
                        </div>

                        {
                          // Factor these out to a reuseable component
                        }
                        <div className="center flex flex-column mh1">
                          <div>
                            {match.params.id === id && this.state.edit
                              ? <Textarea
                                  className="br2 mt2 pv1 ph2 ba b--light-gray w-100 tl lh-copy measure f4 fw6 near-black"
                                  style={{ resize: "none" }}
                                  placeholder="Anonymous"
                                  onChange={this.handleNameEdit.bind(this)}
                                  value={
                                    this.state.profiles[match.params.id].name
                                  }
                                />
                              : <h1 className="mv2 f4">
                                  {this.state.profiles[match.params.id].name ||
                                    "Anonymous"}
                                </h1>}

                            <h2 className="mv2 f6 tl fw4 lh-copy light-silver break-all">
                              @
                              <span>
                                {match.params.id}
                              </span>
                            </h2>

                            {match.params.id === id && this.state.edit
                              ? <Textarea
                                  className="br2 mv0 pv1 ph2 ba b--light-gray mb0 w-100 tl lh-copy measure f6 near-black"
                                  style={{ resize: "none" }}
                                  placeholder="Bio"
                                  onChange={this.handleBioEdit.bind(this)}
                                  value={
                                    this.state.profiles[match.params.id].bio
                                  }
                                />
                              : this.state.profiles[match.params.id].bio
                                  ? <p className="mb3 mt2 w-100 tl lh-copy measure f6 near-black">
                                      {this.state.profiles[match.params.id].bio}
                                    </p>
                                  : null}

                            {match.params.id === id && this.state.edit
                              ? <Textarea
                                  className="br2 pv1 ph2 ba b--light-gray mv0 mb0 w-100 tl lh-copy measure f6 near-black"
                                  style={{ resize: "none" }}
                                  placeholder="Location"
                                  onChange={this.handleLocationEdit.bind(this)}
                                  value={
                                    this.state.profiles[match.params.id]
                                      .location
                                  }
                                />
                              : this.state.profiles[match.params.id].location
                                  ? <div className="pointer mv2 f6 near-black flex items-center">

                                      <svg
                                        className="mr2 ph05"
                                        width="12px"
                                        height="16px"
                                        viewBox="0 0 12 16"
                                        fill="#555"
                                      >

                                        <path
                                          d="M6,0 C2.69,0 0,2.5 0,5.5 C0,10.02 6,16 6,16 C6,16 12,10.02 12,5.5 C12,2.5 9.31,0 6,0 L6,0 Z M6,14.55 C4.14,12.52 1,8.44 1,5.5 C1,3.02 3.25,1 6,1 C7.34,1 8.61,1.48 9.56,2.36 C10.48,3.22 11,4.33 11,5.5 C11,8.44 7.86,12.52 6,14.55 L6,14.55 Z M8,5.5 C8,6.61 7.11,7.5 6,7.5 C4.89,7.5 4,6.61 4,5.5 C4,4.39 4.89,3.5 6,3.5 C7.11,3.5 8,4.39 8,5.5 L8,5.5 Z"
                                          id="Shape"
                                          stroke="none"
                                        />
                                      </svg>
                                      <p className="ma0">
                                        {
                                          this.state.profiles[match.params.id]
                                            .location
                                        }
                                      </p>
                                    </div>
                                  : null}

                            {match.params.id === id && this.state.edit
                              ? <Textarea
                                  className="br2 pv1 ph2 ba b--light-gray mv0 mb0 w-100 tl lh-copy measure f6 near-black"
                                  style={{ resize: "none" }}
                                  placeholder="Website"
                                  onChange={this.handleWebsiteEdit.bind(this)}
                                  value={
                                    this.state.profiles[match.params.id].website
                                  }
                                />
                              : this.state.profiles[match.params.id].website
                                  ? <div className="pointer mv2 f6 near-black flex items-center">

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
                                        href={
                                          "https://" +
                                            this.state.profiles[match.params.id]
                                              .website
                                        }
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        className="link ma0 mb0 w-100 tl lh-copy measure f6 blue"
                                      >
                                        {
                                          this.state.profiles[match.params.id]
                                            .website
                                        }
                                      </a>
                                    </div>
                                  : null}

                            <div className="mv2 f6 near-black flex items-center">
                              <svg
                                className="mr2"
                                fill="#555"
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
                              <p className="ma0">Joined June 2017</p>
                            </div>
                          </div>

                        </div>

                      </div>

                      <Route
                        exact
                        path={`${match.url}`}
                        render={() => {
                          return (
                            <div className="mw75 mt2 w-100 mb5 mh3-ns">
                              <div className="flex justify-between">
                                <div className="flex items-start">
                                  <Link to={match.url} className="no-underline">
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3
                                        className={`mt0 mb1 ${match.isExact ? "near-black" : "silver"}`}
                                      >
                                        {filteredPosts.length}
                                      </h3>
                                      <span
                                        className={`mh3 f7 fw4 ttu ${match.isExact ? "near-black" : "silver"}`}
                                      >
                                        Posts
                                      </span>
                                      {match.isExact
                                        ? <div className="absolute bottom-0 h05 w-100 bg-near-black" />
                                        : null}
                                    </div>
                                  </Link>
                                  <Link
                                    to={`${match.url}/following`}
                                    className=" no-underline"
                                  >
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3
                                        className={`mt0 mb1 ${match.isExact ? "silver" : "near-black"}`}
                                      >
                                        {this.state.profiles[match.params.id] &&
                                          this.state.profiles[match.params.id]
                                            .following
                                          ? Object.keys(
                                              this.state.profiles[
                                                match.params.id
                                              ].following
                                            ).length
                                          : 0}
                                      </h3>
                                      <span className="mh3 f7 fw4 ttu silver">
                                        Following
                                      </span>
                                      {match.isExact
                                        ? null
                                        : <div className="absolute bottom-0 h05 w-100 bg-near-black" />}
                                    </div>
                                  </Link>

                                  <Link to={"#"} className="no-underline">
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3 className={"mt0 mb1 silver"}>
                                        0
                                      </h3>
                                      <span className="mh3 f7 fw4 ttu silver">
                                        Likes
                                      </span>
                                    </div>
                                  </Link>
                                </div>
                                <div className="mtn4 ph3 h3 flex items-center">
                                  {match.params.id === this.state.id
                                    ? this.state.edit &&
                                        match.params.id === this.state.id
                                        ? // if user profile, show edit button
                                          <div>
                                            <button
                                              onClick={this.toggleEdit.bind(
                                                this
                                              )}
                                              className="btn ba bw05 b--silver mr3 pointer bg-white near-black near-black br2 pv2 ph3 f6 fw6"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={this.toggleEdit.bind(
                                                this
                                              )}
                                              className="btn ba bw05 b--silver pointer bg-white bright-blue near-black br2 pv2 ph3 f6 fw6"
                                            >
                                              Save
                                            </button>
                                          </div>
                                        : <button
                                            onClick={this.toggleEdit.bind(this)}
                                            className="hover-bg-near-white btn ba bw05 b--silver pointer bg-white near-black  ml5 br2 pv2 ph3 f6 fw6"
                                          >
                                            Edit profile
                                          </button>
                                    : // or just the follow button
                                      <button
                                        onClick={() =>
                                          this.toggleFollow(match.params.id)}
                                        className={`btn pointer br2 pv2 ph3 f6 fw6 ba bw05 b--purple ${this.state.profiles[match.params.id] && this.state.following[match.params.id] ? "bg-purple white" : "bg-white purple"}`}
                                      >
                                        {this.state.following[match.params.id]
                                          ? "Following"
                                          : "Follow"}
                                      </button>}
                                </div>

                              </div>

                              {filteredPosts
                                .sort((a, b) => b.date - a.date) // expensive sort!!
                                .map(post => {
                                  return (
                                    <Post
                                      key={post.author.id + post.date}
                                      author={profiles[post.author.id]}
                                      content={post.content}
                                      date={post.date}
                                      selfIcon={this.state.icon}
                                    />
                                  );
                                })}
                            </div>
                          );
                        }}
                      />

                      <Route
                        path={`${match.url}/following`}
                        render={() => {
                          if (
                            !this.state.profiles[match.params.id] ||
                            !this.state.profiles[match.params.id].following
                          )
                            return null;
                          return (
                            <div className="mw75 mt2 mb5 mh3-ns">

                              <div className="flex justify-between">
                                <div className="flex items-start">
                                  <Link to={match.url} className="no-underline">
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3 className="mt0 mb1 silver">
                                        {filteredPosts.length}
                                      </h3>
                                      <span className="mh3 f7 fw4 ttu silver">
                                        Posts
                                      </span>
                                      {match.isExact
                                        ? <div className="absolute bottom-0 h05 w-100 bg-near-black" />
                                        : null}
                                    </div>
                                  </Link>
                                  <Link
                                    to={`${match.url}/following`}
                                    className=" no-underline"
                                  >
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3 className={"mt0 mb1 near-black"}>
                                        {this.state.profiles[match.params.id] &&
                                          this.state.profiles[match.params.id]
                                            .following
                                          ? Object.keys(
                                              this.state.profiles[
                                                match.params.id
                                              ].following
                                            ).length
                                          : 0}
                                      </h3>
                                      <span className="near-black f7 fw4 ttu mh3">
                                        Following
                                      </span>
                                      {match.isExact
                                        ? null
                                        : <div className="absolute bottom-0 h05 w-100 bg-near-black" />}
                                    </div>
                                  </Link>

                                  <Link to={"#"} className="no-underline">
                                    <div className="mtn4 h3 tc relative flex flex-column justify-center">
                                      <h3 className={"mt0 mb1 silver"}>
                                        0
                                      </h3>
                                      <span className="mh3 f7 fw4 ttu silver">
                                        Likes
                                      </span>
                                    </div>
                                  </Link>
                                </div>

                                <div className="mtn4 mh3 h3 flex items-center">
                                  {match.params.id === this.state.id
                                    ? this.state.edit &&
                                        match.params.id === this.state.id
                                        ? // if user profile, show edit button
                                          <div>
                                            <button
                                              onClick={this.toggleEdit.bind(
                                                this
                                              )}
                                              className="btn ba bw05 b--silver mr3 pointer bg-white near-black near-black br2 pv2 ph3 f6 fw6"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={this.toggleEdit.bind(
                                                this
                                              )}
                                              className="btn ba bw05 b--silver pointer bg-white bright-blue near-black br2 pv2 ph3 f6 fw6"
                                            >
                                              Save
                                            </button>
                                          </div>
                                        : <button
                                            onClick={this.toggleEdit.bind(this)}
                                            className="hover-bg-near-white btn ba bw05 b--silver pointer bg-white near-black  ml5 br2 pv2 ph3 f6 fw6"
                                          >
                                            Edit profile
                                          </button>
                                    : // or just the follow button
                                      <button
                                        onClick={() =>
                                          this.toggleFollow(match.params.id)}
                                        className={`btn pointer br2 pv2 ph3 f6 fw6 ba bw05 b--purple ${this.state.profiles[match.params.id] && this.state.following[match.params.id] ? "bg-purple white" : "bg-white purple"}`}
                                      >
                                        {this.state.following[match.params.id]
                                          ? "Following"
                                          : "Follow"}
                                      </button>}
                                </div>

                              </div>

                              <div>
                                {Object.keys(
                                  this.state.profiles[match.params.id].following
                                ).map(id => {
                                  const iconURL = this.state.profiles[id]
                                    ? `url('https://ipfs.io/ipfs/${this.state.profiles[id].icon}')`
                                    : "#";

                                  const backgroundURL = this.state.profiles[id]
                                    ? `url('https://ipfs.io/ipfs/${this.state.profiles[id].canopy}')`
                                    : "#";
                                  return (
                                    <div
                                      key={id}
                                      className="profile-card fl h5 mr3 br3 overflow-hidden ba b--light-gray  mv2 bg-white"
                                    >
                                      <Link to={`/@${id}`}>
                                        <div
                                          className="bg-light-gray h35 w-100 cover bg-center"
                                          style={{
                                            backgroundImage: backgroundURL
                                          }}
                                        />
                                      </Link>

                                      <div className="flex items-center justify-between mh3">
                                        <Link to={`/@${id}`}>

                                          <div className="mln05 mtn2 overflow-hidden ba b--white bw2  br3  bg-light-gray">
                                            <div
                                              className="h3 w3 cover"
                                              style={{
                                                backgroundImage: iconURL
                                              }}
                                            />
                                          </div>
                                        </Link>

                                        <div className="ml2 mtn05">
                                          <button className="bg-white ph3 pv1 br2 ba b--silver f7 fw6">
                                            Follow
                                          </button>
                                        </div>
                                      </div>

                                      <div className="w5 mh3 mt0 minh4 pl05 relative">

                                        {this.state.profiles[id]
                                          ? <Link
                                              to={`/@${id}`}
                                              className="link db f5 mv2 mt0 fw6 near-black"
                                            >
                                              {this.state.profiles[id].name}
                                            </Link>
                                          : null}
                                        <Link
                                          to={`/@${id}`}
                                          className="link f6 db mv2 light-silver break-all"
                                        >
                                          @{id}
                                        </Link>

                                        {this.state.profiles[id] &&
                                          this.state.profiles[id].bio
                                          ? <p className="f6 mv2 fw5 mid-gray lh-copy">
                                              {this.state.profiles[id].bio}

                                            </p>
                                          : null}
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
                      />

                    </div>
                  </div>
                : <div className="bg-bright-blue pa3 flex items-center justify-center">
                    <span className="white bg-bright-blue wrap-all">
                      This will work when js-ipfs supports ipns...
                    </span>
                  </div>;
            }}
          />
        </div>
      </Router>
    );
  }
}
