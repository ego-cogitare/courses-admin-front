import React from 'react';
import FileManager from '../../../popup/StepEditContent.jsx';
import { buildUrl } from '../../../../../../core/helpers/Utils';
import { dispatch } from '../../../../../../core/helpers/EventEmitter';
import '../../../../../../staticFiles/css/courses/widgets/types/popup/ManageRectangle.css';

export default class ManageRectangle extends React.Component {

  constructor(props) {
    super(props);

    this.state = { ...this.props.item };
  }

  onSave() {
    const data = {
      icon: this.state.icon,
      title: this.refs.title.value,
      file: this.refs.file.value
    };
    this.props.onSave(data);
    dispatch('popup:close');
  }

  selectFiles() {
    dispatch('popup:show', {
      title: 'Select file',
      body: <FileManager
        filter='\.pdf'
        onAddComponents={this.handleAddComponents.bind(this)}
      />
    });
  }

  handleAddComponents(files) {
    dispatch('popup:close');
    this.refs.file.value = buildUrl(files[0]);
  }

  updateState(state) {
    this.setState(state);
  }

  onIconClick() {
    dispatch('popup:show', {
      title: 'Select icon',
      body: <FileManager
        filter='\.png|\.jpg|\.jpeg|\.gif'
        onAddComponents={this.onIconSelected.bind(this)}
      />
    });
  }

  onIconSelected(files) {
    this.setState({ icon: buildUrl(files[0]) });
    dispatch('popup:close');
  }

  render() {
    return (
      <div class="modal-body manage-rectangle">
        <div class="box-body">
          <div class="form-group">
            <label>Icon</label>
            <div class="input-group">
              <img width="80" onClick={this.onIconClick.bind(this)} src={this.state.icon || require('../../../../../../staticFiles/img/noimagefound.png')} alt="icon" />
            </div>
          </div>
          <div class="form-group">
            <label>Title</label>
            <input ref="title" type="text" class="form-control" defaultValue={this.props.item.title} placeholder="Enter first name" />
          </div>
          <div class="form-group">
            <label>File</label>
            <div class="input-group">
              <div class="input-group-btn">
                <button type="button" class="btn btn-primary" onClick={this.selectFiles.bind(this)}>Select</button>
              </div>
              <input type="text" ref="file" class="form-control" defaultValue={this.props.item.file} readOnly />
            </div>
          </div>
        </div>
        <div class="box-footer">
          <button type="submit" class="btn btn-primary pull-right" onClick={this.onSave.bind(this)}>Apply</button>
          <button type="submit" class="btn btn-default pull-right" onClick={() => dispatch('popup:close')}>Cancel</button>
        </div>
      </div>
    );
  }
}
