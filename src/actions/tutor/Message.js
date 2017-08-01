import { request } from '../../core/helpers/Request';

export function add(data, success, fail) {
  return request('/message', data, 'post', success, fail);
};

export function init(success, fail) {
  return request(`/messages/latest`, null, 'get', success, fail);
};

export function latest(latestId, success, fail) {
    return request(`/messages/latest?latestId=${latestId}`, null, 'get', success, fail);
};

export function like(data, success, fail) {
  return request(`/like`, data, 'post', success, fail);
};

export function dislike({ messageId }, success, fail) {
  return request(`/like?messageId=${messageId}`, null, 'delete', success, fail);
};

export function remove({ messageId }, success, fail) {
  return request(`/message/${messageId}`, null, 'delete', success, fail);
};

export function submessages({ messageId }, success, fail) {
  return request(`/message/byParent/${messageId}`, null, 'get', success, fail);
};
