import React from 'react';
import FileView from '../../fileManager/partials/FileView.jsx';
import ParentDir from '../../fileManager/partials/ParentDir.jsx';
import Breadcumps from '../../fileManager/partials/Breadcumps.jsx';
import Filter from '../../fileManager/partials/Filter.jsx';
import { directoryFiles } from '../../../../actions/FileManager';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import '../../../../staticFiles/css/FileManager.css';

export default class FileManager extends React.Component {

  constructor(props) {
    super(props);
    const path = '/';
    this.state = { path, filesList: [], selectedFiles: [] };

    // Save links to listener functions
    this.directoryLoaded = this.directoryLoadedListener.bind(this);
  }

  componentDidMount() {
    // Set page titles
    dispatch('page:titles:change', { pageTitle: 'Step edit' });

    // Dispatch command to load root directory
    dispatch('file-manager:directory:load', { path: this.state.path });

    // Rerender files list on directory fetch
    subscribe('file-manager:directory:loaded', this.directoryLoaded);
  }

  componentWillUnmount() {
    unsubscribe('file-manager:directory:loaded', this.directoryLoaded);
  }

  closePopup() {
    dispatch('popup:close');
  }

  directoryLoadedListener(payload) {
    this.setState({
      path: payload.path,
      filesList: this.sortResult(payload.directoryFiles)
    });
    // Reset selected files on folder change
    this.resetSelectedFiles();
  }

  /**
   * Reset selected files
   */
  resetSelectedFiles(data) {
    data = data || [];
    this.state.selectedFiles.forEach(file => file.setState({ selected: false }));
    this.setState({ selectedFiles: data });
    data.forEach(file => file.setState({ selected: true }));
  }

  sortResult(result) {
    // Sort files by names asc
    let sortedList = (result || []).sort(
      (a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );

    // Pin directories to top and move files to the bottom of the list
    return sortedList
      .filter(el => el.type === 'directory')
      .concat(
        sortedList.filter(
          el => el.type !== 'directory'
        )
      );
  }

  /**
   * Add file to selected files list
   * @param {FileView}
   */
  addToSelection(fileView) {
    this.setState({ selectedFiles: this.state.selectedFiles.concat(fileView) });
  }

  /**
   * Remove file from selected files list
   * @param {FileView}
   * @return Seleted files list
   */
  removeFromSelection(fileView) {
    this.resetSelectedFiles(
      this.getSeltectedFiles().filter(item => fileView.props.id !== item.props.id)
    );
  }

  /**
   * Add or delete frile form selected files list
   * @param {FileView}
   * @param {Boolean} true - to add file to selection or false - elsewhere
   */
  handleSelection(fileView, isSelected) {
    isSelected ? this.addToSelection(fileView) : this.removeFromSelection(fileView);
  }

  /**
   * Handler for file open (on double click)
   * @param {Object} file - file data
   */
  openFile(file) {
    const path = file.path.replace(/\/$/, '') + '/' + file.name;

    switch (file.type) {
      case 'directory':
        dispatch('file-manager:directory:load', { path });
      break;

      default:
        return this.props.onAddComponents([file]);
      break;
    }
  }

  /**
   * Breadcumps path change event
   * @param {String} path - path to navigate file manager
   */
  pathChange(path) {
    // If navigating to current path
    if (this.state.path === path) {
      return false;
    }
    dispatch('file-manager:directory:load', { path });
  }

  /**
   * Get list of selected files
   * @return - selected files list
   */
  getSeltectedFiles() {
    return this.state.selectedFiles;
  }

  filterChange(e) {
    this.filter(e.target.value.toLowerCase());
  }

  filter(pattern) {
    this.setState({
      filesList: this.sortResult(
        directoryFiles.filter(
          file => !!file.name.toLowerCase().match(pattern.toLowerCase())
        )
      )
    });
    this.resetSelectedFiles();
  }

  addComponents() {
    return this.props.onAddComponents(
      this.state.selectedFiles.map((fileView) => fileView.props.file)
    );
  }

  get filesList() {
    if (this.state.filesList.length === 0) {
      return (
        <div class="directory-list text-center" style={{ paddingTop: '20px' }}>Nothing to display.</div>
      );
    }

    if (this.props.filter) {
      this.state.filesList = this.state.filesList
        .filter((file) => file.name.match(this.props.filter) || file.type === 'directory');
    }

    return (
      <div class="directory-list">
        {this.state.filesList.map((file, key) => {
          return (
              <FileView
                key={file.path + key}
                id={file.path + key}
                file={file}
                handleClick={this.handleSelection.bind(this)}
                handleDoubleClick={this.openFile.bind(this)}
              />
          );}
        )}
      </div>
    );
  }

  render() {
    let path = this.state.path.replace(/\/$/, '');

    return (
      <div>
        <div class="modal-body">
          <div class="file-manager clear">
            <div class="tool-bar clear">
              <ParentDir
                path={path}
                onDirectoryUp={this.pathChange.bind(this)}
              />
              <Breadcumps
                path={path}
                onPathChange={this.pathChange.bind(this)}
              />
              <Filter
                onFilterChange={this.filterChange.bind(this)}
              />
            </div>
            {this.filesList}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" onClick={() => dispatch('popup:close')}>Cancel</button>
          <button type="button" class="btn btn-primary" onClick={this.addComponents.bind(this)}>Add</button>
        </div>
      </div>
    );
  }
}
