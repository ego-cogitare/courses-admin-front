import React from 'react';
import { dispatch, subscribe, unsubscribe } from '../../../core/helpers/EventEmitter';
import User from '../../../core/middleware/Quiz';
import { listByCourse } from '../../../actions/Lections'; 
import BootstrapTable from 'reactjs-bootstrap-table';
import EditQuiz from './popup/EditQuiz.jsx';
import AddQuiz from './popup/AddQuiz.jsx';

export default class Quiz extends React.Component {

  constructor(props) {
    super(props);

    this.state = { courses: [], quiz: [], lections: [], quizQuestions: [] };
    this.fetchSuccess = this.fetchSuccessListener.bind(this);
    this.cousesListSuccess = this.cousesListSuccessListener.bind(this);
    this.fetchQuestionSuccess = this.fetchQuestionListener.bind(this);
    this.updateQuestionSuccess = this.updateQuestionListener.bind(this);
    this.addQuestionSuccess = this.addQuestionListener.bind(this);
    this.deleteQuestionSuccess = this.deletedQuestionListener.bind(this);
  }

  componentWillMount() {
    dispatch('page:titles:change', { pageTitle: 'Quiz' });

    // Fetch courses list
    dispatch('course:list', { page: 0, count: 999 });

    subscribe('course:list:success', this.cousesListSuccess);
    subscribe('quiz:fetch:success', this.fetchSuccess);
    subscribe('quiz:question:fetch:success', this.fetchQuestionSuccess);
    subscribe('quiz:question:update:success', this.fetchQuestionSuccess);
    subscribe('quiz:question:add:success', this.addQuestionSuccess);
    subscribe('quiz:question:delete:success', this.deletedQuestionListener);
  }

  componentWillUnmount() {
    unsubscribe('course:list:success', this.cousesListSuccess);
    unsubscribe('quiz:fetch:success', this.fetchSuccess);
    unsubscribe('quiz:question:fetch:success', this.fetchQuestionSuccess);
    unsubscribe('quiz:question:update:success', this.fetchQuestionSuccess);
    unsubscribe('quiz:question:add:success', this.addQuestionSuccess);
    unsubscribe('quiz:question:delete:success', this.deletedQuestionListener);
  }

  updateQuestionListener() {
    dispatch('notification:throw', {
      title: 'Question',
      message: 'Question update successfully',
      type: 'info'
    });
  }

  addQuestionListener() {
    dispatch('notification:throw', {
      title: 'Question',
      message: 'Question add successfully',
      type: 'info'
    });
  }

  deletedQuestionListener() {
    dispatch('notification:throw', {
      title: 'Question',
      message: 'Question delete successfully',
      type: 'info'
    });
  }

  cousesListSuccessListener(r) {
    this.setState({ courses: r.content });
  }

  fetchSuccessListener(quiz) {
    this.setState({ quiz });
  }

  fetchQuestionListener(questions) {
    this.setState({
      quizQuestions: questions
    });
  }

  addQuiz() {
    if (!this.courseId) {
      dispatch('notification:throw', {
        title: 'Error',
        message: 'Please select course',
        type: 'danger'
      });
      return false;
    }
    dispatch('popup:show', {
      title: 'Add QUIZ',
      type: 'default',
      body: <AddQuiz action='add' lectionId={this.lectionId} />
    });
  }

  addQuizQuestion() {
    if (!this.quizId) {
      dispatch('notification:throw', {
        title: 'Error',
        message: 'Please select quiz',
        type: 'danger'
      });
      return false;
    }
    dispatch('popup:show', {
      title: 'Edit Quiz Question',
      type: 'default',
      body: <EditQuiz action='add'  quizId={this.quizId} />
    });
  }

  editQuiz(quizId, e) {
    e.preventDefault();

    dispatch('popup:show', {
      title: 'Edit QUIZ',
      type: 'default',
      body: <AddQuiz
              action='update'
              quizId={quizId}
              lectionId={this.lectionId}
              quiz={this.state.quiz.filter((quiz) => quiz.id === quizId)[0]}
            />
    });
  }

