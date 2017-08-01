import { request } from '../../core/helpers/Request';

export function list({ courseId, month, year }, success, fail) {
  request(`/event/course/${courseId}/month/${month}/year/${year}`, null, 'get', success, fail);
};

export function add(data, success, fail) {
  request('/event', data, 'post', success, fail);
};

export function update({ eventId, courseId, forDate }, success, fail) {
  request(`/event/${eventId}`, { courseId, forDate }, 'put', success, fail);
};

export function remove({ eventId }, success, fail) {
  request(`/event/${eventId}`, null, 'delete', success, fail);
};
