import React from 'react';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import '../../../../staticFiles/js/plugins/iCheck/icheck.min';
import '../../../../staticFiles/js/plugins/iCheck/minimal/blue.css';

export default class EditQuiz extends React.Component {

  constructor(props) {
    super(props);
    this.answerId = 1;
    this.state = { question: '', answers: [], correctAnswer: -1 };

    this.addSuccess = this.addSuccessListener.bind(this);
    this.updateSuccess = this.updateSuccessListener.bind(this);
  }

  componentDidMount() {
    console.log('Props', this.props);
    if (this.props.action === 'add') {
      this.addAnswer();
    }
    else if (this.props.action === 'update') {
      this.setState({
        question: this.props.question.question,
        answers: this.props.question.answers.map((text, id) => {
          id++;
          return {
            id,
            text,
            correct: id === this.props.question.correct
          };
        }),
        correctAnswer: this.props.question.correct
      });

      // Set answer id to next unique key
      this.answerId = this.props.question.answers.length + 1;
    }
    subscribe('quiz:question:add:success', this.addSuccess);
    subscribe('quiz:question:update:success', this.updateSuccess);
  }

  componentWillUnmount() {
    unsubscribe('quiz:question:add:success', this.addSuccess);
    unsubscribe('quiz:question:update:success', this.updateSuccess);
  }

  addSuccessListener(data) {
    dispatch('popup:close');

    // Update quiz list
    dispatch('quiz:question:fetch', { quizId: this.props.quizId });

  }

  updateSuccessListener(data) {
    // Update quiz list
    dispatch('quiz:question:fetch', { quizId: this.props.quizId });

    dispatch('notification:throw', {
      title: 'Quiz question updated',
      message: 'Quiz question updated successfully',
      type: 'info'
    });
  }

  addAnswer(text = '') {
    this.setState({
      answers: this.state.answers.concat({
        text,
        id: this.answerId++
      })
    });
  }

  deleteAnswer(id) {
    // If deleting last element
    if (this.state.answers.length === 1) {
      this.setState({ answers: this.state.answers.map((answer) => {
          if (answer.id === id) {
            answer.text = '';
          }
          return answer;
        })
      });
      return false;
    }
    this.setState({
      answers: this.state.answers.filter((answer) => answer.id !== id)
    });
  }

  updateQuestion(e) {
    this.setState({ question: e.target.value });
  }

  updateAnswer(id, e) {
    this.setState({ answers: this.state.answers.map((answer) => {
        if (answer.id === id) {
          answer.text = e.target.value;
        }
        return answer;
      })
    });
  }

  setCorrectAnswer(id) {
    this.setState({ correctAnswer: id });
  }

  answerOption(answer) {
    return (
      <div class="input-group" key={answer.id}>
        <span class="input-group-addon">
          <input
            type="radio"
            name="correctAnswer"
            title="Mark answer as correct"
            defaultValue={answer.id}
            defaultChecked={answer.correct}
            onClick={this.setCorrectAnswer.bind(this, answer.id)}
          />
        </span>
        <input
          type="text"
          class="form-control"
          value={answer.text}
          placeholder="Type and press <Enter> to another option"
          autoFocus
          onChange={this.updateAnswer.bind(this, answer.id)}
          onKeyDown={(e) => {
            if (e.which === 13) {
              this.addAnswer();
            }
          }}
        />
      <span class="input-group-addon" title="Delete answer" onClick={this.deleteAnswer.bind(this, answer.id)}>
          <i class="fa fa-remove text-danger"></i>
        </span>
      </div>
    );
  }

  saveQuiz() {
    // Search for correct answer
    let correctAnswer = -1;
    let key = 1;
    this.state.answers.forEach((answer) => {
      if (answer.text.trim() !== '') {
        if (this.state.correctAnswer === answer.id) {
          correctAnswer = key;
        }
        key++;
      }
    });

    if (correctAnswer < 1) {
      return false;
    }

    const quizData = {
      quizId: this.props.quizId,
      question: this.state.question,
      id: this.props.id,
      answers: Object.assign({}, this.state.answers.filter((a) => a.text.trim() !== '').map((a) => a.text)),
      correct: correctAnswer,
      status: 'PUBLISHED'
    };

    const action = (this.props.action === 'add') ? 'quiz:question:add' : 'quiz:question:update';

    dispatch(action, quizData);
  }

  render() {
    return (
      <div>
        <div class="modal-body">
          <div class="form-group">
            <label>Question</label>
            <input
              type="text"
              placeholder="Type quiz question"
              class="form-control"
              value={this.state.question}
              onChange={this.updateQuestion.bind(this)}
            />
          </div>
          <label>Answers</label>
          {this.state.answers.map((answer) => this.answerOption(answer))}
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-default"
            onClick={() => dispatch('popup:close')}>Cancel</button>
          <button
            type="button"
            class="btn btn-primary pull-right"
            onClick={this.saveQuiz.bind(this)}>{this.props.action === 'add' ? 'Add' : 'Update'}</button>
        </div>
      </div>
    );
  }
}
