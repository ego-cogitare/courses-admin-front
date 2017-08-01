import { request } from '../../core/helpers/Request';

export function list(success, fail) {
  request('/course/self', null, 'get', success, fail);
};
