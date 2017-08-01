import React from 'react';
import { Link } from 'react-router';
import { dispatch } from '../../../core/helpers/EventEmitter';
import FileManager from './popup/StepEditContent.jsx';
import { add, update,  get } from '../../../actions/Lections';
import { buildUrl } from '../../../core/helpers/Utils';
import '../../../staticFiles/css/BootstrapTable.css';

export default class Lections extends React.Component {

  constructor(props) {
    super(props);

    this.courseId = this.props.params.courseId;
    this.lectionId = this.props.params.lectionId;
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: `Lection ${this.lectionId ? 'edit' : 'add'}`
    });

    // If lection id provided - get lection data
    if (this.lectionId) {
      get({ lectionId: this.lectionId },
        ({ img, title, status, description }) => {
          this.refs.img.src = img;
          this.refs.title.value = title;
          this.refs.status.value = status;
          this.refs.description.value = description;
        },
        (r) => console.error(r),
      );
    }
  }

  onImgClick() {
    dispatch('popup:show', {
      title: 'Select lection icon',
      body: <FileManager
        filter='\.jpg|\.jpeg|\.png|\.gif'
        onAddComponents={this.onFilesSelect.bind(this)}
      />
    });
  }

  onFilesSelect(files) {
    if (files.length === 0) {
      return ;
    }
    this.refs.img.src = buildUrl(files[0]);
    dispatch('popup:close');
  }

  onLectionSave(e) {
    e.preventDefault();

    const lection = {
      title: this.refs.title.value,
      description: this.refs.description.value,
      img: this.refs.img.src,
      courseId: this.props.params.courseId,
      status: this.refs.status.value,
      lectionId: this.lectionId
    };

    /*       FUNCTION NAME      */
    (this.lectionId ? update : add)(lection,
      (r) => {
        dispatch('notification:throw', {
          type: 'info',
          title: 'Success',
          message: 'Lection data saved'
        });
      },
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      }
    );
  }

  render() {
    return (
      <div class="row">
        <div class="col-xs-12">
          <div class="box box-primary">
            <div class="box-header with-border">
              <h3 class="box-title">Lection data</h3>
            </div>
            <div class="box-body">
              <div class="form-group">
                <label>Title</label>
                <input ref="title" type="text" class="form-control" placeholder="Enter lection title" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea ref="description" type="text" class="form-control" placeholder="Enter lection description" />
              </div>
              <div class="form-group">
                <label>Icon</label>
                <div>
                  <img ref="img" src={require('../../../staticFiles/img/noimagefound.png')} width="100" alt="icon" onClick={this.onImgClick.bind(this)} />
                </div>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select ref="status" class="form-control select2 select2-hidden-accessible">
                  <option value="">(Select status)</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="HIDDEN">Hidden</option>
                </select>
              </div>
            </div>
            <div class="box-footer">
              <button type="submit" class="btn btn-primary pull-right" onClick={this.onLectionSave.bind(this)}>
                Save
              </button>
              <Link class="btn btn-default pull-right" to={`/courses/edit/${this.props.params.courseId}`}>Back</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
