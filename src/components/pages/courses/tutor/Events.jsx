import React from 'react';
import moment from 'moment';
import { Link } from 'react-router';
import { DragDropContext } from 'react-dnd';
import BigCalendar from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import HTML5Backend from 'react-dnd-html5-backend';
import '../../../../staticFiles/css/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import { list, add, update, remove } from '../../../../actions/tutor/Events';
import { list as coursesList } from '../../../../actions/tutor/Course';
import ConfirmDialog from './popup/ConfirmDialog.jsx';
import { getChatUsers } from '../../../../actions/User';

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

class Events extends React.Component {

  constructor(props) {
    super(props);

    BigCalendar.setLocalizer(
      BigCalendar.momentLocalizer(moment)
    );

    this.state = {
      courseId: null,
      coursesList: [],
      userMap: {},
      browseDate: new Date(),
      selectedEvent: null,
      events: []
    };

  
    this.activeView = 'week';
    this.onPopupClosed = this.onPopupClosedListener.bind(this);
  }

  componentWillMount() {

    getChatUsers((r) => {
      
      let userMap = {};
      r.forEach((u) => {
        userMap[u.id] = u;
      });

      this.setState({
        userMap: userMap
      });

    });

    coursesList(
      (coursesList) => this.setState({ coursesList }),
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      }
    );
    subscribe('popup:closed', this.onPopupClosed);
  }

  componentWillUnmount() {
    unsubscribe('popup:closed', this.onPopupClosed);
  }

  moveEvent({ event, start, end }) {
    // const { events } = this.state;
    // const idx = events.indexOf(event);
    // const updatedEvent = { ...event, start, end };
    // const nextEvents = [...events];
    //
    // nextEvents.splice(idx, 1, updatedEvent);
    // this.setState({ events: nextEvents });

    this.eventSave({
      eventId: event.id,
      courseId: this.state.courseId,
      forDate: start
    });
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: 'Manage events'
    });
  }

  /**
   * On range selection.
   */
  onSelectSlot(slotInfo) {
    this.setState({ selectedEvent: null });

    // Deny range selection anywhere but week view
    if (this.activeView !== 'week' || !this.selectionStarted) {
      return false;
    }

    // Reset selection start flag
    this.selectionStarted = false;

    // Add temporaly event
    this.state.events.push({
      start: slotInfo.start,
      end: new Date(new Date(slotInfo.start).getTime() + 2700000),
      title: '',
      temporaly: true,
      description: ''
    });
    this.setState({ events: this.state.events });

    // Show event edit popup
    dispatch('popup:show', {
      title: 'Add event?',
      type: 'default',
      body: <ConfirmDialog
              onSaveHandler={this.eventSave.bind(this)}
              forDate={slotInfo.start}
              style={{ width: '400px', top: '300px' }}
            />
    });
  }

  // On event "Save" button click handler
  eventSave({ eventId, forDate }, onSuccess, onFail) {
    /**
     * Add new event
     */
    (eventId ? update : add)(
      {
        eventId,
        courseId: this.state.courseId,
        forDate: moment(forDate).format('x')
      },
      (r) => {
        /**
         * Fetch events list on successfully event add
         */
        this.fetchEvents(
          new Date(this.state.browseDate).getMonth() + 1,
          new Date(this.state.browseDate).getFullYear(),
          () => {
            dispatch('notification:throw', {
              type: 'info',
              title: 'Success',
              message: `Event ${eventId ? 'updated' : 'added'}`
            });
            dispatch('popup:close');
          }
        );
      },
      (e) => {
        dispatch('notification:throw', {
          type: 'danger',
          title: 'Error',
          message: e.responseJSON.message
        });
      },
    );
  }

  // Event closed without saving (remove last added event)
  onPopupClosedListener(payload) {
    // Remove temporaly added event
    this.setState({
      events: this.state.events.slice(0, -1)
    });
  }

  onEventSelect(event) {
    this.setState({ selectedEvent: event });
  }

  // On calendar date change event
  onDateChange(toDate) {
    this.setState({
      browseDate: toDate,
      selectedEvent: null
    });
  }

  onViewChanged(view) {
    this.activeView = view;
    this.setState({ selectedEvent: null });
  }

  onStartRangeSelection() {
    this.selectionStarted = true;
  }

  onEventPropGetter(event, start, end, isSelected) {
    let style = event.temporaly ? {
      backgroundColor: 'rgba(192, 192, 192, 0.4)',
      borderColor: '#aaaaaa',
    } : {};
    return { style };
  }

  onCourseChanged(e) {
    const courseId = e.target.value;
    this.setState({ courseId }, () => this.fetchEvents());
  }

  // Fetch events for the month
  fetchEvents(month = new Date().getMonth() + 1, year = new Date().getFullYear(), callback = ()=>{}) {
    list({ courseId: this.state.courseId, month, year },
      (events) => {
        console.log(events);
        callback();
        this.setState({
          selectedEvent: null,
          events: events.map(
            ({ id, userId, forDate }, key) => {

              let user = this.state.userMap[userId];
              
              return {
                id,
                title: user && `${user.firstName} ${user.lastName}`,
                description: '',
                start: new Date(Number(forDate)),
                end: new Date(Number(forDate) + 2700000)
              };

            }
          )
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

  removeSelectedEvent() {
    remove({ eventId: this.state.selectedEvent.id },
      (r) => {
        this.fetchEvents(
          new Date(this.state.browseDate).getMonth() + 1,
          new Date(this.state.browseDate).getFullYear(),
          () => {
            this.setState({ selectedEvent: null });
            dispatch('notification:throw', {
              type: 'warning',
              title: 'Warning',
              message: `Event was deleted`
            });
          }
        );
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
    let today = moment();
    let am8 = today.set('hour', 8).set('minutes', 0).toDate();
    let pm22 = today.set('hour', 22).set('minutes', 0).toDate();

    return (
      <div class="tutor row">
        <div class="col-md-12">
          <div class="box box-primary">
            <div class="box-body">
              <div class="form-group">
                <label>Course</label>
                <select class="form-control select2 select2-hidden-accessible" onChange={this.onCourseChanged.bind(this)}>
                  <option value="">(Select course)</option>
                  {
                    this.state.coursesList.map(({ id, name }) => (
                      <option key={id} value={id}>{name}</option>
                    ))
                  }
                </select>
              </div>

              <div class="form-group" style={{ position: 'relative' }}>

                { this.state.selectedEvent && <div class="btn btn-danger fa fa-remove remove-event" onClick={this.removeSelectedEvent.bind(this)} /> }
                <label>Events list</label>
                {
                this.state.courseId ?
                  <div>
                    <DragAndDropCalendar
                      views={['week']}
                      culture='en-GB'
                      min={am8}
                      max={pm22}
                      step={15}
                      timeslots={1}
                      toolbar={true}
                      popup={true}
                      selectable={true}
                      defaultView={this.activeView}
                      events={this.state.events}
                      onSelecting={this.onStartRangeSelection.bind(this)}
                      onView={this.onViewChanged.bind(this)}
                      onSelectSlot={this.onSelectSlot.bind(this)}
                      onSelectEvent={this.onEventSelect.bind(this)}
                      onNavigate={this.onDateChange.bind(this)}
                      onEventDrop={this.moveEvent.bind(this)}
                      eventPropGetter={this.onEventPropGetter.bind(this)}
                    />
                  </div> :
                  <div class="text-center text-bold">Select course in the list below.</div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(Events);
