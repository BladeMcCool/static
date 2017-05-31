import React, { Component } from "react";
import "./App.css";

import { BrowserRouter as Router, Route } from "react-router-dom";

import async from "async-es";
import format from "date-fns/format";
// import Metascraper from "metascraper";

import Home from "./Home";
import Header from "./Header";
import Post from "./Post";

import { IMAGE_TYPES, AUDIO_TYPES } from "./Editor/constants";

// const IPFS = require("ipfs");
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

    const name = localStorage.getItem("name");
    const icons = [
      "QmSgU5UrnPgZ1YdkwbtmU6gPZ4ULhbX9MukjVnvPrM8WEj",
      "QmXmFMmaNurZZ95NSn5WNBpwoNy8U5MjNj3SvsdsZK5PNQ",
      "QmNSqqvYRvCgzRd1UMcGPwYuSFRW9vCpW6mtUMe6oW9muU",
      "QmYNBRkrP4kwQVRmPSaaSEVUg3NXArA63v5d9J68UfJMg6",
      "QmSYUjoh5ptNiL2ZKkmADjweHC7FbRWo9ZVLjFjWKWSQ1G",
      "Qmf9ETausmHGse2BGjwZBX4QB7iMHR8QsMsubqNTeR8odQ"
    ];
    const icon = localStorage.getItem("icon") || rand(icons);
    if (!localStorage.getItem("icon")) localStorage.setItem("icon", icon);

    const posts = JSON.parse(localStorage.getItem("posts")) || [];

    this.state = {
      name,
      icon,
      posts,
      peers: []
    };

    const t = this;

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
    // first make sure data is correct length of hash!!
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
        this.setState({ posts: [JSON.parse(res), ...this.state.posts] });
        localStorage.setItem("posts", JSON.stringify(this.state.posts));
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
            author: this.state.name || "Anonymous",
            id: this.state.id,
            icon: this.state.icon ||
              "QmXmFMmaNurZZ95NSn5WNBpwoNy8U5MjNj3SvsdsZK5PNQ",
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

  setIcon(event) {
    alert("??");
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

  render() {
    const { peers, posts, name, icon, id } = this.state;
    const iconURL = `url('https://ipfs.io/ipfs/${icon}')`;
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
            onNameEdit={event => {
              this.setState({ name: event.target.value });
              localStorage.setItem("name", event.target.value);
            }}
          />
          <Route
            exact
            path="/"
            render={props => (
              <Home
                peers={peers}
                posts={posts}
                onPublish={this.publish}
                icon={icon}
                id={id}
                name={name}
                peerCount={peers.length}
              />
            )}
          />
          <Route
            path="/@:id"
            render={({ match }) => (
              <div className="mv3">
                <div className="absolute mh3 bg-white mw5 br2 ba b--light-gray">
                  <div
                    className="w-100 h5 cover bg-light-gray "
                    style={{ backgroundImage: iconURL }}
                  >
                    <button>Follow</button>
                  </div>

                  <div className="f6 w5 pa3">
                    <a className="link mv0 mr1 f6 fw6 near-black flex flex-row items-start">
                      Oliver
                    </a>

                    <span className="f6 fw4 silver" dateTime="999999">
                      A description.
                    </span>
                  </div>
                </div>
                {posts.filter(post => post.id == match.params.id).map(post => {
                  return (
                    <Post
                      key={post.author + post.date_published}
                      author={post.author}
                      id={post.id}
                      icon={post.icon}
                      content={post.content}
                      date_published={post.date_published}
                    />
                  );
                })}
              </div>
            )}
          />
        </div>
      </Router>
    );
  }
}
