import React from 'react';
import { dispatch } from '../../../../../../core/helpers/EventEmitter';
import '../../../../../../staticFiles/css/courses/widgets/types/popup/ManageTag.css';

export default class ManageTag extends React.Component {

  constructor(props) {
    super(props);

    this.state = { ...this.props.item };
  }

  onSave() {
    const data = {
      type: this.state.type,
      title: this.refs.title.value,
    };
    this.props.onSave(data);
    dispatch('popup:close');
  }

  renderIcon(type) {
    return (
      <div
        class={"icon-wrapper".concat(this.state.type === type ? ' active' : '' )}
        onClick={() =>  this.setState({ type })}
      >
        <div class={"icon ".concat(type)} />
      </div>
    );
  }

  render() {
    return (
      <div class="modal-body manage-tag">
        <div class="box-body">
          <div class="form-group">
            <label>Section</label>
            <div class="icon-container clear">
              {this.renderIcon('lamp')}
              {this.renderIcon('darts')}
              {this.renderIcon('chart')}
              {this.renderIcon('human')}
            </div>
          </div>
          <div class="form-group">
            <label>Title</label>
            <input
              type="text"
              class="form-control"
              placeholder="Enter tag title"
              ref="title"
              autoFocus
              defaultValue={this.props.item.title}
              onKeyDown={(e) => (e.keyCode === 13) && this.onSave()}
            />
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
