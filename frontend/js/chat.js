import Sidebar from "./sidebar.js";
import Http from "./http.js";
document.addEventListener("DOMContentLoaded", function () {
  initChatListItems();
  initMessageInput();
  Sidebar.getInstance();
});

function initChatListItems() {
  const chatItems = document.querySelectorAll(".chat-item");

  chatItems.forEach((item) => {
    item.addEventListener("click", function () {
      chatItems.forEach((chat) => chat.classList.remove("active"));
      this.classList.add("active");
      const unreadBadge = this.querySelector(".unread-badge");
      if (unreadBadge) {
        unreadBadge.remove();
        this.classList.remove("unread");
      }
      const chatName = this.querySelector(".chat-name").textContent;
      document.querySelector(".chat-window-title h2").textContent = chatName;
      console.log(`Selected chat: ${chatName}`);
    });
  });
}

function initMessageInput() {
  const chatInput = document.querySelector(".chat-input");
  const sendButton = document.querySelector(".send-button");
  sendButton.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  chatInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
  });
}

function sendMessage() {
  const chatInput = document.querySelector(".chat-input");
  const messagesContainer = document.querySelector(".chat-messages");
  const messageText = chatInput.value.trim();

  if (messageText) {
    // Create current time string
    // const now = new Date();
    // const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    const messageHTML = `
            <div class="message-group user">
                <div class="message-bubble user">
                    <div class="message-content">
                        <div class="message-text">${messageText}</div>
                    </div>
                </div>
            </div>
        `;

    messagesContainer.insertAdjacentHTML("beforeend", messageHTML);
    chatInput.value = "";
    chatInput.style.height = "auto";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

const socket = io("http://127.0.0.1:5000");

// Authenticate the user
socket.emit("authenticate", {
  access_token: Http.getCookie("access_token_cookie"),
});

// Listen for authentication success
socket.on("authenticated", (data) => {
  console.log(data.message);
});

// Listen for errors
socket.on("error", (data) => {
  console.error(data.message);
});

function sendMsg(toUserId, message, messageType = "text") {
  socket.emit("send_message", {
    from_user_id: "current_user_id", // Replace with actual user ID
    to_user_id: toUserId,
    message: message,
    message_type: messageType,
  });
}

sendMsg("recipient_user_id", "Hello, how are you?");

socket.on("message_sent", (data) => {
  console.log("Message sent:", data);
});

socket.on("receive_message", (data) => {
  console.log("New message received:", data);
});
