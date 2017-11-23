import React, { Component } from "react";

import { BrowserRouter as Router, Route } from "react-router-dom";

import async from "async-es";
// import Metascraper from "metascraper";

// import isIPFS from "is-ipfs";

import Home from "./Home";
import Header from "./Header";
import Post from "./Post";
import Profile from "./Profile";
import Stats from "./Stats";
import ProfileCard from "./ProfileCard";

import { IMAGE_TYPES, AUDIO_TYPES } from "./Editor/constants";

import IPFS from "ipfs";
const node = new IPFS({
  EXPERIMENTAL: {
    pubsub: true,
    dht: true
  },
  start: true
});

export default class App extends Component {
  constructor(props) {
    super(props);
    this.publish = this.publish.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.toggleEditor = this.toggleEditor.bind(this);
    this.setIcon = this.setIcon.bind(this);
    this.setBackground = this.setBackground.bind(this);

    const name = localStorage.getItem("name");

    const version = 6;
    // Obviously make a migration procedure in the future
    if (version > localStorage.getItem("version")) {
      if (version === 6) {
        localStorage.removeItem("posts");
      } else if (version === 5) {
        localStorage.removeItem("following");
      } else if (version === 3) {
        localStorage.removeItem("posts");
      } else {
        localStorage.removeItem("posts");
        localStorage.removeItem("profiles");
      }
    }

    localStorage.setItem("version", version);

    // This is all a temporary hack
    const id = localStorage.getItem("id");
    const icon = localStorage.getItem("icon");
    if (!localStorage.getItem("icon")) localStorage.setItem("icon", icon);
    const canopy = localStorage.getItem("canopy");
    const bio = localStorage.getItem("bio") || "";
    const location = localStorage.getItem("location") || "";
    const website = localStorage.getItem("website") || "";
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
      location,
      website,
      profiles,
      following,
      peers: [],
      onlinePeers: []
    };

    const t = this;

