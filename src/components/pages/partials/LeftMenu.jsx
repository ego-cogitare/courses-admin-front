import React from 'react';
import { Link } from 'react-router';
import { list as coursesListTutor } from '../../../actions/tutor/Course';
import { list as coursesListAdmin } from '../../../actions/Course';
import { dispatch, subscribe, unsubscribe } from '../../../core/helpers/EventEmitter';

export default class LeftMenu extends React.Component {

  constructor(props) {
    super(props);

    // Get logged user data
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

    this.state = { loggedUser, coursesList: [] };

    // Event listeners
    this.coursesListSuccess = this.coursesListSuccessListener.bind(this);
  }

  componentWillMount() {
    switch (this.state.loggedUser.role) {
      case 'ROLE_TUTOR': case 'ROLE_COORDINATOR':
        coursesListTutor(
          (coursesList) => this.setState({ coursesList }),
          (e) => {
            dispatch('notification:throw', {
              title: 'Error',
              message: e.responseJSON.message,
              type: 'danger'
            });
          }
        );
      break;

      case 'ROLE_ADMIN':
        dispatch('course:list', { page: 0, count: 999 });
        subscribe('course:list:success', this.coursesListSuccess);
      break;
    }
  }

  coursesListSuccessListener({ content: coursesList }) {
    this.setState({ coursesList });
  }

  componentWillUnmount() {
    unsubscribe('course:list:success', this.coursesListSuccess);
  }

  renderUsersStats() {
    return (
      <li class="treeview">
        <a href="#">
          <i class="fa fa-book"></i> <span>USER STATISTICS</span>
          <span class="pull-right-container">
            <i class="fa fa-angle-left pull-right"></i>
          </span>
        </a>
        <ul class="treeview-menu">
        {
          this.state.coursesList.map(({ id, name }) => (
            <li key={id}>
              <Link to={`/courses/stats/${id}`} activeClassName="active">
                <i class="fa fa-link"></i> <span>{name}</span>
              </Link>
            </li>
          ))
        }
        </ul>
      </li>
    );
  }

  render() {
    switch (this.state.loggedUser.role) {
      case 'ROLE_ADMIN':
        return (
          <aside class="main-sidebar">
            <section class="sidebar">
              <ul class="sidebar-menu">
                <li>
                  <Link to="/courses" activeClassName="active"><i class="fa fa-link"></i> <span>Courses</span></Link>
                </li>
                <li>
                  <Link to="/quiz" activeClassName="active"><i class="fa fa-link"></i> <span>Quiz</span></Link>
                </li>
                <li>
                  <Link to="/users" activeClassName="active"><i class="fa fa-link"></i> <span>Users</span></Link>
                </li>
                <li>
                  <Link to="/file-manager" activeClassName="active"><i class="fa fa-link"></i> <span>File manager</span></Link>
                </li>
                { this.renderUsersStats() }
              </ul>
            </section>
          </aside>
        );
      break;

      case 'ROLE_TUTOR':
        return (
          <aside class="main-sidebar">
            <section class="sidebar">
              <ul class="sidebar-menu">
                <li class="header"></li>
                { this.renderUsersStats() }
                <li>
                  <Link activeClassName="active" to="events"><i class="fa fa-calendar"></i> <span>Events</span></Link>
                </li>
              </ul>
            </section>
          </aside>
        );
      break;

      case 'ROLE_COORDINATOR':
        return (
          <aside class="main-sidebar">
            <section class="sidebar">
              <ul class="sidebar-menu">
                <li class="header"></li>
                { this.renderUsersStats() }
                <li class="header">Register Links</li>
                {
                  this.state.coursesList.map(({ id, name }) => (
                    <li key={id}>
                      <Link to={`/register-links/${id}`} activeClassName="active">
                        <i class="fa fa-link"></i>Add users to <span>{name}</span>
                      </Link>
                    </li>
                  ))
                }
              </ul>
            </section>
          </aside>
        );
      break;

      default:
        return null;
      break;
    }
  }
}
