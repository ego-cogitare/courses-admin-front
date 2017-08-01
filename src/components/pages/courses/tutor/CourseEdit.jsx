import React from 'react';
import moment from 'moment';
import CustomScroll from 'react-custom-scroll';
import { Link } from 'react-router';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import { getByCourseId as studentsList, getProgress, getMicroblog, getStoredData, getStatistics } from '../../../../actions/tutor/User';
import { get as getLectionInfo, getStepsByUser as lectionSteps } from '../../../../actions/Lections';
import { buildUrl } from '../../../../core/helpers/Utils';
import { Datetime } from 'react-datetime';
import Selfcheck from '../tutor/widgets/Selfcheck.jsx';
import '../../../../staticFiles/css/courses/widgets/Thermometer.css';

export default class CourseEdit extends React.Component {

  constructor(props) {
    super(props);

    this.courseId = null;
    this.students = [];
    this.state = {
      students: [],
      progress: [],
      lection: {},
      keylearnigs: [],
      questions: [],
      goals: [],
      selfAssignment: [],
      thermometer: [],
      thermometerPercent: 0,
      thermometerTopItems: [],
      texts: null,
      showLection: 0
    };
    this.fetchStudents({ courseId: this.props.params.id });
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: 'Manage course students'
    });
  }

  componentWillReceiveProps(props) {
    if (this.courseId !== props.params.id) {
      this.courseId = props.params.id;
      this.fetchStudents({ courseId: this.courseId });
    }
  }

  fetchStudents({ courseId }) {
    // Reset previous student state
    this.setState({ goals: [], texts: [], questions: [], selfAssignment: [], progress: [], });

    studentsList({ courseId },
      (r) => {
        this.students = r;
        this.setState({ students: r });
      },
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      },
    );
  }

  /**
   * Get all lections and fetch steps with SELFCECK type
   */
  fetchLectionSteps(lections, userId) {

    // Fetch lection steps
    lections.forEach(({ lectionId }) => {
      // Steps with type TOOLBOX
      let steps = [];

      lectionSteps(
        { lectionId, userId },
        (r) => {
          steps = [
            ...steps,
            ...r.filter(({ step }) => step.type === 'SELFCHECK' ).map(({ step }) => step)
          ];

          // Get saved config for the steps
          steps.forEach((step) => {
            getStoredData(
              { userId, key: step.id },
              (r) => {
                try {
                  // Try to parse step body
                  const storedConfig = JSON.parse(r.json);

                  // Extens step with step stored config
                  Object.assign(step, { storedConfig });

                  // Update state
                  this.setState({ selfAssignment: [...this.state.selfAssignment, step] });
                }
                catch (e) { }
              },
              (e) => console.error(e)
            );
          });
        },
        (e) => console.error(e)
      );
    });
  }

  onStudentSelect(studentId, e) {
    e.preventDefault();

    // Reset previous student state
    this.setState({ goals: [], texts: [], questions: [], selfAssignment: [] });

    getProgress({ userId: studentId, courseId: this.props.params.id },
      (r) => {
        this.setState({ progress: r, showLection: 0 });

        // Show information for the first lection
        this.lectionData(0);

        // Search for steps with type SELFCHECK in lection list
        this.fetchLectionSteps(r, studentId);
      },
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      },
    );

    getMicroblog(
      { userId: studentId, courseId: this.props.params.id },
      (r) => this.setState({ keylearnigs: r }),
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      }
    );

    getStoredData(
      { userId: studentId, key: 'goals' },
      (goals) => {
        try {
          this.setState({ goals: JSON.parse(goals.json) });
        }
        catch (e) { }
      },
      (e) => console.error(e)
    );

    getStoredData(
      { userId: studentId, key: 'texts' },
      (texts) => {
        try {
          this.setState({ texts: JSON.parse(texts.json) });
        }
        catch (e) { }
      },
      (e) => console.error(e)
    );

    getStoredData(
      { userId: studentId, key: 'questions' },
      (questions) => {
        try {
          this.setState({ questions: JSON.parse(questions.json) });
        }
        catch (e) { }
      },
      (e) => console.error(e)
    );

    getStoredData(
      { userId: studentId, key: 'thermometer' },
      (r) => {
        try {
          let marks = [];
          let storedConfig = JSON.parse(r.json).sort((a, b) => b.mark > a.mark ? 1 : -1);

          // Get total 3 items
          this.setState({ thermometerTopItems: storedConfig.slice(0, 3) });

          // Get total points sum
          let sum = 0;
          storedConfig.forEach(({ mark }) => sum += mark);

          if (sum <= 24) {
            this.setState({ thermometerPercent: 15 });
          }
          else if (sum >= 25 && sum <= 27) {
            this.setState({ thermometerPercent: 25 });
          }
          else if (sum >= 28 && sum <= 30) {
            this.setState({ thermometerPercent: 35 });
          }
          else if (sum >= 31 && sum <= 33) {
            this.setState({ thermometerPercent: 45 });
          }
          else if (sum >= 34 && sum <= 36) {
            this.setState({ thermometerPercent: 54 });
          }
          else if (sum >= 37 && sum <= 39) {
            this.setState({ thermometerPercent: 63 });
          }
          else if (sum >= 40 && sum <= 42) {
            this.setState({ thermometerPercent: 73 });
          }
          else if (sum >= 43 && sum <= 45) {
            this.setState({ thermometerPercent: 82 });
          }
          else if (sum >= 46 && sum <= 48) {
            this.setState({ thermometerPercent: 92 });
          }
          else if (sum >= 49) {
            this.setState({ thermometerPercent: 100 });
          }
        }
        catch (e) {
          this.setState({
            thermometerPercent: 0,
            thermometerTopItems: []
          });
          console.error(e);
        }
      },
      (e) => {
        this.setState({
          thermometerPercent: 0,
          thermometerTopItems: []
        });
        console.error(e);
      }
    );

    getStatistics({userId: studentId, courseId: this.props.params.id}, (r) => {
        this.setState({
          userStatistics: r
        });
    })
  }

  mapTextIdToQuestion(id) {
    return Object.assign({
      text1: 'Welche Deiner Eigenschaften, Kompetenzen oder Qualifikationen tragen besonders zur kreativen Problemlösung bei?',
      text2: 'In welchen konkreten Situationen ist Dir die kreative Problemlösung bereits gut gelungen?',
      text3: 'Wann und wo hast Du die besten Ideen?',
      text4: 'Was tust Du, damit Dir Deine Ideen nicht verloren gehen?',
      text5: 'Was blockiert Deine Kreativität?',
      text6: 'Was tust Du normalerweise, wenn Du bei der Lösung eines Problems nicht weiterkommst?',
      text7: 'Wo siehst Du Deinen größten Entwicklungsbedarf?',
    })[id] || '';
  }

  mapPersonalAnswer(pair) {
    return ['',
      'Extraversion',
      'Verträglichkeit',
      'Gewissenhaftigkeit',
      'Neurotizismus',
      'Offenheit',
    ][pair] || '';
  }


  onFilterChanged(e) {
    const filter = new RegExp(e.target.value, 'i');
    this.setState({
      students: this.students.filter(({ email, firstName, lastName }) => {
        return email.match(filter) || firstName.match(filter) || lastName.match(filter);
      })
    });
  }

  onLectionNavigate(key, e) {
    e.preventDefault();

    if (key === '-1') {
      if (this.state.showLection > 0) {
        key = this.state.showLection - 1;
      }
      else {
        key = 0;
      }
    }
    if (key === '+1') {
      if (this.state.showLection < this.state.progress.length - 1) {
        key = this.state.showLection + 1;
      }
      else {
        key = this.state.progress.length - 1;
      }
    }
    this.lectionData(key);
  }

  // Fetch current lection data
  lectionData(key) {
    if (typeof this.state.progress[this.state.showLection] === 'undefined') {
      return ;
    }
    getLectionInfo({ lectionId: this.state.progress[key].lectionId },
      (lection) => this.setState({ lection, showLection: key }),
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      }
    );
  }

  percents(param1, param2) {
    return Math.round(
      (this.state.progress[this.state.showLection][param1] / (this.state.progress[this.state.showLection][param2] || 1)) * 100
    );
  }

  progressValue(param) {
    return this.state.progress[this.state.showLection][param];
  }

  get personalAnswers() {
    let normalized = Object.keys(this.state.questions).map((key) => this.state.questions[key].mark);
    [0, 2, 3, 4, 6].forEach((i) => normalized[i] = 5 - normalized[i] + 1);

    return {
      normalized,
      getMark(pair) {
        // 0-5, 1-6, 2-7, 3-8, 4-9, pair 1..10 (1 = 1-1, 1+4)
        return (normalized[pair - 1] + normalized[pair + 4]) / 2;
      },
      getProgress(pair) {
        return (this.getMark(pair) / 5) * 100;
      }
    };
  }

  render() {
    return (
      <div class="tutor">
        <div class="row">
          <div class="col-md-12">
            <div class="box box-primary">
              <div class="box-header with-border">
                <h3 class="box-title">Students list</h3>
                <div class="input-group pull-right" style={{ width: '230px' }}>
                  <input type="text" class="form-control" onChange={this.onFilterChanged.bind(this)} placeholder="Type filter keyword" />
                  <span class="input-group-addon">
                    <i class="fa fa-search"></i>
                  </span>
                </div>
              </div>
              <div class="box-body data-table-container">
                <CustomScroll heightRelativeToParent="calc(305px)">
                  <ul class="users-list clearfix">
                    {
                      this.state.students.map(({ id, firstName, lastName, dateCreated, avatar }) => (
                        <li key={id} onClick={this.onStudentSelect.bind(this, id)}>
                          {
                            avatar ? <img src={buildUrl({ path: '/avatars', name: avatar })} alt="User Image" />
                                   : <img src={require('../../../../staticFiles/img/nouser.png')} alt="User Image" />
                          }
                          <a class="users-list-name" href="#">{firstName + ' ' + lastName }</a>
                          <span class="users-list-date">{moment(dateCreated).format('DD MMM, YYYY')}</span>
                        </li>
                      ))
                    }
                  </ul>
                </CustomScroll>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-xs-12">
            <div class="nav-tabs-custom">
              <ul class="nav nav-tabs">
                <li class="active">
                  <a href="#lection-stats" data-toggle="tab">Lection statistics</a>
                </li>
                <li>
                  <a href="#personality-check" data-toggle="tab">Personality Check</a>
                </li>
                <li>
                  <a href="#reflexionsfragen" data-toggle="tab">Reflexionsfragen</a>
                </li>
                <li>
                  <a href="#goals" data-toggle="tab">Deine Lernziele</a>
                </li>
                <li>
                  <a href="#microblog" data-toggle="tab">Microblogs</a>
                </li>
                <li>
                  <a href="#self-assignment" data-toggle="tab">Teamrollen</a>
                </li>
                <li>
                  <a href="#thermometer" data-toggle="tab">Herausforderungen</a>
                </li>
                <li>
                  <a href="#aha-punkte" data-toggle="tab">Aha-Punkte</a>
                </li>
              </ul>
              <div class="tab-content">
                <div class="tab-pane active" id="lection-stats">
                {
                  this.state.progress.length > 0 ?
                  <div>
                    <div class="clearfix" style={{ marginBottom: '8px' }}>
                      <ul class="pagination pagination-sm no-margin pull-right">
                        <li><a href="#" onClick={this.onLectionNavigate.bind(this, '-1')}>«</a></li>
                        {
                          this.state.progress.map(({lectionId}, key) => (
                            <li key={lectionId}>
                              <a href="#" onClick={this.onLectionNavigate.bind(this, key)}>{key + 1}</a>
                            </li>
                          ))
                        }
                        <li><a href="#" onClick={this.onLectionNavigate.bind(this, '+1')}>»</a></li>
                      </ul>
                    </div>
                    <div class="attachment-block clearfix">
                      <img class="attachment-img" src={this.state.lection.img} alt="Lection icon" />
                      <div>
                        <h4 class="attachment-heading">{this.state.lection.title}</h4>
                        <div class="attachment-text">
                          {this.state.lection.description}
                        </div>
                      </div>
                    </div>
                    <table class="table">
                      <tbody>
                        <tr>
                          <th class="text-center" style={{ width: '35px' }}>#</th>
                          <th style={{ width: '250px' }}>Task</th>
                          <th>Progress</th>
                          <th style={{ width: '40px' }}>Progress</th>
                        </tr>
                        <tr>
                          <td class="text-right">1.</td>
                          <td>Number of keylearnings</td>
                          <td></td>
                          <td class="text-center">
                            <span class="badge bg-red">{this.progressValue('numOfKeylearnings')}</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-right">2.</td>
                          <td>Number of finished quizs <b>({this.progressValue('numOfFinishedQuizs')}/{this.progressValue('numOfQuizs')})</b></td>
                            <td>
                            <div class="progress progress-xs progress-bar-yellow active">
                              <div class="progress-bar progress-bar-primary" style={{ width: this.percents('numOfFinishedQuizs', 'numOfQuizs') + '%' }}></div>
                            </div>
                          </td>
                          <td class="text-center">
                            <span class="badge bg-red">{this.percents('numOfFinishedQuizs', 'numOfQuizs')}%</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-right">3.</td>
                          <td>Number of finished steps <b>({this.progressValue('numOfFinishedSteps')}/{this.progressValue('numOfSteps')})</b></td>
                            <td>
                            <div class="progress progress-xs progress-bar-yellow active">
                              <div class="progress-bar progress-bar-primary" style={{ width: this.percents('numOfFinishedSteps', 'numOfSteps') + '%' }}></div>
                            </div>
                          </td>
                          <td class="text-center">
                            <span class="badge bg-red">{this.percents('numOfFinishedSteps', 'numOfSteps')}%</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="text-right">4.</td>
                          <td>Percentage of finish</td>
                            <td>
                            <div class="progress progress-xs progress-bar-yellow active">
                              <div class="progress-bar progress-bar-primary" style={{ width: this.progressValue('percentageOfFinish') + '%' }}></div>
                            </div>
                          </td>
                          <td class="text-center">
                            <span class="badge bg-red">{this.progressValue('percentageOfFinish')}%</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>
                <div class="tab-pane" id="personality-check">
                {
                  this.state.questions.length > 0 ?
                  <div class="wpap">
                    <table class="table">
                      <thead>
                        <tr>
                          <th class="text-center" style={{ width: '35px' }}>#</th>
                          <th>Question</th>
                          <th style={{ width: '64px' }}>Answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          this.state.questions.map(({ question, mark }, key) => (
                            <tr key={key}>
                              <td class="text-right">{key +1}.</td>
                              <td>{question}</td>
                              <td class="text-center">
                                <span class="badge bg-red">{mark} ({this.personalAnswers.normalized[key]})</span>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>

                    <table class="table">
                      <thead>
                        <tr>
                          <th style={{ width: '150px' }}>#</th>
                          <th>Progress</th>
                          <th class="text-center" style={{ width: '64px' }}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          [1, 2, 3, 4, 5].map((pair) => (
                            <tr key={pair}>
                              <td style={{ verticalAlign: 'middle' }}>{pair}. {this.mapPersonalAnswer(pair)}</td>
                              <td>
                                <div class="progress progress-xs progress-bar-yellow active">
                                  <div class="progress-bar progress-bar-primary" style={{ width: this.personalAnswers.getProgress(pair) + '%' }}></div>
                                </div>
                              </td>
                              <td class="text-center align-middle">
                                <span class="badge bg-red">{this.personalAnswers.getMark(pair)}</span>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>
                <div class="tab-pane" id="reflexionsfragen">
                {
                  this.state.texts ?
                  <table class="table">
                    <tbody>
                      <tr>
                        <th class="text-center" style={{ width: '35px' }}>#</th>
                        <th style={{ width: '49%' }}>Question</th>
                        <th>Answer</th>
                      </tr>
                      {
                        Object.keys(this.state.texts).map((id, key) => (
                          <tr key={key}>
                            <td class="text-right">{key + 1}.</td>
                            <td class="text-left">{this.mapTextIdToQuestion(id)}</td>
                            <td class="text-left">
                              {this.state.texts[id]}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>
                <div class="tab-pane" id="goals">
                {
                  this.state.goals.length > 0 ?
                  <table class="table">
                    <tbody>
                      <tr>
                        <th class="text-center" style={{ width: '35px' }}>#</th>
                        <th>Goal</th>
                      </tr>
                      {
                        this.state.goals.map((goal, key) => (
                          <tr key={key}>
                            <td class="text-right">{key + 1}.</td>
                            <td class="text-left">
                              {goal}
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>

                <div class="tab-pane" id="microblog">
                {
                  this.state.keylearnigs.length > 0 ?
                  <table class="table">
                    <tbody>
                      <tr>
                        <th class="text-center" style={{ width: '35px' }}>#</th>
                        <th style={{ width: '150px' }}>Lection</th>
                        <th style={{ width: '250px' }}>Step</th>
                        <th>Text</th>
                      </tr>
                      {
                        this.state.keylearnigs.map((item, key) => (
                          <tr key={item.keylearning.id}>
                            <td class="text-right">{key + 1}.</td>
                            <td>{ item.lectionEntity && item.lectionEntity.title }</td>
                            <td>{ item.step && item.step.name }</td>
                            <td>{ item.keylearning && item.keylearning.text }</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>

                <div class="tab-pane" id="self-assignment">
                {
                  this.state.selfAssignment.length > 1 ?
                  <div class="nav-tabs-custom">
                    <ul class="nav nav-tabs">
                    {
                      this.state.selfAssignment.map((step, key) => (
                        <li key={key} class={key === 0 ? 'active' : ''}>
                          <a href={`#${step.id}`} data-toggle="tab">{step.name}</a>
                        </li>
                      ))
                    }
                    </ul>
                    <div class="tab-content">
                    {
                      this.state.selfAssignment.map((step, key) => (
                        <div class={'tab-pane widget'.concat(key === 0 ? ' active' : '')} key={step.id} id={step.id}>
                          <div class="attachment-block text-left">
                            <div class="attachment-text" dangerouslySetInnerHTML={{ __html: step.description }}></div>
                          </div>
                          <Selfcheck step={step} />
                        </div>
                      ))
                    }
                    </div>
                  </div>
                  :
                  this.state.selfAssignment.length === 1 ?
                    <div class='widget'>
                      <div class="attachment-block text-left">
                        <div class="attachment-text" dangerouslySetInnerHTML={{ __html: this.state.selfAssignment[0].description }}></div>
                      </div>
                      <Selfcheck step={this.state.selfAssignment[0]} />
                    </div>
                    :
                    <div class="text-center">Nothing to show</div>
                }
                </div>

                <div class="tab-pane" id="thermometer">
                {
                  this.state.thermometerTopItems.length > 0 ?
                  <div class="content">
                    <section class="clear">
                      <div class="indicator left">
                        <div class="progress-wrapper">
                          <div class="indicator-progress" style={{ height: this.state.thermometerPercent + '%' }}></div>
                        </div>
                      </div>
                      <div class="indicator-descr left">
                        <p>Das Barometer zeigt Dir, wie herausfordernd Dein Alltag ist.</p><br />
                        <p>Je mehr Herausforderungen Du hast, desto höher steigt das Barometer.</p>
                      </div>
                    </section>
                    <section>
                      <div class="title">
                        <span class="text-extra-bold">Deine Ergebnisse</span>
                      </div>
                      <div class="descr">(Top 3 Herausforderungen)</div>
                      {
                        this.state.thermometerTopItems.map(({ question }, key) => (
                          <div class="row clear" key={key}>
                            <div class="number left">{key + 1}</div>
                            <div class="info-block left">
                              <div class="title">
                                {question}
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      <div class="question-block">Wenn Du Fragen oder Gesprächsbedarf hast, kontaktiere einfach Deinen Lernbegleiter im Messenger.</div>
                    </section>
                  </div>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>

                <div class="tab-pane" id="aha-punkte">
                {
                  this.state.userStatistics ?
                  <div class="wpap">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th style={{ width: '64px' }}>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                       <tr>
                         <td>Kurs-Fortschritt</td>
                         <td>{ this.state.userStatistics.averageLectionProgress}%</td>
                       </tr>
                        <tr>
                         <td>COMMUNITY</td>
                         <td>{ this.state.userStatistics.communityPoints }</td>
                       </tr>
                        <tr>
                         <td>MICRO BLOGS</td>
                         <td>{ this.state.userStatistics.microblogPoints }</td>
                       </tr>
                       <tr>
                         <td>QUIZ</td>
                         <td>{ this.state.userStatistics.quizPoints }</td>
                       </tr>
                       <tr>
                         <td><b>AHA SCORE</b></td>
                         <td>{ this.state.userStatistics.quizPoints + this.state.userStatistics.microblogPoints +  this.state.userStatistics.communityPoints}</td>
                       </tr>
                      
                      </tbody>
                    </table>
                  </div>
                  :
                  <div class="text-center">Nothing to show</div>
                }
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
