export default class User {

  static get data() {
    return JSON.parse(localStorage.getItem('loggedUser'));
  }

  static set data(data) {
    localStorage.setItem('loggedUser', JSON.stringify(data));
  }

  static get isSocial() {
    return this.data['isSocial'];
  }

  static get avatar() {
    return this.data['avatar'];
  }

  static get fullName() {
    return (this.data.firstName || '')  + ' '  + (this.data.lastName || '');
  }
}
