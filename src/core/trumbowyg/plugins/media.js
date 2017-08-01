import React from 'react';
import { dispatch } from '../../helpers/EventEmitter';
import FileManager from '../../../components/pages/courses/popup/StepEditContent.jsx';

export default new class extends React.Component {

  constructor(props) {
    super(props);

    $.extend(true, $.trumbowyg, {
      plugins: {
        media: {
          init: this.initPlugin.bind(this)
        }
      }
    });
  }

  initPlugin(trumbowyg) {
    this.trumbowyg = trumbowyg;
    this.trumbowyg.o.plugins.media = $.extend(true, {}, this.trumbowyg.o.plugins.media || {});
    this.trumbowyg.addBtnDef('media', {
      fn: this.openFileManager.bind(this),
      ico: 'viewHTML'
    });
  }

  buildUrl(file) {
    return config.backUrl + '/file/content?path=' + file.path + '&name=' + file.name;
  }

  handleAddComponents(files) {
    // Return cursor position and selected text in editor
    this.trumbowyg.restoreRange();

    files.forEach((file) => {
      switch (file.type.toLowerCase()) {
        case 'jpg': case 'png': case 'gif': case 'jpeg':
          this.trumbowyg.execCmd('insertHTML', `<br /><img width="100%" src="${this.buildUrl(file)}" alt="" />&nbsp;`);
        break;

        case 'mp4': case 'mov':
          this.trumbowyg.execCmd('insertHTML', `<br /><video width="100%" controls>
                <source src="${this.buildUrl(file)}" type="video/mp4" />
              </video>&nbsp;`);
        break;

        case 'pdf':
          this.trumbowyg.execCmd('insertHTML', `<br /><iframe
                src="${config.frontUrl}/vendors/viewerJS/#${this.buildUrl(file)}"
                frameborder="0"
                width="100%"
                height="500"
                allowfullscreen
                webkitallowfullscreen
              ></iframe>&nbsp;`);
        break;
      }
    });
    dispatch('popup:close');
  }

  openFileManager() {
    // Save cursor position and selected text in editor
    this.trumbowyg.saveRange();

    dispatch('popup:show', {
      title: 'Select media component',
      body: <FileManager
              onAddComponents={this.handleAddComponents.bind(this)}
              style={{ width: '70%', maxWidth: '1250px' }}
            />
    });
  }
}
