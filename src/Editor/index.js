import React from "react";
import { AtomicBlockUtils, Editor, EditorState, RichUtils } from "draft-js";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import musicmetadata from "music-metadata";

import { Image, Audio, Video, File, PDF } from "./Blocks";
import { IMAGE_TYPES, AUDIO_TYPES, VIDEO_TYPES, PDF_TYPES } from "./constants";

const Media = ({ block, contentState }) => {
  const entity = contentState.getEntity(block.getEntityAt(0));
  const type = entity.getType();
  const {
    name,
    size,
    url,
    title,
    artist,
    album,
    date,
    pictureBlob
  } = entity.getData();

  if (type === "IMAGE") {
    return <Image src={url} />;
  } else if (type === "AUDIO") {
    return (
      <Audio
        src={url}
        title={title}
        artist={artist}
        album={album}
        date={date}
        pictureBlob={pictureBlob}
      />
    );
  } else if (type === "VIDEO") {
    return <Video src={url} />;
  } else if (type === "PDF") {
    return <PDF src={url} />;
  } else {
    return <File src={url} name={name} size={size} download={false} />;
  }
};

class MyEditor extends React.Component {
  constructor(props) {
    super(props);
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
    this.state = {
      editorState: EditorState.createEmpty(),
      hasText: false
    };
    this.onChange = editorState => {
      const hasText = editorState.getCurrentContent().hasText();
      this.setState({ editorState, hasText });
    };
  }

  blur() {
    this.refs.editor.blur();
  }

  showBackdrop() {
    if (!this.state.showBackdrop) this.setState({ showBackdrop: true });
  }

  hideBackdrop() {
    if (this.state.showBackdrop) this.setState({ showBackdrop: false });
  }

  focus() {
    this.refs.editor.focus();
  }

