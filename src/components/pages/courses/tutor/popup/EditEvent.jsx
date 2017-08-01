import React from 'react';
import moment from 'moment';
import { dispatch, subscribe, unsubscribe } from '../../../../../core/helpers/EventEmitter';

export default class EditEvent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      start: this.props.start,
      end: this.props.end
    };
  }

  onSave() {
    this.props.onSaveHandler({
      title: this.refs.title.value,
      description: this.refs.description.value,
      start: this.state.start,
      end: this.state.end
    });
  }

  strToTime(strTime) {
    let parts = strTime.split(':');
    return {
      hours: Number(parts[0]),
      minutes: Number(parts[1])
    };
  }

  render() {
    return (
      <div>
        <div class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input
              type="text"
              ref="title"
              placeholder="Type event title"
              class="form-control"
              autoFocus
            />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea
              type="text"
              ref="description"
              placeholder="Type event description"
              class="form-control"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-default"
            onClick={() => dispatch('popup:close')}>Cancel</button>
          <button
            type="button"
            class="btn btn-primary pull-right"
            onClick={this.onSave.bind(this)}>Add</button>
        </div>
      </div>
    );
  }
}
