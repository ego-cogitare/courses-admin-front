import React from 'react';
import { Link } from 'react-router';
import { dispatch } from '../../../core/helpers/EventEmitter';
import BootstrapTable from 'reactjs-bootstrap-table';
import { stepsListById, stepAdd } from '../../../actions/Lections';
import { remove } from '../../../actions/Step';
import '../../../staticFiles/css/BootstrapTable.css';

export default class ManageSteps extends React.Component {

  constructor(props) {
    super(props);

    this.state = { steps: [] };
    this.fetchSteps();
  }

  fetchSteps() {
    stepsListById({ lectionId: this.props.params.lectionId },
      (steps) => this.setState({ steps }),
      (e) => console.error(e),
    );
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: 'Lection steps'
    });
  }

  getStepTypeIcon(step) {
    const mapSrc = {
      VIDEO          : 'video.png',
      INFOGRAPHIC    : 'mosaic.png',
      PRACTICAL_PART : 'reading.png',
      TOOLBOX        : 'bag.png',
      SELFCHECK      : 'notices.png',
    };
    return mapSrc[step.type] ? (
      <img src={require('../../../staticFiles/img/step-type/' + mapSrc[step.type])}
           alt={step.type}
           title={step.type}
      />
    ) : step.type;
  }

  onStepAdd() {
    stepAdd({
        lectionId   : this.props.params.lectionId,
        name        : this.refs.stepName.value,
        description : this.refs.stepDescr.value,
        type        : this.refs.stepType.value,
        status      : this.refs.stepStatus.value
      },
      (r) => {
        this.fetchSteps();
        dispatch('notification:throw', {
          title: 'Success',
          message: 'Step successfuly added',
          type: 'info'
        });
      },
      (e) => {
        dispatch('notification:throw', {
          title: 'Error',
          message: e.responseJSON.error,
          type: 'danger'
        });
      },
    );
  }

  get columns() {
    return [
      { name: 'name', display: 'Name', sort: true },
      { name: 'description', display: 'Description', sort: true },
      { name: 'type', display: 'Type', sort: true },
      { name: 'status', display: 'Status', sort: true },
      { name: 'edit', display: 'Edit', sort: false, width: 10, renderer: (row) => {
        return <Link to={`step/edit/${this.props.params.lectionId}/${row.id}`}><span>Edit</span></Link>;
      } },
      { name: 'remove', display: 'Remove', sort: false, width: 10, renderer: (row) => {
        return <a href="#" onClick={this.removeStep.bind(this, row)}><span>Remove</span></a>;
      } },
    ];
  }

  removeStep({ id }, e) {
    e.preventDefault();

    remove({ id },
      (r) => this.fetchSteps(),
      (e) => {
        dispatch('notification:throw', {
          title: 'Error',
          message: e.responseJSON.error,
          type: 'danger'
        });
      }
    );
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

  render() {
    return (
      <div class="row">
        <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Lection steps</h3>
            </div>
            <div class="box-body">
              <BootstrapTable
                columns={this.columns}
                data={this.state.steps}
                headers={true}
                resize={false}
                select="single"
                onSort={this.onSort.bind(this, 'steps')}
                onChange={this.onChange.bind(this)}
              >
                <div>Nothing to display</div>
              </BootstrapTable>
            </div>
          </div>

          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Lection steps</h3>
            </div>
            <div class="box-body">
              <div class="form-group">
                <label for="stepName">Name</label>
                <input ref="stepName" type="text" class="form-control" id="stepName" placeholder="Enter step name" />
              </div>
              <div class="form-group">
                <label for="stepDescr">Description</label>
                <textarea ref="stepDescr" type="text" class="form-control" id="stepDescr" placeholder="Enter step description" />
              </div>
              <div class="form-group">
                <label for="stepType">Type</label>
                <select ref="stepType" class="form-control select2 select2-hidden-accessible">
                  <option value="">(Select type)</option>
                  <option value="VIDEO">Video</option>
                  <option value="TOOLBOX">Toolbox</option>
                  <option value="PRACTICAL_PART">Practical part</option>
                  <option value="INFOGRAPHIC">Infographic</option>
                  <option value="SELFCHECK">Selfcheck</option>
                </select>
              </div>
              <div class="form-group">
                <label for="stepStatus">Status</label>
                <select ref="stepStatus" class="form-control select2 select2-hidden-accessible">
                  <option value="">(Select status)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary pull-right" onClick={this.onStepAdd.bind(this)}>Add step</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
