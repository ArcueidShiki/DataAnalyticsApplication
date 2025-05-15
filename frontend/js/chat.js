import Sidebar from "./sidebar.js";
import Http from "./http.js";
import User from "./user.js";
import { formatTimestamp } from "./utils.js";
const socket = io("http://127.0.0.1:9000/chat", {
  reconnection: false,
  transports: ["websocket"],
  auth: {
    access_token: Http.getCookie("access_token_cookie"),
    crsf_token: Http.getCookie("csrf_access_token"),
  },
});

var chatList = [];

function initSearch(users) {
  const searchInput = $(".search-input");
  const searchResults = $(".search-dropdown");

  searchInput.on("input", () => {
    const query = searchInput.val().toLowerCase().trim();
    searchResults.empty();

    if (query) {
      const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(query)
      );
      if (filteredUsers.length > 0) {
        filteredUsers.forEach((user) => {
          const resultItem = $(`
          <div class="search-item">
            <img src="${Http.baseUrl}/${user.profile_img}" alt="${user.username}" />
            <span>${user.username}</span>
          </div>
          `);
          resultItem.on("click", () => {
            populateChatList([user]);
            searchInput.val("");
            searchResults.empty();
            searchResults.removeClass("active");
          });
          searchResults.append(resultItem);
        });
        searchResults.addClass("active");
      } else {
        searchResults.empty();
        searchResults.removeClass("active");
      }
    }
  });
  $(document).on("click", (event) => {
    if (
      !$(event.target).closest(searchInput).length &&
      !$(event.target).closest(searchResults).length
    ) {
      searchResults.removeClass("active");
    }
  });
}

function populateChatList(users) {
  const chatListContainer = $(".chat-list");
  chatListContainer.empty();
  users.forEach((user) => {
    const unreadCount = 2;
    const last_time = "12:00 PM";
    const last_message = "Hello, how are you?";
    const img_url = `${Http.baseUrl}/${user.profile_img}`;
    const chatItem = $(`
      <div class="chat-item" data-id="${user.user_id}">
        <div class="chat-avatar">
          <img src="${img_url}" alt="${user.username}" />
          <span class="unread-badge">${unreadCount}</span>
        </div>
        <div class="chat-info">
          <div class="chat-header">
            <div class="chat-name">${user.username}</div>
            <div class="chat-time">${last_time}</div>
          </div>
          <div class="chat-preview">
            <div class="chat-message">${last_message}</div>
          </div>
        </div>
        <div class="chat-options">
          <i class="fas fa-trash"></i>
        </div>
      </div>
    `);
    const partnerId = chatItem.data("id");
    chatItem.on("click", function () {
      chatListContainer.find(".chat-item").removeClass("active");
      $(this).addClass("active");
      const unreadBadge = $(this).find(".unread-badge");
      if (unreadBadge) {
        unreadBadge.remove();
        $(this).removeClass("unread");
      }
      const chatName = $(this).find(".chat-name").text();
      $(".chat-window-title h2").text(chatName);
      getChatHistory(partnerId);
    });
    chatItem.find(".fa-trash").on("click", function (e) {
      e.stopPropagation();
      chatList = users.filter((user) => user.user_id != partnerId);
      localStorage.setItem("chatList", JSON.stringify(chatList));
      chatItem.remove();
    });
    chatListContainer.append(chatItem);
  });
}

function getAllUsers() {
  let userList = JSON.parse(localStorage.getItem("userList")) || [];
  if (!userList || userList.length === 0) {
    Http.get("/chat/all/users")
      .then((response) => {
        localStorage.setItem("userList", JSON.stringify(response));
        userList = response;
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      });
  }
  initSearch(userList);
}

function getChatList() {
  chatList = JSON.parse(localStorage.getItem("chatList")) || [];
  if (chatList.length === 0) {
    Http.get("/chat/list")
      .then((response) => {
        localStorage.setItem("chatList", JSON.stringify(response));
        chatList = response;
      })
      .catch((error) => {
        console.error("Error fetching chat list:", error);
      });
  }
  populateChatList(chatList);
}

