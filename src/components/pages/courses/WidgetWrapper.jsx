import React from 'react';
import Widgets from './widgets';

export default class WidgetWrapper extends React.Component {

  mapStepToWidget(step) {
    const widgetsMap = {
      INFOGRAPHIC    : <Widgets.Infographic step={step} ref="widget" />,
      VIDEO          : <Widgets.Video step={step} ref="widget" />,
      PRACTICAL_PART : <Widgets.Practise step={step} ref="widget" />,
      TOOLBOX        : <Widgets.Toolbox step={step} ref="widget" />,
      SELFCHECK      : <Widgets.Selfcheck step={step} ref="widget" />,
    };

    return widgetsMap[step.type] || null;
  }

  serialize() {
    return this.refs.widget.serialize();
  }

  render() {
    return this.mapStepToWidget(this.props.step);
  }
}
