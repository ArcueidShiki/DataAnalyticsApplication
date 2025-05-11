// Define HTTP class to handle ajax requests and reponses

// the headers should include csrf token if it is not null
// the jwt in the cookies will be sended by the browser automatically, there's no need to do anything.
const Http = {
  CSRF_TOKEN: null,
  ACCESS_TOKEN: null,
  protocol: "http", // https, SSL/TLS is handler by cloud provider. self-signed certs are not supported.
  ip: "127.0.0.1",
  port: "9000",
  baseUrl: "http://127.0.0.1:9000",
  CONTENT_TYPE_JSON: "application/json",
  // Get request
  get: function (api, headers = {}) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.baseUrl}${api}`,
        method: "GET",
        headers: Http._addAuthHeaders(headers),
        xhrFields: {
          withCredentials: true, // Send cookies with the request
        },
        contentType: this.CONTENT_TYPE_JSON,
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(
            xhr.responseText ||
              `An error:${error} with code:${status} occurred while processing the request.`,
          );
        },
      });
    });
  },

  // Post request
  post: function (api, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.baseUrl}${api}`,
        method: "POST",
        headers: Http._addAuthHeaders(headers),
        xhrFields: {
          withCredentials: true, // Send cookies with the request
        },
        contentType: this.CONTENT_TYPE_JSON,
        data: JSON.stringify(data),
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(
            xhr.responseText ||
              `An error:${error} with code:${status} occurred while processing the request.`,
          );
        },
      });
    });
  },

  formSubmit: function (api, formData = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.baseUrl}${api}`,
        method: "POST",
        headers: Http._addAuthHeaders(headers),
        xhrFields: {
          withCredentials: true, // Send cookies with the request
        },
        contentType: false,
        processData: false,
        data: formData,
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(
            xhr.responseText ||
              `An error:${error} with code:${status} occurred while processing the request.`,
          );
        },
      });
    });
  },
  // Put request
  put: function (api, data = {}, headers = {}) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.baseUrl}${api}`,
        method: "PUT",
        headers: Http._addAuthHeaders(headers),
        xhrFields: {
          withCredentials: true, // Send cookies with the request
        },
        contentType: this.CONTENT_TYPE_JSON,
        data: JSON.stringify(data),
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(
            xhr.responseText ||
              `An error:${error} with code:${status} occurred while processing the request.`,
          );
        },
      });
    });
  },

  // Delete request
  delete: function (api, headers = {}) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: `${this.baseUrl}${api}`,
        method: "DELETE",
        headers: Http._addAuthHeaders(headers),
        xhrFields: {
          withCredentials: true, // Send cookies with the request
        },
        contentType: this.CONTENT_TYPE_JSON,
        success: function (response) {
          resolve(response);
        },
        error: function (xhr, status, error) {
          reject(
            xhr.responseText ||
              `An error:${error} with code:${status} occurred while processing the request.`,
          );
        },
      });
    });
  },

  _addAuthHeaders: function (headers) {
    const jwt = this.getCookie("access_token_cookie");
    headers["Authorization"] = `Bearer ${jwt}`;
    headers["X-CSRF-Token"] = this.getCookie("csrf_access_token");
    return headers;
  },

  getCSRFTokenFromCookie: function () {
    if (this.CSRF_TOKEN) {
      return this.CSRF_TOKEN; // Return the cached token if it exists
    }
    const match = document.cookie.match(/csrf_access_token=([^;]+)/);
    if (match) {
      console.log("CSRF token found in cookies:", match[1]);
      this.CSRF_TOKEN = match[1]; // Save for future requests
    } else {
      console.error("CSRF token not found in cookies.");
    }
  },

  getAccessTokenFromCookie: function () {
    const match = document.cookie.match(/access_token_cookie=([^;]+)/);
    if (match) {
      console.log("Access token found in cookies:", match[1]);
      return match[1]; // Save for future requests
    } else {
      console.error("Access token not found in cookies.");
      return null;
    }
  },

  getCookie: function (name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  },

  setCookie: function (name, value, days = 7) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  },

  deleteCookie: function (name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

function getCurrentSymbol() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("symbol") || "AAPL";
}

export default Http;