function getChatHistory(partnerId) {
  Http.get(`/chat/history/${partnerId}`)
    .then((response) => {
      const messagesContainer = $(".chat-messages");
      messagesContainer.empty();
      console.log("Chat history response:", response);
      if (response.history.length === 0) {
        messagesContainer.append(`
          <div class="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        `);
        return;
      }
      response.history.forEach((message) => {
        console.log(message);
        const messageHTML = `
            <div class="message-group ${message.receiver_id === partnerId ? "user" : "partner"}">
              <div class="message-bubble ${message.receiver_id === partnerId ? "user" : "partner"}">
                <div class="message-content">
                  ${message.type == "text" ? `<div class="message-text">${message.message}</div>` : `<img class="summary-img" src="${Http.baseUrl}/${message.message}" alt="Summary Image" />`}
                </div>
                <div class="message-time">${formatTimestamp(message.timestamp)}</div>
              </div>
            </div>
          `;
        messagesContainer.append(messageHTML);
      });
    })
    .catch((error) => {
      console.error("Error fetching chat history:", error);
    });
}

function initMessageInput() {
  const chatInput = $(".chat-input");
  const sendButton = $(".send-button");
  sendButton.on("click", sendText);
  chatInput.on("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  });
  $(".toolbar-button").on("click", function () {
    sendSummaryImg();
  });
}

function sendText() {
  const chatInput = $(".chat-input");
  const messagesContainer = $(".chat-messages");
  const messageText = chatInput.val().trim();
  const partnerId = $(".chat-item.active").data("id");
  console.log("user id", User.getInstance().id);
  socket.emit("send_text", {
    sender_id: User.getInstance().id,
    receiver_id: partnerId,
    message: messageText,
    message_type: "text",
  });
  if (messageText) {
    const now = new Date();
    const timeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const messageHTML = `
            <div class="message-group user">
                <div class="message-bubble user">
                    <div class="message-content">
                        <div class="message-text">${messageText}</div>
                    </div>
                    <div class="message-time">${timeString}</div>
                </div>
            </div>
        `;

    messagesContainer.append(messageHTML);
    chatInput.val("");
  }
}

function sendSummaryImg() {
  const messagesContainer = $(".chat-messages");
  const partnerId = $(".chat-item.active").data("id");
  socket.emit("send_summary_img", {
    sender_id: User.getInstance().id,
    receiver_id: partnerId,
    message: "summary",
    message_type: "image",
    symbol: "AAPL",
    avg_cost: 150,
    price: 155,
  });
  socket.on("summary_img_sent", (data) => {
    console.log("Summary image sent:", data);
    const messageHTML = `
            <div class="message-group user">
                <div class="message-bubble user">
                    <div class="message-content">
                        <img src="${Http.baseUrl}/${data.image_url}" alt="Summary Image" />
                    </div>
                    <div class="message-time">${data.time}</div>
                </div>
            </div>
        `;
    messagesContainer.append(messageHTML);
  });
}

function initSocket() {
  socket.on("connect", () => {
    console.log("Connected to chat server");
  });
  socket.emit("authenticate", {
    access_token: Http.getCookie("access_token_cookie"),
    crsf_token: Http.getCookie("csrf_access_token"),
  });
  socket.on("error", (data) => {
    console.error(data.message);
    socket.close();
  });
  socket.on("receive_text", (data) => {
    console.log("Message sent:", data);
    const messagesContainer = $(".chat-messages");
    const messageHTML = `
        <div class="message-group partner">
            <div class="message-bubble partner">
                <div class="message-content">
                    <div class="message-text">${messageText}</div>
                </div>
                <div class="message-time">${timeString}</div>
            </div>
        </div>
    `;
    messagesContainer.append(messageHTML);
  });
  socket.on("receive_summary_img", (data) => {
    console.log("New message received:", data);
    const messagesContainer = $(".chat-messages");
    const partnerId = $(".chat-item.active").data("id");
    const messageHTML = `
            <div class="message-group partner">
                <div class="message-bubble partner">
                    <div class="message-content">
                        <img src="${Http.baseUrl}/${data.image_url}" alt="Summary Image" />
                    </div>
                    <div class="message-time"></div>
                </div>
            </div>
        `;
    messagesContainer.append(messageHTML);
  });
}

$(document).ready(function () {
  Sidebar.getInstance();
  getAllUsers();
  getChatList();
  initSocket();
  initMessageInput();
});

$(document).on("destroy", function () {
  socket.close();
});