  insertMedia(entities) {
    let { editorState } = this.state;
    entities.forEach(function(entityKey) {
      editorState = AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        " "
      );
    });
    this.onChange(editorState);
  }

  handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.target.files || event.dataTransfer.files;
    if (!files) return;
    let state = this.state;

    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(file);
      const { editorState } = state;
      let type = "FILE";
      if (IMAGE_TYPES.indexOf(file.type) !== -1) {
        type = "IMAGE";
      } else if (AUDIO_TYPES.indexOf(file.type) !== -1) {
        type = "AUDIO";
      } else if (VIDEO_TYPES.indexOf(file.type) !== -1) {
        type = "VIDEO";
      } else if (PDF_TYPES.indexOf(file.type) !== -1) {
        // type = 'PDF'
      }

      const t = this;

      // this is ridiculous
      if (type === "AUDIO") {
        musicmetadata(file, function(err, metadata) {
          const { title, artist, album, picture, date } = metadata.common;
          let pictureBlob;
          if (picture && picture.length > 0 && picture[0]) {
            pictureBlob = URL.createObjectURL(
              new Blob([picture[0].data], {
                type: "image/" + picture[0].format
              })
            );
          }
          const contentStateWithEntity = editorState
            .getCurrentContent()
            .createEntity(type, "IMMUTABLE", {
              file: file,
              name: file.name,
              type: file.type,
              size: file.size,
              title,
              artist,
              album,
              picture,
              pictureBlob,
              date,
              url: URL.createObjectURL(file)
            });
          const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
          const newEditorState = EditorState.set(editorState, {
            currentContent: contentStateWithEntity
          });

          t.setState({
            editorState: AtomicBlockUtils.insertAtomicBlock(
              newEditorState,
              entityKey,
              " "
            )
          });
        });
      } else {
        const contentStateWithEntity = editorState
          .getCurrentContent()
          .createEntity(type, "IMMUTABLE", {
            file: file,
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file)
          });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, {
          currentContent: contentStateWithEntity
        });

        this.setState({
          editorState: AtomicBlockUtils.insertAtomicBlock(
            newEditorState,
            entityKey,
            " "
          )
        });
      }
    }
  }

  onKeyCommand(command) {
    const { editorState } = this.state;
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  blockRenderer(block) {
    if (block.getType() === "atomic") {
      return { component: Media, editable: false };
    }

    return null;
  }

  render() {
    const { connectionError, peerCount, id } = this.props;
    return (
      <div
        onDragOver={e => {
          e.preventDefault();
        }}
        onDrop={this.handleDrop.bind(this)}
        className="relative mt3-ns mb2-ns flex overflow-auto"
      >
        <ReactCSSTransitionGroup
          transitionName="editor"
          transitionEnterTimeout={333}
          transitionLeaveTimeout={333}
        >
          {this.state.showBackdrop
            ? <div
                onClick={this.hideBackdrop.bind(this)}
                className="backdrop z-3 left-0 right-0 bottom-0 top-0 bg-black-90 blurred"
              />
            : null}
        </ReactCSSTransitionGroup>
        <div
          id="editor"
          className="z-4 post w-100 relative  b--transparent center"
        >
          <div className=" center bg-white ba-ns bb b--light-gray br2-ns">
            {
              <div className="pa3 fw6 w-100 flex flex-row items-start justify-between">
                <div className="flex items-center">
                  <div
                    className="h2 w2 br2 cover bg-light-gray"
                    style={{
                      backgroundImage: `url('https://ipfs.io/ipfs/${this.props.icon}')`
                    }}
                  />
                  <div className="ml2">
                    <span className="mv0 mr1 f6 fw6 near-black flex flex-row items-center">
                      {this.props.name}
                    </span>
                    <span
                      className={`fw5 nowrap ${connectionError ? "offline" : peerCount > 0 ? "connected" : "connecting"} f6`}
                    >
                      {connectionError
                        ? "offline"
                        : peerCount > 0 ? "online" : "connecting..."}
                    </span>
                  </div>
                </div>
                {this.state.showBackdrop || this.state.hasText
                  ? <button
                      onClick={
                        this.state.hasText
                          ? () => {
                              const contentState = this.state.editorState.getCurrentContent();
                              const blocks = contentState
                                .getBlocksAsArray()
                                .map(block => {
                                  const type = block.getType();
                                  if (type === "unstyled") {
                                    return {
                                      type: "text",
                                      text: block.getText()
                                    };
                                  }
                                  if (type === "blockquote") {
                                    return {
                                      type: "text",
                                      text: `> ${block.getText()}`
                                    };
                                  }
                                  if (type === "code-block") {
                                    return {
                                      type: "text",
                                      text: `\`${block.getText()}\``
                                    };
                                  }
                                  if (type === "header-one") {
                                    return {
                                      type: "text",
                                      text: `# ${block.getText()}`
                                    };
                                  }
                                  if (type === "header-two") {
                                    return {
                                      type: "text",
                                      text: `## ${block.getText()}`
                                    };
                                  }
                                  if (type === "header-three") {
                                    return {
                                      type: "text",
                                      text: `### ${block.getText()}`
                                    };
                                  }
                                  if (type === "unordered-list-item") {
                                    return {
                                      type: "text",
                                      text: `* ${block.getText()}`
                                    };
                                  }
                                  if (type === "atomic") {
                                    const entity = contentState.getEntity(
                                      block.getEntityAt(0)
                                    );
                                    const data = entity.getData();
                                    if (AUDIO_TYPES.indexOf(data.type) !== -1)
                                      return {
                                        title: data.title,
                                        artist: data.artist,
                                        album: data.album,
                                        date: data.date,
                                        picture: data.picture,
                                        type: data.type,
                                        file: data.file,
                                        name: data.name,
                                        size: data.size
                                      };
                                    return {
                                      type: data.type,
                                      file: data.file,
                                      name: data.name,
                                      size: data.size
                                    };
                                  } else {
                                    console.warn(
                                      "Unexpected block type: " + type
                                    );
                                    return null;
                                  }
                                });
                              this.props.onPublish(blocks);
                              this.setState({
                                editorState: EditorState.createEmpty(),
                                hasText: false
                              });
                              this.hideBackdrop();
                            }
                          : null
                      }
                      className={
                        this.state.hasText
                          ? "bright-blue ma0 pa0 bg-transparent bn fw4 f5 ml3 pointer"
                          : "bright-blue o-30 not-allowed ma0 pa0 bg-transparent bn fw5 f5 ml3"
                      }
                    >
                      Publish
                    </button>
                  : null}
              </div>
            }

            <div className={`serif f5 lh-copy pa3 pt0`}>
              <Editor
                onFocus={() => {
                  this.showBackdrop.bind(this)();
                }}
                editorState={this.state.editorState}
                blockRendererFn={this.blockRenderer}
                autoCapitalize={false}
                autoComplete={false}
                autoCorrect={false}
                handleKeyCommand={this.onKeyCommand.bind(this)}
                onChange={this.onChange}
                placeholder="Post anything..."
                ref="editor"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyEditor;
