import React from 'react';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import '../../../../staticFiles/js/plugins/iCheck/icheck.min';
import '../../../../staticFiles/js/plugins/iCheck/minimal/blue.css';

export default class EditSelfAssignment extends React.Component {

  constructor(props) {
    super(props);
    this.state = { question: '' };

    this.addSuccess = this.addSuccessListener.bind(this);
    this.updateSuccess = this.updateSuccessListener.bind(this);
  }

  componentDidMount() {
    if (this.props.action === 'update') {
      this.setState({ question: this.props.assignment.question });
    }

    subscribe('course:steps:selfassignment:add:success', this.addSuccess);
    subscribe('course:steps:selfassignment:update:success', this.updateSuccess);
  }

  componentWillUnmount() {
    unsubscribe('course:steps:selfassignment:add:success', this.addSuccess);
    unsubscribe('course:steps:selfassignment:update:success', this.updateSuccess);
  }

  addSuccessListener(data) {
    dispatch('popup:close');

    // Update quiz list
    dispatch('course:steps:info', this.props.stepId);

    dispatch('notification:throw', {
      title: 'Self assignment added',
      message: 'Self assignment added successfully',
      type: 'info'
    });
  }

  updateSuccessListener(data) {
    // Update quiz list
    dispatch('course:steps:info', this.props.stepId);

    dispatch('notification:throw', {
      title: 'Self assignment updated',
      message: 'Self assignment updated successfully',
      type: 'info'
    });
  }

  updateQuestion(e) {
    this.setState({ question: e.target.value });
  }

  save() {
    const action = (this.props.action === 'add') ?
      'course:steps:selfassignment:add' :
      'course:steps:selfassignment:update';

    dispatch(action, {
      stepId: this.props.stepId,
      assigmentId: this.props.assignmentId,
      question: this.state.question
    });
  }

  render() {
    return (
      <div>
        <div class="modal-body">
          <div class="form-group">
            <label>Question</label>
            <input
              type="text"
              placeholder="Type self assignment question"
              class="form-control"
              value={this.state.question}
              onChange={this.updateQuestion.bind(this)}
              onKeyDown={(e) => e.which === 13 && this.save() }
              autoFocus
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
            onClick={this.save.bind(this)}>{this.props.action === 'add' ? 'Add' : 'Update'}</button>
        </div>
      </div>
    );
  }
}
