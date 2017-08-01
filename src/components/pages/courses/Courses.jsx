import React from 'react';
import { Link } from 'react-router';
import { dispatch, subscribe, unsubscribe } from '../../../core/helpers/EventEmitter';
import Course from '../../../core/middleware/Course';
import BootstrapTable from 'reactjs-bootstrap-table';
import '../../../staticFiles/css/BootstrapTable.css';
import { cloneCourse } from '../../../actions/Course';

export default class ViewAll extends React.Component {

  constructor(props) {
    super(props);
    this.state = { data: {}, selection: {}, count: 0, emptySelection: true };
    this.listSuccess = this.listSuccessListener.bind(this);
    this.addSuccess = this.addSuccessListener.bind(this);
    this.removeSuccess = this.removeSuccessListener.bind(this);
  }

  componentWillUnmount() {
    unsubscribe('course:list:success', this.listSuccess);
    unsubscribe('course:add:success', this.addSuccess);
    unsubscribe('course:remove:success', this.removeSuccess);
  }

  componentDidMount() {
    dispatch('page:titles:change', { pageTitle: 'Courses' });
    this.fetchCoursesList();

    subscribe('course:list:success', this.listSuccess);
    subscribe('course:add:success', this.addSuccess);
    subscribe('course:remove:success', this.removeSuccess);
  }

  // Fetch all courses
  fetchCoursesList() {
    dispatch('course:list', { page: 0, count: 999 });
  }

  // Update courses DataTable on fetch success
  updateCoursesList(list) {
    this.courses = list.content;
    this.setState({ data: list.content, count: list.numberOfElements });
  }

  listSuccessListener(list) {
    this.updateCoursesList(list);
  }

  addSuccessListener() {
    this.refs.courseName.value = '';

    // Fetch all courses
    this.fetchCoursesList();
  }

  removeSuccessListener() {
    // Fetch all courses
    this.fetchCoursesList();
  }

  addCourse() {
    let name = this.refs.courseName.value;
    let status = this.refs.courseStatus.value;
    dispatch('course:add', { name, status });
  }

  removeCourse(row, e) {
    e.preventDefault();
    let confirm = window.confirm('Do you want delete the course?');
    if (confirm)
      dispatch('course:remove', row.id);
  }

  cloneCourse(row, e) {
    e.preventDefault();
    let confirm = window.confirm('Do you want clone the course?');
    if (confirm) {
      cloneCourse(row.id, (r) => {
         dispatch('course:list', { page: 0, count: 999 });
      });
    }
  }

  get columns() {
    return [
      { name: 'name', display: 'Name', sort: true },
      { name: 'description', display: 'Description', sort: true },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <Link to={"courses/edit/" + row.id}><span>Edit</span></Link>;
      } },
      { name: 'remove', display: 'Remove', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.removeCourse.bind(this, row)}><span>Remove</span></a>;
      } },
       { name: 'clone', display: 'Clone', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.cloneCourse.bind(this, row)}><span>Clone</span></a>;
      } },
    ];
  }

  onSort(colName, dir) {
    switch (dir) {
      case 'asc':
        this.setState({ data: this.courses.sort((a, b) => a[colName] > b[colName] ? 1 : -1 ) });
      break;

      case 'desc':
        this.setState({ data: this.courses.sort((a, b) => b[colName] > a[colName] ? 1 : -1 ) });
      break;

      default:
        this.setState({ data: this.courses });
      break;
    }
  }

  onChange(selection) {
    this.setState({ selection });
  }

  doRemove() {
    console.log(this.state.selection);
  }

  filter(e) {
    this.setState({ data: this.courses
      .filter((el) => {
        return el.name.toLowerCase().match(e.target.value.toLowerCase());
      })
    });
  }

  render () {
    return (
      <div class="row">
        <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Add new course</h3>
            </div>
            <div class="box-body">
              <div class="form-group">
                <label>Name</label>
                <input ref="courseName" type="text" class="form-control" placeholder="Enter course name" />
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
              <button type="submit" class="btn btn-primary pull-right" onClick={this.addCourse.bind(this)}>Create course</button>
            </div>
          </div>
        </div>
        <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Courses List</h3>
            </div>
            <div class="input-group pull-right" style={{ margin: '10px', width: '230px' }}>
              <input type="text" class="form-control" onChange={this.filter.bind(this)} placeholder="Type filter keyword" />
              <span class="input-group-addon"><i class="fa fa-search"></i></span>
            </div>
            <div class="box-body data-table-container">
              <BootstrapTable
                columns={this.columns}
                data={this.state.data}
                headers={true}
                resize={true}
                select="single"
                selected={this.state.selection}
                onSort={this.onSort.bind(this)}
                onChange={this.onChange.bind(this)}
              >
                <div>Nothing to display</div>
              </BootstrapTable>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
