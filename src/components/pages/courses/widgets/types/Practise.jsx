import React from 'react';
import ManageHexagon from './popup/ManageHexagon.jsx';
import { dispatch } from '../../../../../core/helpers/EventEmitter';
import '../../../../../staticFiles/css/courses/widgets/types/Practise.css';

export default class Practise extends React.Component {

  constructor(props) {
    super(props);

    try {
      this.state = { body: JSON.parse(this.props.step.body) || [] };
    }
    catch (e) {
      this.state = { body: [] };
    }
  }

  buildUrl(file) {
    return config.backUrl + '/file/content?path=' + file.path + '&name=' + file.name;
  }

  handleAddComponents(files) {
    this.setState({ src: this.buildUrl(files) });
    dispatch('popup:close');
  }

  // Serialize step body
  serialize() {
    return JSON.stringify(this.state.body.filter((section) => {
      return section.columns[0].length > 0 || section.columns[1].length > 0 || section.columns[2].length > 0;
    }));
  }

  addSection() {
    this.setState({ body: [...this.state.body, { columns: [[],[],[]] }] });
  }

  addHexagon(sectionId, columnId) {
    // Add hexagon to the bottom of the column
    this.state.body[sectionId].columns[columnId].push({
      icon: '',
      title: 'Hexagon title',
      className: '',
      file: ''
    });
    this.setState({ body: this.state.body });
  }

  removeHexagon(sectionId, columnId) {
    // Remove last hexagon
    this.state.body[sectionId].columns[columnId].pop();
    this.setState({ body: this.state.body });
  }

  onHexagonUpdate(data) {
    // Update opened hexagon
    Object.assign(this.openedHexagon, data);
    this.setState({ body: this.state.body });
  }

  editHexagon(sectionId, columnId, hexagonId) {
    this.openedHexagon = this.state.body[sectionId].columns[columnId][hexagonId];

    dispatch('popup:show', {
      title: 'Manage hexagon',
      body: <ManageHexagon
        item={this.openedHexagon}
        onSave={this.onHexagonUpdate.bind(this)}
      />
    });
  }

  render() {
    return (
      <div class="practise">
        <div class="contents">
          <div class="data">
            {
              this.state.body.map((section, sectionKey) => {
                return (
                  <div key={sectionKey}>
                    <div class="hexagon-column left text-center">
                      <div class="fa fa-plus" onClick={this.addHexagon.bind(this, sectionKey, 0)} />&nbsp;
                      <div class="fa fa-minus" onClick={this.removeHexagon.bind(this, sectionKey, 0)} />
                    </div>
                    <div class="hexagon-column left text-center">
                      <div class="fa fa-plus" onClick={this.addHexagon.bind(this, sectionKey, 1)} />&nbsp;
                      <div class="fa fa-minus" onClick={this.removeHexagon.bind(this, sectionKey, 1)} />
                    </div>
                    <div class="hexagon-column left text-center">
                      <div class="fa fa-plus" onClick={this.addHexagon.bind(this, sectionKey, 2)} />&nbsp;
                      <div class="fa fa-minus" onClick={this.removeHexagon.bind(this, sectionKey, 2)} />
                    </div>

                    <div class="hexagons-section clear">
                      {
                        section.columns.map((column, columnKey) => {
                          return (
                            <div class="hexagon-column left" key={String(sectionKey) + columnKey}>
                              {
                                column.map((item, itemKey) => {
                                  return (
                                    <div class={'hexagon '.concat(item.className)}
                                         key={String(sectionKey) + columnKey + itemKey}
                                         onClick={this.editHexagon.bind(this, sectionKey, columnKey, itemKey)}
                                    >
                                      <div class={'icon '.concat(item.icon)}></div>
                                      <div class="title">{item.title}</div>
                                    </div>
                                  );
                                })
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                );
              })
            }
          </div>
          <div class="text-center" onClick={this.addSection.bind(this)} style={{ marginLeft: '-20px', cursor: 'pointer' }}>Add section</div>
        </div>
      </div>
    );
  }
}
