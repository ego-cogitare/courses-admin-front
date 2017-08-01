import React from 'react';
import FileManager from '../../../popup/StepEditContent.jsx';
import { dispatch } from '../../../../../../core/helpers/EventEmitter';
import '../../../../../../staticFiles/css/courses/widgets/types/popup/ManageHexagon.css';

export default class ManageHexagon extends React.Component {

  constructor(props) {
    super(props);

    this.state = { ...this.props.item };
  }

  onSave() {
    const data = {
      icon: this.state.icon,
      title: this.refs.title.value,
      file: this.refs.file.value,
      className: this.refs.valign.checked ? 'single-element' : ''
    };
    this.props.onSave(data);
    dispatch('popup:close');
  }

  buildUrl(file) {
    return config.backUrl + '/file/content?path=' + file.path + '&name=' + file.name;
  }

  selectFiles() {
    dispatch('popup:show', {
      title: 'Select media component',
      body: <FileManager
        filter='\.pdf'
        onAddComponents={this.handleAddComponents.bind(this)}
      />
    });
  }

  handleAddComponents(files) {
    dispatch('popup:close');
    this.refs.file.value = this.buildUrl(files[0]);
  }

  updateState(state) {
    this.setState(state);
  }

  renderIcon(iconClass) {
    return (
      <div
        class={"icon-wrapper".concat(this.state.icon === iconClass ? ' active' : '' )}
        onClick={() =>  this.setState({ icon: iconClass })}
      >
        <div class={"icon ".concat(iconClass)} />
      </div>
    );
  }

  render() {
    return (
      <div class="modal-body manage-hexagon">
        <div class="box-body">
          <div class="form-group">
            <label>Icon</label>
            <div class="icon-container clear">
              {this.renderIcon('hexagon-blue-cube')}
              {this.renderIcon('hexagon-red-arrow')}
              {this.renderIcon('hexagon-grey-arrow')}
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
          <div class="checkbox">
            <label>
              <input ref="valign" type="checkbox" defaultChecked={this.props.item.className === 'single-element'} /> Centered vertically
            </label>
          </div>
        </div>
        <div class="box-footer">
          <button type="submit" class="btn btn-primary pull-right" onClick={this.onSave.bind(this)}>Save</button>
          <button type="submit" class="btn btn-default pull-right" onClick={() => dispatch('popup:close')}>Cancel</button>
        </div>
      </div>
    );
  }
}
