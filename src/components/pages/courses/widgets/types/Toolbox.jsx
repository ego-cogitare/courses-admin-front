import React from 'react';
import ManageRectangle from './popup/ManageRectangle.jsx';
import { dispatch } from '../../../../../core/helpers/EventEmitter';
import { buildUrl } from '../../../../../core/helpers/Utils';
import '../../../../../staticFiles/css/courses/widgets/types/Toolbox.css';

export default class Toolbox extends React.Component {

  constructor(props) {
    super(props);

    try {
      this.state = { body: JSON.parse(this.props.step.body) || [] };
    }
    catch (e) {
      this.state = { body: [] };
    }
  }

  handleAddComponents(files) {
    this.setState({ src: buildUrl(files) });
    dispatch('popup:close');
  }

  // Serialize step body
  serialize() {
    return JSON.stringify(this.state.body.filter((row) => row.columns.length > 0));
  }

  addRow() {
    this.setState({ body: [...this.state.body, { columns: [] }] });
  }

  addRectangle(rowId) {
    if (this.state.body[rowId].columns.length === 2) {
      return ;
    }
    // Add rectangle to the row
    this.state.body[rowId].columns.push({
      icon: '',
      title: 'Rectangle title',
      file: ''
    });
    this.setState({ body: this.state.body });
  }

  removeRectangle(rowId) {
    // Remove last rectangle
    this.state.body[rowId].columns.pop();
    this.setState({ body: this.state.body });
  }

  onRectangleUpdate(data) {
    // Update opened square
    Object.assign(this.openedRectangle, data);
    this.setState({ body: this.state.body });
  }

  editRectangle(rowId, columnId) {
    this.openedRectangle = this.state.body[rowId].columns[columnId];

    dispatch('popup:show', {
      title: 'Manage rectangle',
      body: <ManageRectangle
        item={this.openedRectangle}
        onSave={this.onRectangleUpdate.bind(this)}
      />
    });
  }

  render() {
    return (
      <div class="toolbox">
        <div class="contents">
          <div class="data">
            <div class="squares-section text-center">
            {
              this.state.body.map((row, rowKey) => (
                <div key={rowKey}>
                  <div class="fa fa-plus" onClick={this.addRectangle.bind(this, rowKey)}>&nbsp;</div>
                  <div class="fa fa-minus" onClick={this.removeRectangle.bind(this, rowKey)}></div>
                  <div class="square-row">
                    {
                      row.columns.map((column, columnKey) => (
                        <div class="square-column" key={columnKey}>
                          <div class="square" onClick={this.editRectangle.bind(this, rowKey, columnKey)}>
                            <div class={"icon"} style={{ backgroundImage: `url('${column.icon}')`}}></div>
                            <div class="descr">{column.title}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))
            }
            </div>
          </div>
          <div class="text-center" onClick={this.addRow.bind(this)} style={{ cursor: 'pointer' }}>Add row</div>
        </div>
      </div>
    );
  }
}
