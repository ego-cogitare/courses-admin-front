import { request } from '../core/helpers/Request';
import { dispatch } from '../core/helpers/EventEmitter';

export function login(username, password) {
  request('/login', { username, password }, 'post',
    (r) => dispatch('login:success', r),
    (e) => dispatch('login:fail', e)
  );
};

export function logout() {

  let confirm = window.confirm("Do You want to exit?");
  if (confirm)
  request('/logout', {}, 'post',
    (r) => dispatch('logout:success', r),
    (e) => dispatch('logout:fail', e)
  );

};
