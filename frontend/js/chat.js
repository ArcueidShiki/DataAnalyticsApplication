document.addEventListener('DOMContentLoaded', function() {
    console.log('Chat page loaded');
    
    
    // Chat list item click handler
    initChatListItems();
    
    // Initialize message input
    initMessageInput();
});

/**
 * Initialize chat list item click events
 */
function initChatListItems() {
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            chatItems.forEach(chat => chat.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Remove unread badge if present
            const unreadBadge = this.querySelector('.unread-badge');
            if (unreadBadge) {
                unreadBadge.remove();
                this.classList.remove('unread');
            }
            
            // Update chat window header with selected chat name
            const chatName = this.querySelector('.chat-name').textContent;
            document.querySelector('.chat-window-title h2').textContent = chatName;
            
            // In a real app, you would load messages for this chat here
            console.log(`Selected chat: ${chatName}`);
        });
    });
}

/**
 * Initialize message input functionality
 */
function initMessageInput() {
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    
    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize input based on content
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

/**
 * Send message function
 */
function sendMessage() {
    const chatInput = document.querySelector('.chat-input');
    const messagesContainer = document.querySelector('.chat-messages');
    const messageText = chatInput.value.trim();
    
    if (messageText) {
        // Create current time string
        const now = new Date();
        const timeString = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Create message HTML
        const messageHTML = `
            <div class="message-group user">
                <div class="message-bubble user">
                    <div class="message-content">
                        <div class="message-text">${messageText}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add message to chat
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        // Clear input
        chatInput.value = '';
        chatInput.style.height = 'auto';
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}