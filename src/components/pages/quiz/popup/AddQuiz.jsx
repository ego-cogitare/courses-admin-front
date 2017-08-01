import React from 'react';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import '../../../../staticFiles/js/plugins/iCheck/icheck.min';
import '../../../../staticFiles/js/plugins/iCheck/minimal/blue.css';

export default class AddQuiz extends React.Component {

    constructor(props) {
        super(props);
        this.state = { title: '',
            status: 'ENABLED'};

       this.addSuccess = this.addSuccessListener.bind(this);
       this.updateSuccess = this.updateSuccessListener.bind(this);
    }

    componentDidMount() {
        if (this.props.action === 'update') {
            this.setState(this.props.quiz);
        }
        subscribe('quiz:add:success', this.addSuccess);
        subscribe('quiz:update:success', this.updateSuccess);
    }

    componentWillUnmount() {
        unsubscribe('quiz:add:success', this.addSuccess);
        unsubscribe('quiz:update:success', this.updateSuccess);
    }

    get statuses() {
        return ['ENABLED', 'DISABLED'];
    }
    
    addSuccessListener(data) {
        dispatch('popup:close');

        // // Update quiz list
        dispatch('quiz:fetch', { lectionId: this.props.lectionId });

    }

    updateSuccessListener(data) {
        // Update quiz list
        dispatch('popup:close');

        dispatch('quiz:fetch', { lectionId: this.props.lectionId });

        dispatch('notification:throw', {
            title: 'Quiz updated',
            message: 'Quiz updated successfully',
            type: 'info'
        });
    }

    updateTitle(e) {
        this.setState({
            title: e.target.value
        });
    }

    updateStatus(e) {
        this.setState({
            status: e.target.value
        });
    }

    saveQuiz() {

        if (this.state.title.length == 0) {
            return false;
        }

        const quizData = {
            lectionId: this.props.lectionId,
            id: this.state.id,
            title: this.state.title,
            status: this.state.status
        };

        const action = (this.props.action === 'add') ? 'quiz:add' : 'quiz:update';

        dispatch(action, quizData);
        return true;
    }

    render() {
        return (
            <div>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="title-field">Quiz</label>
                        <input
                            id="title-field"
                            type="text"
                            placeholder="Type quiz question"
                            className="form-control"
                            value={this.state.title}
                            onChange={this.updateTitle.bind(this)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status-select">Status</label>
                        <select id="status-select"
                                className="form-control"
                                value={this.state.status}
                                onChange={this.updateStatus.bind(this)}
                        >
                            {this.statuses.map((status) => {
                                return (
                                    <option key={status} value={status}>{status}</option>
                                );
                            })}
                        </select>
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-default"
                        onClick={() => dispatch('popup:close', '')}>Cancel</button>
                    <button
                        type="button"
                        className="btn btn-primary pull-right"
                        onClick={this.saveQuiz.bind(this)}>{this.props.action === 'add' ? 'Add' : 'Update'}</button>
                </div>
            </div>
        );
    }
}
