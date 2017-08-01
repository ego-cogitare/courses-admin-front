import { request } from '../../core/helpers/Request';
import { dispatch } from '../../core/helpers/EventEmitter';

export function listByCourse({ courseId }, success, fail) {
  return request(`/lection/byCourse/${courseId}`, null, 'get', success, fail);
};

export function listDashboard({ courseId }, success, fail) {
  return request(`/lection/byCourse/${courseId}/dashboard`, null, 'get', success, fail);
};

export function listProgressByCourse({ courseId }, success, fail) {
  return request(`/lectionProgress/byCourse/${courseId}`, null, 'get', success, fail);
};

export function get({ id }) {
  return request(`/lection/${id}`, null, 'get',
    (r) => dispatch('lection:get', r),
    (e) => dispatch('lection:get', e)
  );
};

export function allSelfCheck({ courseId }, success, fail) {
  return request(`/step/allSelfCheck/byCourse/${courseId}`, null, 'get', success, fail);
};
