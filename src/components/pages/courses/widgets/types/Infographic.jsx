import React from 'react';
import FileManager from '../../popup/StepEditContent.jsx';
import { dispatch } from '../../../../../core/helpers/EventEmitter';

export default class Infographic extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      src: this.props.step.body || ''
    };
  }

  selectFiles() {
    dispatch('popup:show', {
      title: 'Select media component',
      body: <FileManager
              filter='\.jpg|\.png|\.gif'
              onAddComponents={this.handleAddComponents.bind(this)}
            />
    });
  }

  buildUrl(file) {
    return config.backUrl + '/file/content?path=' + file.path + '&name=' + file.name;
  }

  handleAddComponents(files) {
    this.setState({ src: this.buildUrl(files[0]) });
    dispatch('popup:close');
  }

  // Serialize step body
  serialize() {
    return this.state.src;
  }

  render() {
    return (
      <div>
        <button class="btn btn-default" onClick={this.selectFiles.bind(this)}>Select picture</button>
        <div class="contents">
          <img width="100%" src={this.state.src} alt="" />
        </div>
      </div>
    );
  }
}
