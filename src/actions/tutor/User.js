import { request } from '../../core/helpers/Request';

export function getByCourseId({ courseId }, success, fail) {
  request(`/user/ByCourse/${courseId}/students`, null, 'get', success, fail);
};

export function getProgress({ userId, courseId }, success, fail) {
  request(`/lectionProgress/byUser/${userId}/byCourse/${courseId}`, null, 'get', success, fail);
};

export function getMicroblog({ userId, courseId }, success, fail) {
  request(`/keylearning/byCourse/${courseId}/byUser/${userId}`, null, 'get', success, fail);
};

export function getLinks({ courseId }, success, fail) {
  request(`/registrationLink?courseId=${courseId}`, null, 'get', success, fail);
};

export function addUser(data, success, fail) {
  request(`/registrationLink`, data, 'post', success, fail);
};

export function getStoredData({ userId, key }, success, fail) {
  request(`/data/byUser/${userId}/byKey/${key}`, null, 'get', success, fail);
};

export function getStatistics({ userId, courseId }, success, fail) {
  request(`/statistics/byUserId/${userId}/byCourseId/${courseId}`, null, 'get', success, fail);
};
