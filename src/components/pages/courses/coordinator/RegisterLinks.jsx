import React from 'react';
import moment from 'moment';
import { Link } from 'react-router';
import { dispatch, subscribe, unsubscribe } from '../../../../core/helpers/EventEmitter';
import { getLinks, addUser, getByCourseId } from '../../../../actions/tutor/User';
import { list as coursesList } from '../../../../actions/tutor/Course';

export default class RegisterLinks extends React.Component {

  constructor(props) {
    super(props);

    
    this.state = { links: [], users: [] };
    this.courseId = this.props.params.id;
  }

  componentDidMount() {
    dispatch('page:titles:change', {
      pageTitle: 'Manage register links'
    });

    this.update({ courseId: this.props.params.id });

   
  }

  componentWillReceiveProps(props) {
    if (this.courseId !== props.params.id) {
      this.courseId = props.params.id;
      this.update( this.courseId);
    }
  }


  update(courseId) {

    getByCourseId(courseId, (r) => {
        this.setState({
            users: r
        });
        console.log(r);
    }, (e) => {

    });
    
    getLinks(courseId, 
    (r) => {
        this.setState({
            links: r,
        });
    },
    (e) => {
        console.error(e);
    }
    )
  } 



//   onFilterChanged(e) {
//     const filter = new RegExp(e.target.value, 'i');
//     this.setState({
//       students: this.students.filter(({ email, firstName, lastName }) => {
//         return email.match(filter) || firstName.match(filter) || lastName.match(filter);
//       })
//     });
//   }

 add(e) {
     e.preventDefault();

     addUser({
         emails: [this.refs.email.value],
         courseId: this.courseId
     },
     (r) => {
         this.refs.email.value = '';
        this.update({courseId: this.courseId});
     },
     
     (e) => console.error(e));
 }

 

  render() {
    return (
     
      <div class="row">

          <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Add user</h3>
            </div>

            <div class="box-body data-table-container">
              <form>
                <div className="form-group">
                    <input className="form-control" ref="email" type="text" placeholder="Email" />
                </div>
                <div className="form-group">
                    <button onClick={this.add.bind(this)} className="btn btn-default">Add</button>
                </div>
              </form>
            </div>

        </div>

        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Waiting for registration</h3>
                {/*<div class="input-group pull-right" style={{ width: '230px' }}>
                    <input type="text" class="form-control" onChange={this.onFilterChanged.bind(this)} placeholder="Type filter keyword" />
                    <span class="input-group-addon">
                    <i class="fa fa-search"></i>
                    </span>
                </div>*/}
            </div>

            <div class="box-body data-table-container">
                <table class="table">
                <tbody>
                    <tr>
                        <th style={{ width: '100px' }}>Email</th>
                    </tr>

                    {
                        this.state.links.map((l) => (
                            <tr>
                                <td>{l.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
                </table>
            </div>

        </div>

        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Registered users</h3>
            </div>

            <div class="box-body data-table-container">
                <table class="table">
                <tbody>
                    <tr>
                        <th style={{ width: '100px' }}>Email</th>
                    </tr>

                    {
                        this.state.users.map((u) => (
                            <tr>
                                <td>{u.email}</td>
                            </tr>
                        ))
                    }
                </tbody>
                </table>
            </div>

        </div>

      </div>
    );
  }
}
