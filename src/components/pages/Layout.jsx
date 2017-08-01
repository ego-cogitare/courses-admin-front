import React from 'react';
import LeftMenu from './partials/LeftMenu.jsx';
import { subscribe } from '../../core/helpers/EventEmitter';
import '../../staticFiles/js/app';
import '../../staticFiles/css/AdminLTE.css';
import '../../staticFiles/css/custom-scrollbars.css';
import '../../staticFiles/css/skins/skin-blue.min.css';
import Notifications from '../../core/ui/Notifications.jsx';
import Popup from '../../core/ui/Popup.jsx';
import { logout } from '../../actions/Auth';
import User from '../../core/helpers/User';
import { buildUrl } from '../../core/helpers/Utils';
import MessegerComponent from './partials/MessegerComponent.jsx';
import CommunityStream from './partials/CommunityStream.jsx';

export default class Layout extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      pageTitle: '',
      courseId: null,
      loggedUser: JSON.parse(localStorage.getItem('loggedUser'))
    };

    console.log(this.props)
  }

  componentWillMount() {
    subscribe('page:titles:change', (payload) => {
      this.setState(payload);
    });
  }

  componentWillReceiveProps(props) {
    this.setState({ courseId: props.params.id });
  }

  render () {
    return (
     <div className="hold-transition skin-blue sidebar-mini layout-boxed">
       <Notifications limit="3" />
       <Popup />
       <div className="wrapper">
         <header className="main-header">
          <a href="javascript:void(0)" className="logo">
            <span className="logo-mini"><b>A</b>LT</span>
            <span className="logo-lg"><b>Admin</b></span>
          </a>
          <nav className="navbar navbar-static-top" role="navigation">
            <a href="#" className="sidebar-toggle" data-toggle="offcanvas" role="button">
              <span className="sr-only">Toggle navigation</span>
            </a>
            <div className="navbar-custom-menu">


              <ul class="nav navbar-nav">
                <li class="dropdown notifications-menu">
                  {/*
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                    <i class="fa fa-bell-o"></i>
                  </a>
                  <ul class="dropdown-menu">
                    <li class="header">You have 10 notifications</li>
                    <li>
                      <ul class="menu">
                        <li>
                          <a href="#">
                            <i class="fa fa-users text-aqua"></i> 5 new members joined today
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i class="fa fa-warning text-yellow"></i> Very long description here that may not fit into the
                            page and may cause design problems
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i class="fa fa-users text-red"></i> 5 new members joined
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i class="fa fa-shopping-cart text-green"></i> 25 sales made
                          </a>
                        </li>
                        <li>
                          <a href="#">
                            <i class="fa fa-user text-red"></i> You changed your username
                          </a>
                        </li>
                      </ul>
                    </li>
                    <li class="footer"><a href="#">View all</a></li>
                  </ul>
                  */}
                </li>

                <li class="dropdown user user-menu">
                  <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                    <img src={ User.avatar ? buildUrl({ path: '/avatars', name: User.avatar }) : require('../../staticFiles/img/nouser.png') } class="user-image" alt="User Image" />
                    <span class="hidden-xs">{User.fullName}</span>
                  </a>
                </li>
                <li>
                  <a href="#" onClick={logout} data-toggle="control-sidebar"><i class="fa fa-power-off"></i></a>
                </li>
                {
                  this.state.loggedUser.role === 'ROLE_TUTOR' &&
                  <li>
                    <a href="#" data-toggle="control-sidebar"><i class="fa fa-comments-o"></i></a>
                  </li>
                }
              </ul>
            </div>
          </nav>
        </header>
        <LeftMenu />
        <div className="content-wrapper">
          <section className="content-header">
            <h1>
              {this.state.pageTitle}
              <small></small>
            </h1>
          </section>
          <section className="content">
            { this.props.children }
          </section>
        </div>
        <footer className="main-footer">
          <div className="pull-right hidden-xs">
            Anything you want
          </div>
          <strong>Copyright &copy; 2017 <a href="#">Company</a>.</strong> All rights reserved.
        </footer>


        <aside class="control-sidebar control-sidebar-light" style={{ height: 'calc(100% - 51px)' }}>
          <ul class="nav nav-tabs nav-justified control-sidebar-tabs">
            <li class="active">
              <a href="#tab1" data-toggle="tab" aria-expanded="true">
                Community stream
              </a>
            </li>
            <li class="">
              <a href="#tab2" data-toggle="tab" aria-expanded="false">
                Chat
              </a>
            </li>
          </ul>

          <div class="tab-content">
            <div class="tab-pane active" id="tab1">
              {
                this.state.courseId ?
                  <CommunityStream courseId={this.state.courseId} /> :
                  <div>Please select course in the courses navigation menu.</div>
              }
            </div>

            <div class="tab-pane" id="tab2">
              <MessegerComponent />
            </div>
          </div>
        </aside>
      </div>
    </div>
    );
  }
}
