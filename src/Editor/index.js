import React from "react";
import { AtomicBlockUtils, Editor, EditorState } from "draft-js";
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
    this.state = {
      editorState: EditorState.createEmpty(),
      hasText: false
    };
    this.onChange = editorState => {
      const hasText = editorState.getCurrentContent().hasText();
      this.setState({ editorState, hasText });
    };
  }

  componentDidMount() {
    // setTimeout(this.focus, 1000);
    this.focus();
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

  blockRenderer(block) {
    if (block.getType() === "atomic") {
      return { component: Media, editable: false };
    }

    return null;
  }

  render() {
    return (
      <div
        onDragOver={e => {
          e.preventDefault();
        }}
        onDrop={this.handleDrop.bind(this)}
        className="modal fixed blurred absolute--fill pv4-ns bg-black-90 overflow-auto"
      >
        <div id="editor" className="mv4-ns bt-ns b--transparent center">
          <div className="post w-100 center bg-white ba-ns b--light-gray br2-ns">
            <div className="pa3 fw6 w-100 flex flex-row items-start justify-between">

              <div className="flex items-center">

                <div
                  className="h2 w2 br2 cover bg-near-black"
                  style={{
                    backgroundImage: `url('https://ipfs.io/ipfs/${this.props.icon}')`
                  }}
                />
                <div className="ml2">
                  <span className="mv0 mr1 f6 fw6 near-black flex flex-row items-center">
                    {this.props.name}
                  </span>

                  <time className="f6 fw4 silver" dateTime="999999">
                    {"now"}
                  </time>
                </div>

              </div>

              <div>
                <button
                  className="light-silver ma0 pa0 bg-transparent bn fw4 f5 hover-silver pointer"
                  onClick={this.props.onClose}
                >
                  {"Close"}
                </button>
                <button
                  onClick={
                    this.state.hasText
                      ? () => {
                          const contentState = this.state.editorState.getCurrentContent();
                          const blocks = contentState
                            .getBlocksAsArray()
                            .map(block => {
                              const type = block.getType();
                              if (type === "unstyled") {
                                return { type: "text", text: block.getText() };
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
                                console.warn("Unexpected block type: " + type);
                                return null;
                              }
                            });
                          this.props.onPublish(blocks);
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

              </div>
            </div>

            <div className={`serif f5 lh-copy ph3 pb3`}>
              <Editor
                editorState={this.state.editorState}
                blockRendererFn={this.blockRenderer}
                autoCapitalize={false}
                autoComplete={false}
                autoCorrect={false}
                // handleKeyCommand={this.onKeyCommand.bind(this)}
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
