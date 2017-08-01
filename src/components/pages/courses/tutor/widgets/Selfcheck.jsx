import React from 'react';
import '../../../../../staticFiles/css/courses/widgets/types/tutor/Selfcheck.css';

export default class Selfcheck extends React.Component {

  constructor(props) {
    super(props);

    console.log(this.props.step);

    this.SELECTED_OBJECT = 1;
    this.SELECTED_INDEXED = 2;

    this.percentsDefault = {
      lamp  : 0,
      darts : 0,
      chart : 0,
      human : 0,
    };

    try {
      this.state = {
        body: JSON.parse(this.props.step.body),
        percents: this.percentsDefault,
        storedData: this.props.step.storedConfig
      };
    }
    catch (e) {
      this.state = {
        body: [],
        percents: this.percentsDefault,
        storedData: null
      };
    }

    // Add checked attribute to the tag
    this.resetSelected();

    // Set checked attribute to true for tags
    this.setSelected(this.props.step.storedConfig);

    // Recalculate percents
    this.recalcPercents();

    // Rerender view
    this.setState({
      body: this.state.body,
      percents: this.state.percents,
      storedData: this.props.step.storedConfig
    });
  }

  resetSelected(rowId = -1) {
    this.state.body.forEach((row, currentRow) => {
      if (rowId > -1 && currentRow !== rowId) {
        return ;
      }
      row.forEach((tag) => Object.assign(tag, { checked: false }));
    });
  }

   isRowSelected(rowId = -1) {
    var selected = false;
    this.state.body.forEach((row, currentRow) => {
      if (rowId > -1 && currentRow !== rowId) {
        return ;
      }
      row.forEach((tag) => {
          if (tag.checked) selected = true;
      });
    });
    return selected;
  }

  /**
   * @param {type} type of selected tags to watch to (ex. lamp|darts|chart|human)
   * @param {returnResult} how to return result (as array of tag objects or an indexed array)
   * @return {Array}
   */
  getSelected(type = '', returnResult = this.SELECTED_OBJECT) {
    let selection = [];

    this.state.body.forEach((row, rowId) => {
      row.forEach((tag, tagId) => {
        if (tag.checked && (type === '' || type === tag.type)) {
          selection.push(returnResult === this.SELECTED_OBJECT ? tag : [rowId, tagId]);
        }
      });
    });
    return selection;
  }

  // Restore checked tags state from stored data
  setSelected(storedData) {
    storedData.forEach((point) => {
      const tag = this.state.body[point[0]][point[1]];
      if (typeof tag !== 'undefined') {
        Object.assign(tag, { checked: true });
      }
    });
  }

  getTagsByType(type = '') {
    let tags = [];

    this.state.body.forEach((row) => {
      row.forEach((tag) => {
        if (type === '' || type === tag.type) {
          tags.push(tag);
        }
      });
    });
    return tags;
  }

  recalcPercents() {
    Object.keys(this.percentsDefault).forEach((type) => {
      const percent = Math.round(this.getSelected(type, this.SELECTED_OBJECT).length / (this.getTagsByType(type).length || 1) * 100);
      this.state.percents[type] = percent;
    });
  }

  humanizeSectionType(section) {
    return Object.assign({
      lamp  : 'VISIONAR',
      darts : 'MACHER',
      chart : 'ANALYTIKER',
      human : 'MODERATOR',
    })[section];
  }

  get renderIcons() {
    return (
      <div>
        <div class="icons-wrapper">
        {
          Object.keys(this.percentsDefault).map((section, key) => (
            <div class="row" key={key}>
              <div class="clearfix">
                <div class="title text-left pull-left">
                  <span class="text-bold">{this.humanizeSectionType(section)}</span><br/>({this.state.percents[section]}%)
                </div>
                <div class={"icons pull-right ".concat(section)}>
                  <div class="grayscale"></div>
                  <div class="colour" style={{width: this.state.percents[section] + '%'}}></div>
                </div>
              </div>
            </div>
          ))
        }
        </div>
      </div>
    );
  }

  render() {
    return (
      <div class="self-check-section">
        <div class="tags-wrapper">
          {
            this.state.body.map((row, rowId) => (
              <div class="row text-center" key={rowId}>
                <ul class="tags">
                  {
                    row.map((tag, tagId) => (
                      <li key={tagId}>
                        <span class={'tag text-bold'.concat(tag.checked ? ' checked' : '')}>{tag.title}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            ))
          }
        </div>
        { this.state.storedData && this.renderIcons }
      </div>
    );
  }
}
