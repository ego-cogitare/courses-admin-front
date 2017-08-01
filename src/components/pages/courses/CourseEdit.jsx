import React from 'react';
import { Link } from 'react-router';
import { dispatch, subscribe, unsubscribe } from '../../../core/helpers/EventEmitter';
import { listByCourse as lectionsByCourse,
         add as addLection,
         remove as removeLection
       } from '../../../actions/Lections';
import ManageUsersPopup from './popup/ManageUsers.jsx';
import BootstrapTable from 'reactjs-bootstrap-table';
import { getCourse, saveCourse } from '../../../actions/Course';
import { clearStream } from '../../../actions/Message';

export default class CourseEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = { name: '', lections: [], tutors: [], coordinators: [], users: [] };
    this.infoSuccess = this.infoSuccessListener.bind(this);
    this.usersAddSuccess = this.usersAddSuccessListener.bind(this);
    this.usersListSuccess = this.usersListSuccessListener.bind(this);
    this.usersDeleteSuccess = this.usersDeleteSuccessListener.bind(this);
    this.userRegisterSuccess = this.userRegisterSuccessListener.bind(this);

  }

  componentWillMount() {

    this.fetchLectionList();
    this.getCourse();
  }

   getCourse() {
    
    getCourse(this.props.params.id, (r) => {

      this.setState({
        course: r
      });

      this.refs.courseName.value = r.name;
      this.refs.courseDescription.value = r.description;
    }, (e) => {
      console.error(e);
    });

  }

  // Load lections list
  fetchLectionList() {
    lectionsByCourse({ courseId: this.props.params.id },
      (r) => this.setState({ lections: r }),
      (e) => console.error(e),
    );
  }

  // Fires on course info fetched from backend
  infoSuccessListener(courseData) {
    this.setState(courseData);
  }

  // Function fires on users successfully added to course
  usersAddSuccessListener(users) {
    dispatch('notification:throw', {
      type: 'info',
      title: 'Add users to course',
      message: 'Users add success'
    });

    // Reload added users list
    dispatch('course:users:list', this.props.params.id);

    // Remove just added users from popup list
    this.refs.manageUsersPopup.removeSelected();

    this.refs.manageUsersPopup.resetAddUserByEmailForm();
  }

  usersListSuccessListener(users) {
    this.setState({
      tutors: users.filter((item) => item.user.role === 'ROLE_TUTOR')
        .map((item) => ({...item.user, subscriptionId: item.id})),

      coordinators: users.filter((item) => item.user.role === 'ROLE_COORDINATOR')
        .map((item) => ({...item.user, subscriptionId: item.id})),

      users: users.filter((item) => item.user.role === 'ROLE_USER')
        .map((item) => ({...item.user, subscriptionId: item.id})),
    });
  }

  saveCourse() {
    let course = Object.assign({}, this.state.course);
    course.name = this.refs.courseName.value;
    course.description = this.refs.courseDescription.value;
    course.dateCreated = null;
    course.dateModified = null;
    saveCourse(course, (r) => {
      alert(1);
      this.getCourse();
    }); 
  }

  // Function fires on user success added by email
  userRegisterSuccessListener(user) {
    const payload = {
      courseId: this.props.params.id,
      userIds: [user.id]
    };
    dispatch('course:users:add', payload);
  }

  usersDeleteSuccessListener() {
    dispatch('notification:throw', {
      type: 'info',
      title: 'Delete users from course',
      message: 'Users deleted successfully'
    });

    // Reload added users list
    dispatch('course:users:list', this.props.params.id);
  }

  componentDidMount() {
    dispatch('page:titles:change', { pageTitle: 'Course manage' });
    dispatch('course:info', this.props.params.id);
    dispatch('course:users:list', this.props.params.id);
    subscribe('course:info:success', this.infoSuccess);
    subscribe('course:users:add:success', this.usersAddSuccess);
    subscribe('course:users:list:success', this.usersListSuccess);
    subscribe('course:users:delete:success', this.usersDeleteSuccess);
    subscribe('user:register:success', this.userRegisterSuccess);
  }

  componentWillUnmount() {
    unsubscribe('course:info:success', this.infoSuccess);
    unsubscribe('course:users:add:success', this.usersAddSuccess);
    unsubscribe('course:users:list:success', this.usersListSuccess);
    unsubscribe('course:users:delete:success', this.usersDeleteSuccess);
    unsubscribe('user:register:success', this.userRegisterSuccess);
  }

  deleteUser(subscription, e) {
    e.preventDefault();

    dispatch('course:users:delete', subscription.subscriptionId);
  }

  get userColumns() {
    return [
      { name: 'firstName', display: 'First name', sort: true },
      { name: 'lastName', display: 'Last name', sort: true },
      { name: 'email', display: 'Email', sort: true },
      { name: 'action', display: 'Delete', sort: false, width: 10, renderer: (row) => <a href="#" onClick={this.deleteUser.bind(this, row)}>Delete</a> },
    ];
  }

  get lectionColumns() {
    return [
      { name: 'title', display: 'Title', sort: true },
      { name: 'description', display: 'Description', sort: true },
      { name: 'status', display: 'Status', sort: true },
      { name: 'edit-steps', display: 'Steps', sort: false, width: 10, renderer: (row) => {
        return <Link to={`lection/steps/${row.id}`}><span>Manage</span></Link>;
      } },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <Link to={`lection/edit/${this.props.params.id}/${row.id}`}><span>Edit</span></Link>;
      } },
      { name: 'remove', display: 'Remove', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.removeLection.bind(this, row)}><span>Remove</span></a>;
      } },
    ];
  }

  onSort(role, colName, dir) {
    switch (dir) {
      case 'asc':
        this.setState({ data: this.state[role].sort((a, b) => a[colName] > b[colName] ? 1 : -1 ) });
      break;

      case 'desc':
        this.setState({ data: this.state[role].sort((a, b) => b[colName] > a[colName] ? 1 : -1 ) });
      break;

      default:
        this.setState({ data: this.state[role] });
      break;
    }
  }

  onChange(selection) {
    this.setState({ selection });
  }

  // Fires on add user to course by email button clicked
  handleAddUserByEmail() {
    const user = {
      firstName: this.refs.manageUsersPopup.refs.userFirstName.value,
      lastName: this.refs.manageUsersPopup.refs.userLastName.value,
      email: this.refs.manageUsersPopup.refs.userEmail.value,
      role: this.state.addUsersPopupRole
    };

    // Trigger event for user register
    dispatch('user:register', user);
  }

  handleAddUsers(users) {
    let payload = {
      courseId: this.props.params.id,
      userIds: Object.keys(users),
      role: this.state.addUsersPopupRole
    };
    dispatch('course:users:add', payload);
  }

  showUsersAddPopup(role) {
    this.setState({ addUsersPopupRole: role });

    setTimeout(() => {
      dispatch('popup:show', {
        title: 'Manage course users',
        type: 'default',
        body: this.manageUsersPopup
      });
    }, 100);
  }

  removeLection({ id: lectionId }, e) {
    e.preventDefault();

    removeLection({ lectionId },
      (r) => {
        this.fetchLectionList();

        dispatch('notification:throw', {
          type: 'warning',
          title: 'Success',
          message: 'Lection removed'
        });
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

  clearStream() {
    let confirm = window.confirm("Do you want delete all stream messages?");
    if (confirm) {
      clearStream(this.props.params.id, (r) => {
        alert('Success');
      }, (e) => {
        alert('Error clear stream');
      });
    }
  }

  render() {
    // Create manage users popup component
    this.manageUsersPopup =
      <ManageUsersPopup
        ref="manageUsersPopup"
        role={this.state.addUsersPopupRole}
        course={this.state}
        onAddUserByEmail={this.handleAddUserByEmail.bind(this)}
        onAddUsers={this.handleAddUsers.bind(this)}
      />;

    return (
      <div class="row">
         <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Edit course</h3>
            </div>
            <div class="box-body">
              <div class="form-group">
                <label>Name</label>
                <input ref="courseName" type="text" class="form-control" placeholder="Enter course name" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <input ref="courseDescription" type="text" class="form-control" placeholder="Enter course description" />
              </div>
              <div class="form-group">
                <label>Status</label>
                <select ref="courseStatus" class="form-control select2 select2-hidden-accessible">
                  <option value="PUBLISHED">Published</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary pull-right" onClick={ this.saveCourse.bind(this) }>Save</button>
            </div>
          </div>
        </div>
        
         <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Additional functional</h3>
            </div>
            <div class="box-body">
              <button onClick={ this.clearStream.bind(this) } className="btn btn-danger">Clear community stream</button>
            </div>
          </div>
        </div>

        <div class="col-xs-12">
          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li class="active"><a href="#tab_1" data-toggle="tab" aria-expanded="true">Tutors</a></li>
              <li class=""><a href="#tab_2" data-toggle="tab" aria-expanded="false">Coordinators</a></li>
              <li class=""><a href="#tab_3" data-toggle="tab" aria-expanded="false">Users</a></li>
            </ul>
            <div class="tab-content">
              <div class="tab-pane active" id="tab_1">
                <div>
                  <BootstrapTable
                    columns={this.userColumns}
                    data={this.state.tutors}
                    resize={false}
                    select="single"
                    selected={this.state.selection}
                    headers={true}
                    onSort={this.onSort.bind(this, 'tutors')}
                    onChange={this.onChange.bind(this)}
                  >
                    <div class="text-center">Nothing to display.</div>
                  </BootstrapTable>
                  <br />
                  <div class="box-footer">
                    <button type="submit" class="btn btn-primary pull-right" onClick={this.showUsersAddPopup.bind(this, 'ROLE_TUTOR')}>Add tutor</button>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="tab_2">
                <div>
                  <BootstrapTable
                    columns={this.userColumns}
                    data={this.state.coordinators}
                    headers={true}
                    resize={false}
                    select="single"
                    selected={this.state.selection}
                    onSort={this.onSort.bind(this, 'coordinators')}
                    onChange={this.onChange.bind(this)}
                  >
                    <div class="text-center">Nothing to display.</div>
                  </BootstrapTable>
                  <br />
                  <div class="box-footer">
                    <button type="submit" class="btn btn-primary pull-right" onClick={this.showUsersAddPopup.bind(this, 'ROLE_COORDINATOR')}>Add coordinator</button>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="tab_3">
                <BootstrapTable
                  columns={this.userColumns}
                  data={this.state.users}
                  headers={true}
                  resize={false}
                  select="single"
                  selected={this.state.selection}
                  onSort={this.onSort.bind(this, 'users')}
                  onChange={this.onChange.bind(this)}
                >
                  <div class="text-center">Nothing to display.</div>
                </BootstrapTable>
                <br />
                <div class="box-footer">
                  <button type="submit" class="btn btn-primary pull-right" onClick={this.showUsersAddPopup.bind(this, 'ROLE_USER')}>Add user</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Lections list</h3>
            </div>
            <div class="input-group pull-right" style={{ margin: '10px', width: '230px' }}>
              <input type="text" class="form-control" placeholder="Type filter keyword" />
              <span class="input-group-addon">
                <i class="fa fa-search"></i>
              </span>
            </div>
            <div class="box-body data-table-container">
              <BootstrapTable
                columns={this.lectionColumns}
                data={this.state.lections}
                headers={true}
                resize={true}
                select="single"
                selected={this.state.selection}
                onSort={this.onSort.bind(this, 'lections')}
                onChange={this.onChange.bind(this)}
              >
                <div>Nothing to display</div>
              </BootstrapTable>
            </div>
            <div class="box-footer">
              <Link className="btn btn-primary pull-right" to={`/lection/edit/${this.props.params.id}`}>Add lection</Link>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
