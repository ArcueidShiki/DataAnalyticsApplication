import Sidebar from "./sidebar.js";
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
