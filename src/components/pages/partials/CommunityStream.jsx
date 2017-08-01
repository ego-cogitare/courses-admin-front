import React from 'react';
import { Link } from 'react-router';
import { listByCourse } from '../../../actions/tutor/Lection';
import TimeAgo from 'react-timeago';
import CustomScroll from 'react-custom-scroll';
import Avatar from '../../../core/helpers/Avatar';
import User from '../../../core/helpers/User';
import { like, dislike } from '../../../actions/tutor/Message';
import Messanger from '../../../core/helpers/Messanger';
import '../../../staticFiles/css/community-stream.css';

import { submessages } from '../../../actions/tutor/Message';

export default class CommunityStream extends React.Component {

  constructor(props) {
    super(props);

    // First time messanger initialize
    this.initializeMessanger();
  }

  initializeMessanger() {
    this.state = { messages: [], lections: {} };

    // Close old connection (if exists)
    this.messanger && this.messanger.close();

    listByCourse({ courseId: this.props.courseId },
      (lections) => { this.setState({ lections }); console.log(lections); },
      (e) => console.error('Get lections', e)
    );

    this.messanger = new Messanger((newMessages) => {
      newMessages.forEach((m) => {
        m.showSubcomments = false;
      });
      this.setState({
        messages: newMessages.concat(this.state.messages)
      });
    });

    this.messanger.connect(() => {
      this.messanger.subscribe(`course_${this.props.courseId}`);
      this.messanger.latest(`course_${this.props.courseId}`);
    });
  }

  // Reinitialize messanger on course changed
  componentWillReceiveProps(props) {
    this.initializeMessanger();
  }

  componentWillUnmount() {
    this.messanger.close();
  }

  onLike(message, e) {
    e.preventDefault();

    like({ messageId: message.id },
      (r) => {
        message.likeCount++;
        this.setState({ messages: this.state.messages });
      },
      (e) => {
        // If 400-th http-error received: delete like
        if (e.status === 400) {
          dislike({ messageId: message.id },
            (r) => {
              message.likeCount--;
              this.setState({ messages: this.state.messages });
            },
            (e) => console.error(e)
          );
        }
      }
    );
  }

  onSubmessagesShow(message, e) {
    e.preventDefault();

    message.comments = [];
    message.showSubcomments = !message.showSubcomments ? true : !message.showSubcomments;
    this.setState({
      messages: this.state.messages
    });

    submessages({ messageId: message.id}, (messages) => {
      message.comments = messages;
      this.setState({
        messages: this.state.messages
      });
    });
  }

  addMessage() {
    this.messanger.sendMessage({
      text     : this.refs.message.value,
      title    : `${User.fullName} posted:`,
      toUserId: 'MAIN_STREAM',
      avatar   : User.avatar
    });
    this.refs.message.value = '';
  }

  handleKeyDown(e) {
    (e.which === 13) && this.addMessage();
  }

  getLectionById(lectionId) {
    const lection = this.state.lections.filter((lection) => lection.id === lectionId);
    if (lection.length === 0) {
      return null;
    }
    return lection[0].title;
  }

  renderMessage(message) {
    console.log(message)
    return (
      <div class="clearfix">
        <div class="avatar pull-left">
          {
            <img
              src={ message.avatar ? Avatar.toLink(message.avatar) : require("../../../staticFiles/img/avatars/default.png") }
              width="45"
              alt="Author avatar"
            />
          }
        </div>

        <div class="message pull-left">
          <div class="title text-bold">
            { message.title }
          </div>
          <div className="descr">
            {message.text}
            <br />
            { this.getLectionById(message.lectionId) }
          </div>

          <div class="woting clearfix">
            <div class="time fa fa-clock-o">
              <TimeAgo date={message.dateCreated} minPeriod={30} component="span" />
            </div>
             <div style={{cursor: 'pointer'}} class="comments fa fa-commenting right" onClick={this.onSubmessagesShow.bind(this, message)}>
                <span>{message.numOfSubcomment} </span>
            </div>
            <div style={{cursor: 'pointer' }} class="hearts fa fa-heart right" onClick={this.onLike.bind(this, message)}>
              <span>{message.likeCount}</span>
            </div>
          </div>

        </div>
        { message.showSubcomments &&  
        
          message.comments.map((comment) => (

            <div class="clearfix" style={ {marginLeft: 50,width: 260} }>
              <div class="avatar pull-left">
                {
                  <img
                    src={ message.avatar ? Avatar.toLink(message.avatar) : require("../../../staticFiles/img/avatars/default.png") }
                    width="45"
                    alt="Author avatar"
                  />
                }
              </div>
            
              <div class="message pull-left" style={ { width: 200} }>
                <div class="title text-bold">
                  { comment.title }
                </div>
                <div className="descr">
                  {comment.text}
                  <br />
                  { this.getLectionById(comment.lectionId) }
                </div>

                <div class="woting clearfix">
                  <div class="time fa fa-clock-o">
                    <TimeAgo date={comment.dateCreated} minPeriod={30} component="span" />
                  </div>
                
                  <div style={{cursor: 'pointer', marginLeft: 20 }} class="hearts fa fa-heart right" onClick={this.onLike.bind(this, comment)}>
                    <span>{comment.likeCount}</span>
                  </div>
                </div>

              </div>
            </div>
          ))

        }
      </div>
    );
  }

  render() {
    return (
      <div class="column pull-left">
        <ul class="community-stream">
          {
            this.state.messages.map((message, key) => (
              <li key={message.id + key}>
                { this.renderMessage(message) }
                { /* If show subcomments flag is set */
                  message.showSubcomments &&
                  <div class="subcomments clearfix">
                  { /* If sumessages exists */
                    message.submessages &&
                    <ul class="messages">
                    {
                      message.submessages.map((submessage) => (
                        <li key={submessage.id}>
                          { this.renderMessage(submessage) }
                        </li>
                      ))
                    }
                    </ul>
                  }
                  </div>
                }
              </li>
            ))
          }
        </ul>
      </div>
    );
  }
}
