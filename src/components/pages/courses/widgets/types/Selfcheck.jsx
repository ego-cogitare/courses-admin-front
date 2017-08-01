import React from 'react';
import ManageTag from './popup/ManageTag.jsx';
import { dispatch } from '../../../../../core/helpers/EventEmitter';
import '../../../../../staticFiles/css/courses/widgets/types/Selfcheck.css';

export default class Selfcheck extends React.Component {
  constructor(props) {
    super(props);

    try {
      this.state = { body: JSON.parse(this.props.step.body) || [] };
    }
    catch (e) {
      this.state = { body: [] };
    }
  }

  // Serialize step body
  serialize() {
    return JSON.stringify(this.state.body.filter((row) => row.length > 0));
  }

  addRow() {
    this.setState({ body: [...this.state.body, []] });
  }

  addTag(rowId) {
    this.state.body[rowId].push({ title: 'Tag title', type: '' });
    this.setState({ body: this.state.body });
  }

  removeTag(rowId) {
    this.state.body[rowId].pop();
    this.setState({ body: this.state.body });
  }

  editTag(tag, e) {
    e.preventDefault();
    this.openedTag = tag;

    dispatch('popup:show', {
      title: 'Manage tag',
      body: <ManageTag
        item={this.openedTag}
        onSave={this.onTagUpdate.bind(this)}
      />
    });
    // console.log(tag);
  }

  onTagUpdate(data) {
    // Update opened tag
    Object.assign(this.openedTag, data);
    this.setState({ body: this.state.body });
  }

  render() {
    return (
      <div class="self-check">
        <div class="contents">
          <div class="data">
            <div class="tags-wrapper">
              {
                this.state.body.map((row, rowId) => (
                  <div key={rowId}>
                    <div class="controls text-center">
                      <div class="fa fa-plus" onClick={this.addTag.bind(this, rowId)}>&nbsp;</div>
                      <div class="fa fa-minus" onClick={this.removeTag.bind(this, rowId)}></div>
                    </div>
                    <div class="tags-row">
                      <ul class="tags">
                        {
                          row.map((tag, tagId) => (
                            <li class={tag.type ? 'icon self-check-'.concat(tag.type) : ''} key={tagId} onClick={this.editTag.bind(this, tag)}>
                              <a href="#" class="tag text-bold">{tag.title}</a>
                            </li>
                          ))
                        }
                      </ul>
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