    node
      .on("start", () => {
        node.pubsub.subscribe("static.network", this.handleMessage);
        this.updatePeerCount();

        setInterval(this.updatePeerCount.bind(this), 1000);

        this.updateOnlinePeers();
        setInterval(this.updateOnlinePeers.bind(this), 5000);

        setTimeout(this.broadcastLastPost.bind(this), 5000);
        setInterval(this.broadcastLastPost.bind(this), 60 * 1000);

        node
          .id()
          .then(id => {
            // TODO factor these out (1/2)
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
            // TODO factor these out (2/2)
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
      });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // all the state stuff is gonna go away with redux
    if (nextState.id !== this.state.id) return true;
    if (nextState.name !== this.state.name) return true;
    if (nextState.icon !== this.state.icon) return true;
    if (nextState.posts !== this.state.posts) return true;
    if (nextState.canopy !== this.state.canopy) return true;
    if (nextState.bio !== this.state.bio) return true;
    if (nextState.location !== this.state.location) return true;
    if (nextState.website !== this.state.website) return true;
    if (nextState.profiles !== this.state.profiles) return true;
    if (nextState.following !== this.state.following) return true;
    if (nextState.peers !== this.state.peers) return true;
    if (nextState.onlinePeers !== this.state.onlinePeers) return true;
    if (nextState.showEditor !== this.state.showEditor) return true;
    if (nextState.editing !== this.state.editing) return true;
    if (nextState.color !== this.state.color) return true;

    return true;
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

  updateOnlinePeers() {
    node.pubsub.peers("static.network", (err, peers) => {
      if (err) console.error(err);
      else this.setState({ onlinePeers: peers });
    });
  }

  broadcastLastPost() {
    const lastPost = this.lastPost();
    if (lastPost) {
      node.pubsub.publish(
        "static.network",
        new Buffer(lastPost),
        (err, res) => {
          if (err) console.error(err);
        }
      );
    }
  }

  handlePost(post, hash) {
    const { author, previous } = post;

    post.hash = hash;

    // TODO display a warning if a trusted user has changed their name

    // !!! DANGEROUS !!! SAFETY CHECKS NEEDED
    let newProfiles = this.state.profiles;

    // If unseen profile, just add it to the store
    // If not, make sure this is new information
    if (!newProfiles[author.id]) {
      newProfiles[author.id] = author;
      newProfiles[author.id].lastUpdate = Date.now();
    } else if (
      !this.state.profiles[author.id].lastUpdate ||
      post.date > this.state.profiles[author.id].lastUpdate
    ) {
      // TODO display warning flag next to name until user confirms changes
      newProfiles[author.id] = author;
      newProfiles[author.id].lastUpdate = Date.now();
    }

    // }
    this.setState({
      profiles: newProfiles,
      posts: [post, ...this.state.posts]
    });
    localStorage.setItem("posts", JSON.stringify(this.state.posts));
    localStorage.setItem("profiles", JSON.stringify(this.state.profiles));

    // Do some more safety checks here obviously
    // if (isIPFS.multihash(previous)) { //
    if (previous && previous.length === 46) this.handleHash(previous);
    // }
  }

  handleHash(hash, currentDelay) {
    if (hash.length !== 46) return console.error("Invalid hash");
    // Ignore posts we have seen
    if (this.postByHash(hash).length) return;

    if (!node.isOnline()) {
      setTimeout(
        () => this.handleHash(hash, currentDelay * 2 || 1000),
        currentDelay * 2 || 1000
      );

      // TODO setup gateway on static.network to avoid CORS issues
      // fetch("https://static.network/ipfs/" + hash).then((err, res) => {
      //   console.log(err, res);
      // });
      return;
    }

    node.files.cat(hash, (err, file) => {

      // Safety check -- Ignore posts we have seen
      // This shouldn't have to be here
      if (this.postByHash(hash).length) return;
      
      try {
        const post = JSON.parse(file.toString('utf8'));
        this.handlePost(post, hash);
      } catch (err) {
        return console.error("Could not parse post", err);
      }
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
    const selfPosts = this.state.posts
      .filter(post => post.author.id === this.state.id)
      .sort((a, b) => b.date - a.date);
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
              following: this.state.following,
              color: this.state.profiles[this.state.id].color
            },
            content: content,
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

  onLike(event, hash) {
    if (!hash) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // TODO: Super inefficient, obviously fix this
    const currentIndex = this.state.likes.indexOf(hash);
    if (currentIndex !== -1) {
      // this.setState({likes: {}})
    }
  }

  toggleEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({ editing: !this.state.editing });
  }

  toggleFollow(id) {
    let newFollowing = this.state.following;
    if (!this.state.following[id]) newFollowing[id] = true;
    else delete newFollowing[id];

    let newProfiles = this.state.profiles;
    newProfiles[this.state.id].following = newFollowing;

    this.setState({ following: newFollowing, profiles: newProfiles });
    localStorage.setItem("following", JSON.stringify(newFollowing));
  }

  // Refactor these two into one and merge with handleEdit
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

  handleEdit(event, type) {
    if (type === "icon") return this.setIcon(event);
    if (type === "background") return this.setBackground(event);
    let newState = {};
    newState[type] = event.target.value;
    this.setState(newState);
    let newProfiles = this.state.profiles;
    newProfiles[this.state.id][type] = event.target.value;
    this.setState({ profiles: newProfiles });
    localStorage.setItem("profiles", JSON.stringify(newProfiles));
  }

  render() {
    const {
      peers,
      onlinePeers,
      profiles,
      posts,
      name,
      icon,
      id,
      canopy,
      following,
      editing
    } = this.state;

    return (
      <Router>
        <div
          onDragOver={this.handleDragOver.bind(this)}
          onDragLeave={this.handleDragLeave.bind(this)}
        >
          <Header
            connected={node.isOnline()}
            peerCount={peers.length}
            name={profiles[id] ? profiles[id].name : "Anonymous"}
            icon={icon}
            profile={profiles[id]}
            color={profiles[id] ? profiles[id].color : null}
            id={id}
          />

          <Route
            exact
            path="/"
            render={props => (
              <Home
                peerCount={peers.length}
                onlinePeers={onlinePeers}
                posts={posts}
                profiles={profiles}
                connected={node.isOnline()}
                onPublish={this.publish}
                icon={icon}
                canopy={canopy}
                id={id}
                name={name}
                following={following}
              />
            )}
          />

          <Route
            exact
            path="/p/:hash"
            render={({ match }) => {
              const { hash } = match.params;

              // use is-ipfs
              if (!hash || hash.length !== 46)
                return (
                  <div className="mt3 flex justify-center">
                    <span>Invalid hash</span>
                  </div>
                );

              //TODO just go straight to ipfs
              const matchingPosts = posts.filter(post => hash === post.hash);

              if (matchingPosts.length === 0) {
                this.handleHash(hash);
                return (
                  <div className="mt2-ns flex justify-center">
                    <article
                      className={`pa3 z-6 mw-post-ns w-100 mh2-ns mt2-ns mv0 bg-white br2-ns ba-ns bb b--light-gray`}
                    >
                      <div className="fw6 w-100 flex items-start justify-between">
                        <div className="h2 w-100 flex items-center">
                          <div className="h2 w2 br2 bg-light-gray" />
                        </div>
                      </div>
                    </article>
                  </div>
                );
              }

              const post = matchingPosts[0];
              const profile = profiles[post.author.id];
              return (
                <div className="flex mt2 pb5 justify-center">
                  <Post
                    key={post.author.id + post.date}
                    author={profile}
                    content={post.content}
                    date={post.date}
                    hash={post.hash}
                    selfIcon={icon}
                  />
                </div>
              );
            }}
          />

          <Route
            path="/@:id"
            render={({ match }) => {
              // A temporary hack, will move to something better soon
              const filteredPosts = posts.filter(
                post => post.author.id === match.params.id
              );
              const profile = profiles[match.params.id];
              const following = profile && typeof profile === "object"
                ? Object.keys(profile.following)
                : [];
              const isSelf = match.params.id === this.state.id;

              return (
                <Profile
                  id={match.params.id}
                  onEdit={this.handleEdit.bind(this)}
                  posts={filteredPosts}
                  profile={profiles[match.params.id]}
                  online={
                    onlinePeers.indexOf(match.params.id) !== -1 // TODO warning really bad obviously
                  }
                  isFollowing={this.state.following[match.params.id]}
                  isSelf={match.params.id === this.state.id}
                  editing={isSelf && editing}
                >

                  <Route
                    exact
                    path={`${match.url}`}
                    render={() => (
                      <div>

                        {
                          // Figure out how to not duplicate this (see below)
                        }
                        <Stats
                          match={match}
                          postCount={filteredPosts.length}
                          followingCount={following.length}
                          color={profile.color}
                          selected="posts"
                          editing={isSelf && editing}
                          isFollowing={this.state.following[match.params.id]}
                          isSelf={isSelf}
                          onFollow={() => this.toggleFollow(match.params.id)} // move to redux
                          onToggleEdit={this.toggleEdit.bind(this)}
                        />
                        <div className="mt2 bl br b--transparent">
                          {filteredPosts.map(post => {
                            return (
                              <Post
                                key={post.hash}
                                author={profile}
                                content={post.content}
                                date={post.date}
                                hash={post.hash}
                                selfIcon={icon}
                                onLike={this.onLike.bind(this)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  />

                  <Route
                    path={`${match.url}/following`}
                    render={() => (
                      <div className="minh-100">
                        {
                          // Figure out how to not duplicate this (see above)
                        }
                        <Stats
                          match={match}
                          postCount={filteredPosts.length}
                          followingCount={following.length}
                          color={profile.color}
                          selected="following"
                          editing={isSelf && editing}
                          isSelf={isSelf}
                          isFollowing={this.state.following[match.params.id]}
                          onFollow={() => this.toggleFollow(match.params.id)} // move to redux
                          onToggleEdit={this.toggleEdit.bind(this)}
                        />
                        <div className="mt2 h-100">
                          {following.map(followingId => (
                            <ProfileCard
                              key={followingId}
                              profile={
                                this.state.profiles[followingId] || {
                                  id: followingId // TODO fix temporary hack
                                }
                              }
                              buttonColor={
                                this.state.profiles[match.params.id]
                                  ? this.state.profiles[match.params.id].color
                                  : null
                              }
                              isSelf={match.params.id === this.state.id}
                              isFollowing={this.state.following[followingId]}
                              onFollow={() => this.toggleFollow(followingId)} // move to redux
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  />
                </Profile>
              );
            }}
          />
        </div>
      </Router>
    );
  }
}
