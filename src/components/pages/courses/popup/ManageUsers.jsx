import React from 'react';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import BootstrapTable from 'reactjs-bootstrap-table';
import '../../../../staticFiles/css/courses/popup/ManageUsers.css';

export default class Manage extends React.Component {

  get rolesMap() {
    return {
      ROLE_USER: 'users',
      ROLE_TUTOR: 'tutors',
      ROLE_COORDINATOR: 'coordinators'
    }
  };

  constructor(props) {
    super(props);
    this.state = { content: [], selection: [] };
    this.userListSuccess = this.userListSuccessListener.bind(this);
  }

  componentDidMount() {
    subscribe('user:list:success', this.userListSuccess);
    dispatch('user:list', { page: 0, count: 999, roles: [this.props.role] });
  }

  removeSelected() {
    this.setState({
      content: this.state.content.filter(
        (u) => Object.keys(this.state.selection).indexOf(u.id) === -1
      )
    });
  }

  resetAddUserByEmailForm() {
    this.refs.userFirstName.value = '';
    this.refs.userLastName.value = '';
    this.refs.userEmail.value = '';
  }

  userListSuccessListener(data) {
    // Aleady added users to course
    let addedUsersIds = this.props.course[this.rolesMap[this.props.role]].map((u) => u.id);

    // Display only not yet added users
    this.setState({
      content: data.content.filter((u) => addedUsersIds.indexOf(u.id) === -1)
    });
  }

  componentWillUnmount() {
    unsubscribe('user:list:success', this.userListSuccess);
  }

  get columns() {
    return [
      { name: 'firstName', display: 'First name', sort: true },
      { name: 'lastName', display: 'Last name', sort: true },
      { name: 'email', display: 'Email', sort: true },
      { name: 'role', display: 'Role', sort: true },
    ];
  }

  onSort(colName, dir) {
    switch (dir) {
      case 'asc':
        this.setState({ content: this.state.content.sort((a, b) => a[colName] > b[colName] ? 1 : -1 ) });
      break;

      case 'desc':
        this.setState({ content: this.state.content.sort((a, b) => b[colName] > a[colName] ? 1 : -1 ) });
      break;

      default:
        this.setState({ content: this.state.content });
      break;
    }
  }

  onChange(selection) {
    this.setState({ selection });
  }

  onAddUsersButtonClick() {
    return this.props.onAddUsers(this.state.selection);
  }

  render() {
    return (
      <div>
        <div class="modal-body">

          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Add existing users</h3>
            </div>
            <div class="box-body course-add-user-container-popup">
              <BootstrapTable
                columns={this.columns}
                data={this.state.content}
                headers={true}
                resize={true}
                select="multiple"
                selected={this.state.selection}
                onSort={this.onSort.bind(this)}
                onChange={this.onChange.bind(this)}
              >
                <div>Nothing to display</div>
              </BootstrapTable>
            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary pull-right" onClick={this.onAddUsersButtonClick.bind(this)}>Add users</button>
            </div>
          </div>

          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Add new user</h3>
            </div>
            <div class="box-body">
              <div class="form-group">
                <label>First name</label>
                <input ref="userFirstName" type="text" class="form-control" placeholder="Enter first name" />
              </div>
              <div class="form-group">
                <label>Last name</label>
                <input ref="userLastName" type="text" class="form-control" placeholder="Enter last name" />
              </div>
              <div class="form-group">
                <label for="userEmail">User email</label>
                <input ref="userEmail" type="email" class="form-control" id="stepName" placeholder="Enter user email" />
              </div>
            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary pull-right" onClick={this.props.onAddUserByEmail}>Add user</button>
            </div>
          </div>

        </div>
      </div>
    );
  }
}
