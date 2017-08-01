import React from 'react';
import { Link } from 'react-router';
import { dispatch, subscribe, unsubscribe } from '../../../core/helpers/EventEmitter';
import BootstrapTable from 'reactjs-bootstrap-table';
import WidgetWrapper from './WidgetWrapper.jsx';
import EditSelfAssignment from './popup/EditSelfAssignment.jsx';
import { get, update } from '../../../actions/Step';
import '../../../staticFiles/css/BootstrapTable.css';
import '../../../staticFiles/css/Courses.css';

export default class StepEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = { };
  }

  get trymbowygConfig() {
    return {
      autogrow: true,
      btnsDef: {
        align: {
          dropdown: ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ico: 'justifyLeft'
        },
        lists: {
          dropdown: ['unorderedList', 'orderedList'],
          ico: 'unorderedList'
        },
        styles: {
          dropdown: ['strong', 'em', 'del', 'underline'],
          ico: 'strong'
        }
      },
      btns: [
        ['viewHTML'],
        ['undo', 'redo'],
        ['formatting'],
        ['styles'],
        ['link'],
        ['align'],
        ['lists'],
        //['media'],
        ['foreColor', 'backColor'],
        ['horizontalRule'],
        ['removeformat'],
        ['table']
      ]
    };
  }

  initEditor() {
    $(this.refs.stepDescr).trumbowyg({ ...this.trymbowygConfig });
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: 'Step edit'
    });
    this.fetchStep();
  }

  updateInitialState(data) {
    this.bodyInitial = data.body;
    this.typeInitial = data.type;
  }

  fetchStep() {
    get({ id: this.props.params.id },
      (step) => {
        this.setState(step);

        // Body can not be null
        step.body = step.body || '';

        // Update step initial state
        this.updateInitialState(step);

        // Init trumbowyg editor
        this.initEditor();
      },
      (e) => console.error(e),
    );
  }

  nameChanged(e) {
    this.setState({ name: e.target.value });
  }

  statusChanged(e) {
    this.setState({ status: e.target.value });
  }

  typeChanged(e) {
    this.setState({ type: e.target.value });
    this.setState({ body: e.target.value !== this.typeInitial ? '' : this.bodyInitial });
  }

  saveChanges() {
    update({
        id: this.props.params.id,
        lectionId: this.props.params.lectionId,
        type: this.state.type,
        keylearningEnabled: this.state.keylearningEnabled,
        description: $('.trumbowyg-editor:eq(0)').html(),
        body: this.refs.widgetWrapper.serialize(),
        name: this.state.name,
        status: this.state.status
      },
      (step) => {
        dispatch('notification:throw', {
          title: 'Step changes saved',
          message: 'Changes saved successfuly',
          type: 'info'
        });

        // Update step initial state
        this.updateInitialState(step);
      },
      (e) => {
        dispatch('notification:throw', {
          title: 'Error',
          message: e.responseJSON.error,
          type: 'danger'
        })
      }
    );
  }

  get selfAssignmentColumns() {
    return [
      { name: 'question', display: 'Name', sort: true },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.editSelfAssignment.bind(this, row.id)}>Edit</a>;
      } },
      { name: 'delete', display: 'Delete', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.deleteSelfAssignment.bind(this, row.id)}>Delete</a>;
      } },
    ];
  }

  onSort(colName, dir) {
    switch (dir) {
      case 'asc':
        this.setState({ users: this.state.quiz.sort((a, b) => a[colName] > b[colName] ? 1 : -1 ) });
      break;

      case 'desc':
        this.setState({ users: this.state.quiz.sort((a, b) => b[colName] > a[colName] ? 1 : -1 ) });
      break;

      default:
        this.setState({ users: this.state.quiz });
      break;
    }
  }

  onChange(selection) {
    this.setState({ selection });
  }

  editSelfAssignment(assignmentId, e) {
    e.preventDefault();

    dispatch('popup:show', {
      title: 'Edit self assignment',
      type: 'default',
      body: <EditSelfAssignment
              action='update'
              stepId={this.props.params.id}
              assignment={this.state.selfAssigments.filter((a) => a.id === assignmentId)[0]}
              assignmentId={assignmentId}
            />
    });
  }

  addSelfAssignment() {
    dispatch('popup:show', {
      title: 'Add Self assignment',
      type: 'default',
      body: <EditSelfAssignment action='add' stepId={this.props.params.id} />
    });
  }

  deleteSelfAssignment(assignmentId, e) {
    e.preventDefault();
    dispatch('course:steps:selfassignment:delete', {
      stepId: this.props.params.id,
      assigmentId: assignmentId
    });
  }

  keylearning(e) {
    this.setState({ keylearningEnabled: e.target.checked });
  }

  render() {
    return (
      <div class="row">
        <div class="col-xs-12">
          <div class="nav-tabs-custom">
            <ul class="nav nav-tabs">
              <li class="active"><a href="#tab_builder" data-toggle="tab" aria-expanded="true">Builder</a></li>
              <li class=""><a href="#tab_questions" data-toggle="tab" aria-expanded="false">Self assignment</a></li>
            </ul>
            <div class="tab-content">
              <div class="tab-pane active" id="tab_builder">
                <div class="form-group">
                  <label for="stepName">Name</label>
                  <input type="text" class="form-control" value={this.state.name} onChange={this.nameChanged.bind(this)} id="stepName" placeholder="Enter step name" />
                </div>
                <div class="form-group">
                  <label for="keylearning">Keylearning</label><br/>
                  <input type="checkbox" id="keylearning" checked={this.state.keylearningEnabled} onChange={this.keylearning.bind(this)}/> Enabled
                </div>
                <div class="form-group">
                  <label for="stepDescr">Description</label>
                  <textarea ref="stepDescr" class="form-control" id="stepDescr" placeholder="Step contents" value={this.state.description} />
                </div>
                <div class="form-group">
                  <label for="stepStatus">Visibility</label>
                  <select ref="stepStatus" value={this.state.status} onChange={this.statusChanged.bind(this)} class="form-control" id="stepStatus">
                    <option value="PUBLISHED">Published</option>
                    <option value="HIDDEN">Hidden</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="stepType">Type</label>
                  <select ref="stepType" value={this.state.type} onChange={this.typeChanged.bind(this)} class="form-control" id="stepType">
                    <option value="VIDEO">Video</option>
                    <option value="TOOLBOX">Toolbox</option>
                    <option value="PRACTICAL_PART">Practical part</option>
                    <option value="INFOGRAPHIC">Infographic</option>
                    <option value="SELFCHECK">Selfcheck</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="stepBody">Contents</label>
                  <WidgetWrapper step={this.state} ref="widgetWrapper" />
                </div>
                <div class="box-footer">
                  <button type="submit" class="btn btn-primary pull-right" onClick={this.saveChanges.bind(this)}>Save</button>
                  <Link class="btn btn-default pull-right" to={`/lection/steps/${this.props.params.lectionId}`}>Back</Link>
                </div>
              </div>

              <div class="tab-pane" id="tab_questions">
                <div class="box-body data-table-container">
                  <div class="form-group">
                    <label for="stepBody">Questions list</label>
                    <BootstrapTable
                      columns={this.selfAssignmentColumns}
                      data={this.state.selfAssigments}
                      headers={true}
                      resize={false}
                      select="single"
                      selected={this.state.selection}
                      onSort={this.onSort.bind(this)}
                      onChange={this.onChange.bind(this)}
                    >
                      <div class="text-center">Nothing to display.</div>
                    </BootstrapTable>
                  </div>
                </div>
                <div class="box-footer">
                  <button type="submit" class="btn btn-primary pull-right" onClick={this.addSelfAssignment.bind(this)}>Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
