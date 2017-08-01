import React from 'react';
import moment from 'moment';
import { dispatch, subscribe, unsubscribe } from '../../../../../core/helpers/EventEmitter';

export default class ConfirmDialog extends React.Component {

  onSave() {
    this.props.onSaveHandler({ forDate: this.props.forDate });
  }

  render() {
    return (
      <div>
        <div class="modal-body">
          Confirm to add new slot at <span class="text-bold">{moment(this.props.forDate).format('MMM DD, Y H:mm')}-{moment(this.props.forDate).add(45, 'minute').format('H:mm')}</span>
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
