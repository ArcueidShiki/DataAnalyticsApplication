import Http from "./http.js";

export default class User {
  static instance = null;
  balance = null;
  date_of_birth = null;
  email = null;
  first_name = null;
  last_name = null;
  phone = null;
  portfolio = null;
  profile_img = null;
  username = null;
  constructor() {
    if (User.instance) {
      console.log(
        "User instance already exists. Returning the existing instance.",
      );
      return User.instance;
    }
    User.instance = this;
    this.init();
  }

  static getInstance() {
    if (!User.instance) {
      User.instance = new User();
    }
    return User.instance;
  }

  updateBalance(balance) {
    let user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      user.balance[balance.symbol] = balance;
      localStorage.setItem("userInfo", JSON.stringify(user));
    }
  }

  updatePortfolio(portfolio) {
    let user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      user.portfolio[portfolio.symbol] = portfolio;
      localStorage.setItem("userInfo", JSON.stringify(user));
    }
  }

  set(user) {
    this.balance = user.balance;
    this.date_of_birth = user.date_of_birth;
    this.email = user.email;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.phone = user.phone;
    this.portfolio = user.portfolio;
    this.profile_img = user.profile_img;
    this.username = user.username;
  }

  init() {
    let user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      this.set(user);
      return;
    }
  }

  update() {
    let user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) {
      this.set(user);
      return;
    }
  }
}
