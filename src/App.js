import React, { Component } from "react";
import "./App.css";

import async from "async-es";
import format from "date-fns/format";
// import Metascraper from "metascraper";

import Post from "./Post";
import PostEditor from "./Editor";
import AutosizeInput from "react-input-autosize";

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

class App extends Component {
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
      peers: [],
      showEditor: false
    };

    node
      .on("start", () => {
        node.pubsub.subscribe("static.network", this.handleMessage);
        setInterval(
          () =>
            node.swarm
              .peers()
              .then(peers => {
                if (peers.length !== this.state.peers.length)
                  this.setState({ peers: peers });
                let seenPeers = {};
                peers.forEach(peer => {
                  const id = peer.peer.id.toJSON().id;
                  if (seenPeers[id]) {
                    console.error("Dupe", id);
                  }
                  seenPeers[peer.peer.id.toJSON().id] = true;
                });
              })
              .catch(err => console.error(err)),
          1000
        );
      })
      .on("error", err => {
        console.error(err);
      });
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
    if (!this.state.showEditor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
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

  render() {
    const peerCount = this.state.peers.length;
    return (
      <div>
        {this.state.error
          ? <div>
              <span>{this.state.error}</span>
            </div>
          : null}
        <header className="w-100 bg-white bb b--light-gray w-75 pa3 z-999 flex flex-row justify-between items-center">

          <div className="flex-auto flex flex-row items-center">
            <a href="." className="near-black f4 fw5 ttu sans-serif tl link">
              <svg
                id="logo"
                fill="#111"
                width="15px"
                height="24px"
                viewBox="0 0 10 16"
              >
                <polygon id="Shape" points="10 7 6 7 9 0 0 9 4 9 1 16" />
              </svg>
            </a>
            <input
              className="search fw4 h2 w-100 mw6 ph2 mh3 input-reset br2 bn bg-near-white"
              placeholder="Search Static"
              spellCheck="false"
              type="text"
              name="search"
            />

          </div>

          <div className="flex flex-row items-center justify-end">

            <div className="h2 flex flex-row items-center mr3">

              <input
                type="file"
                name="iconPicker"
                id="iconPicker"
                className="dn"
                onChange={this.setIcon}
              />
              <label htmlFor="iconPicker">
                <div
                  className="pointer h2 w2 br2 cover bg-near-black"
                  style={{
                    backgroundImage: `url('https://ipfs.io/ipfs/${this.state.icon}')`
                  }}
                />
              </label>

              <div className="ml2 flex flex-column">
                <AutosizeInput
                  className="nowrap pa0 input-reset bn f6 fw6 near-black"
                  type="text"
                  inputStyle={{
                    padding: 0,
                    border: "none",
                    fontSize: ".875rem",
                    fontWeight: 600
                  }}
                  onChange={event => {
                    this.setState({ name: event.target.value });
                    localStorage.setItem("name", event.target.value);
                  }}
                  placeholder="Anonymous"
                  value={this.state.name || ""}
                />

                <span
                  className={`fw5 nowrap ${peerCount > 0 ? "green" : "red"} f6`}
                >
                  {`${peerCount} ${peerCount === 1 ? "peer" : "peers"}`}
                </span>
              </div>
            </div>

            <button
              onClick={this.toggleEditor}
              className="pointer nowrap bn h2 ph2 br2 f5 fw5 white bg-bright-blue sans-serif"
            >
              New Post
            </button>
          </div>
        </header>

        <main className="mt5-ns">
          {this.state.posts.map(post => {
            return (
              <Post
                key={post.author + post.date_published}
                author={post.author}
                icon={post.icon}
                content={post.content}
                date_published={post.date_published}
              />
            );
          })}
        </main>
        {this.state.showEditor
          ? <PostEditor
              name={this.state.name || "Anonymous"}
              icon={this.state.icon}
              onPublish={this.publish}
              onClose={this.toggleEditor}
            />
          : null}
      </div>
    );
  }
}

export default App;
