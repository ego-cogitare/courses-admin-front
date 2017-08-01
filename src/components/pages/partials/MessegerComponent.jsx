import React from "react";
import Messeger from "../../../core/helpers/Messeger";
import Moment from "moment";
import Avatar from "../../../core/helpers/Avatar";

import { getUser, getDialogUsers, getChatUsers } from "../../../actions/User";
import User from "../../../core/helpers/User";

export default class MessegerComponent extends React.Component {

    constructor(props) {
      super(props);

      this.currentUser = JSON.parse(localStorage.getItem('loggedUser'));

      this.state = {
        users: [],
        usersMap: {},
        view: 'users',
        selectedUser: {},
        messages: []
      };
    }

    componentDidMount() {

      getChatUsers((r) => {          
        this.courseUsers = r;
      });

      this.messeger = new Messeger((messages) => {
        
          let userId = this.currentUser.id === messages[0].userId ? messages[0].toUserId : messages[0].userId;
          this.addUser(userId);

          if (this.state.selectedUser.id &&
              this.state.selectedUser.id === messages[0].userId ||
              this.state.selectedUser.id === messages[0].toUserId ) {
                this.setState((prev) => {
                    return {
                        messages: prev.messages.concat(messages)
                    }
                }, () => {
                    let n = $('.direct-chat-messages')[0].scrollHeight;
                    $('.direct-chat-messages').scrollTop(n);
                });
          }

      });
      this.messeger.connect(() => {
      });

        getChatUsers((r) => {

            this.setState((prev) => {

                r.forEach((user) => {

                    if ( this.state.usersMap[user.id] ) return;

                    prev.usersMap[user.id] = user;
                    prev.users.push(user);

                    let state = {
                        usersMap: prev.usersMap,
                        users: prev.users
                    };

                    return state;
                });

            });


        }, (e) => console.error(e))
    }

    addUser(id) {

        if ( this.state.usersMap[id] ) return;

        getUser(id, (r) => {


            this.setState((prev) => {

                prev.usersMap[id] = r;
                prev.users.push(r);

                let state = {
                    usersMap: prev.usersMap,
                    users: prev.users
                };

                return state;
            });
        },  (e) => console.error(e));

    }

    getUserNameById(userId) {
      const user = this.state.users.filter((user) => user.id === userId)[0];

      return user ? (user.firstName + ' ' + user.lastName) : null;
    }

    componentWillUnmount() {
      this.messeger.close();
    }

    selectUser(user) {

      if (!this.state.usersMap[user.id]) {
        this.setState((prev) => {

          prev.usersMap[user.id] = user;
      
          let state = {
              usersMap: prev.usersMap,
          };

          return state;
      });

      }

      this.messeger.makeRead(user.id);
      this.setState({
        selectedUser: user,
        view: 'write',
        messages: []
      },
      () => this.messeger.getMessages(user.id , 0, 200)
      );
    }

    post(e) {
      e.preventDefault();
      this.messeger.sendMessage({
        text     : this.refs.message.value,
        title    : `Tutor:`,
        toUserId : this.state.selectedUser.id,
        avatar   : ''
      });
      this.refs.message.value = '';
    }

    backToUsers(e) {
      e.preventDefault();

      getChatUsers((r) => {

          this.setState({
            users: r
          });

      }, (e) => console.error(e));

      this.setState({ view: 'users' });
    }

    isOwnMessage(message) {
      return message.userId === User.data.id;
    }

    searchUser(e) {

      if(!e.target.value) {
        
        getChatUsers((r) => {
            this.setState({
              users: r
            });

        }, (e) => console.error(e));
        return;
      }


        let tmpUsers = this.courseUsers.filter((user) => {
        let regexp = new RegExp(e.target.value,'ig');
        return regexp.exec(user.firstName + " " + user.lastName)
      });
      this.setState({
        users: tmpUsers
      });
    }

    render() {
        switch (this.state.view) {
          case 'users':
            return (
              <div>
                <form>
                  <div className="form-group">
                    <input class="form-control" type="text" style={ {width: 310} } onChange={ this.searchUser.bind(this) } />
                  </div>
                </form>
                <ul class="users-list clearfix">
                  {
                    this.state.users.map((user, key) => (
                      <li onClick={ this.selectUser.bind(this, user) } key={key}>
                        <img src={ user.avatar ? Avatar.toLink(user.avatar) : require('../../../staticFiles/img/nouser.png') }
                            alt={ user.firstName + ' ' + user.lastName }
                            style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                        />
                        <a class="users-list-name" href="#">{ user.firstName + " " + user.lastName}</a>
                      </li>
                    ))
                  }
                </ul>
              </div>
            );
          break;

          case 'write':
            return (
              <div class="direct-chat-info" style={{ width: '97%' }}>
                <div class="clearfix" style={{ marginBottom: '11px' }}>
                  <div class="pull-left fa fa-arrow-left" style={{ marginTop: '3px' }}></div>
                  <div class="pull-left"><a href="#" onClick={this.backToUsers.bind(this)}>Back to users list</a></div>
                </div>
                <div class="direct-chat-messages" style={{ height: 'calc(500px)', overflow: 'auto'}}>
                {
                  this.state.messages.map((message) => (
                    <div key={message.id} class={"direct-chat-msg".concat(this.isOwnMessage(message) ? " right" : "")}>
                      <div class="direct-chat-info clearfix">
                        <span class="direct-chat-name pull-left">{this.isOwnMessage(message) ? 'You' : this.getUserNameById(message.userId)}</span>

                        <span class="direct-chat-timestamp pull-right">{ Moment.unix(message.dateCreated / 1000).format('dd MMM h:mm a') }</span>
                      </div>
                      <img class="direct-chat-img"
                           src={message.avatar ? Avatar.toLink(message.avatar) : require("../../../staticFiles/img/avatars/default.png")}
                           alt="message user image"
                      />
                      <div class="direct-chat-text">
                        { message.text }
                      </div>
                    </div>
                  ))
                }
                </div>
              <form action="#" method="post" onSubmit={ this.post.bind(this) } style={{paddingTop: 15}} >
                  <div class="input-group">
                      <input type="text" name="message" placeholder="Type Message ..." class="form-control" ref="message" />
                      <span class="input-group-btn">
                  <button type="submit" class="btn btn-warning btn-flat">Send</button>
                </span>
                  </div>
              </form>
              </div>
            );
          break;

          default:
            return null;
          break;
        }
    }

}