  editQuizQuestion(questionId, e) {
    e.preventDefault();

    let question = this.state.quizQuestions.filter((question) => question.id === questionId)[0];
    dispatch('popup:show', {
      title: 'Edit Question',
      type: 'default',
      body: <EditQuiz
          action='update'
          id={question.id}
          quizId={this.quizId}
          question={question}
      />
    });
  }

  deleteQuizQuestion(quiz, e) {
    e.preventDefault();

    dispatch('quiz:question:update', {...quiz, status: 'DELETED', answers: Object.assign({}, quiz.answers)});
    setTimeout(() => {
      dispatch('quiz:question:fetch', { quizId: this.quizId });
    }, 1000);

  }

  courseChanged(e) {
    this.courseId = e.target.value;

    listByCourse({
      courseId: this.courseId
    }, (r) => {
      this.setState({
        lections: r,
        quiz: [],
        quizQuestions: []
      });
    }, (e) => {
      console.error(e);
    });
  }

   lectionChanged(e) {
    this.lectionId = e.target.value;

    this.setState({
       quizQuestions: []
    });
    dispatch('quiz:fetch', { lectionId: this.lectionId });
  }

  quizChanged(quizId) {
    this.quizId = quizId;
    dispatch('quiz:question:fetch', { quizId: this.quizId });
  }

  get guizColumns() {
    return [
      { name: 'title', display: 'Quiz', sort: true },
      { name: 'status', display: 'Status', sort: true },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.editQuiz.bind(this, row.id)}>Edit</a>;
      } },
    ];
  }

  get guizQuestionColumns() {
    return [
      { name: 'question', display: 'Question', sort: true },
      { name: 'status', display: 'Status', sort: true },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.editQuizQuestion.bind(this, row.id)}>Edit</a>;
      } },
      { name: 'delete', display: 'Delete', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.deleteQuizQuestion.bind(this, row)}>Delete</a>;
      } },
    ];
  }

  onSort(colName, dir) {
    switch (dir) {
      case 'asc':
        this.setState({ quiz: this.state.quiz.sort((a, b) => a[colName] > b[colName] ? 1 : -1 ) });
      break;

      case 'desc':
        this.setState({ quiz: this.state.quiz.sort((a, b) => b[colName] > a[colName] ? 1 : -1 ) });
      break;

      default:
        this.setState({ quiz: this.state.quiz });
      break;
    }
  }

  onChange(selection) {
    this.quizChanged(Object.keys(selection).pop());
    this.setState({ selection });
  }

  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className="box box-primary">
            <div className="box-header with-border">
              <h3 className="box-title">Questions list</h3>
            </div>
            <div className="box-body">
              <div className="form-group">
                <label>Course</label>
                <select className="form-control select2 select2-hidden-accessible" onChange={this.courseChanged.bind(this)}>
                  <option value="">- Select course -</option>
                  {this.state.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                </select>
              </div>

               <div className="form-group">
                <label>Lection</label>
                <select className="form-control select2 select2-hidden-accessible" onChange={this.lectionChanged.bind(this)}>
                  <option value="">- Select course -</option>
                  {this.state.lections.map((lection) => <option key={lection.id} value={lection.id}>{lection.title}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="stepBody">Quiz list</label>
                <BootstrapTable
                  columns={this.guizColumns}
                  data={this.state.quiz}
                  headers={true}
                  resize={false}
                  select="single"
                  selected={this.state.selection}
                  onSort={this.onSort.bind(this)}
                  onChange={this.onChange.bind(this)}
                >
                  <div className="text-center">Nothing to display.</div>
                </BootstrapTable>
              </div>

              <div className="box-footer">
                <div className="btn-group pull-right">
                  <button type="submit" className="btn btn-primary" onClick={this.addQuiz.bind(this)}>Add Quiz</button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="stepBody">Question list</label>
                <BootstrapTable
                  columns={this.guizQuestionColumns}
                  data={this.state.quizQuestions}
                  headers={true}
                  resize={false}
                  select="single"
                  selected={this.state.selection}
                >
                  <div className="text-center">Nothing to display.</div>
                </BootstrapTable>
              </div>
            </div>
            <div className="box-footer">
              <div className="btn-group pull-right">
                <button type="submit" className="btn btn-primary" onClick={this.addQuizQuestion.bind(this)}>Add Question</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
