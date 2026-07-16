// ==================== Configuration ====================
// Supabase Configuration
const SUPABASE_URL = 'https://jgyvmrhjmjsswyqdglbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneXZtcmhqbWpzc3d5cWRnbGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDcxOTUsImV4cCI6MjA5OTY4MzE5NX0.YjL5qGVYYXqT-s8pIvLSqE3n_YFqbxT7XYn5qGVYYXo';

console.log('🔌 Connecting to Supabase Realtime');

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== State Management ====================
let currentUsername = '';
let currentUserId = null;
let isTyping = false;
let typingTimeout = null;
const typingUsers = new Set();
let messageSubscription = null;
let presenceChannel = null;

// ==================== DOM Elements ====================
const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.querySelector('.btn-send');
const messagesContainer = document.getElementById('messages');
const onlineUsersList = document.getElementById('online-users-list');
const onlineCount = document.getElementById('online-count');
const typingIndicator = document.getElementById('typing-indicator');
const typingText = document.getElementById('typing-text');
const sidebar = document.querySelector('.sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');

// ==================== Utility Functions ====================

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Get first letter of username for avatar
 */
function getInitial(username) {
    return username.charAt(0).toUpperCase();
}

/**
 * Generate color from username
 */
function getColorFromUsername(username) {
    const colors = [
        '#4f46e5', '#7c3aed', '#db2777', '#dc2626', 
        '#ea580c', '#ca8a04', '#16a34a', '#0891b2'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

/**
 * Scroll messages to bottom
 */
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Auto-scroll if user is near bottom
 */
function autoScroll() {
    const threshold = 100;
    const scrollPosition = messagesContainer.scrollTop + messagesContainer.clientHeight;
    const isNearBottom = messagesContainer.scrollHeight - scrollPosition < threshold;
    
    if (isNearBottom) {
        scrollToBottom();
    }
}

// ==================== Message Rendering ====================

/**
 * Add a chat message to the UI
 */
function addMessage(username, text, timestamp, isOwn = false, status = 'delivered') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
    
    const messageHeader = document.createElement('div');
    messageHeader.className = 'message-header';
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'message-username';
    usernameSpan.textContent = username;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(timestamp);
    
    messageHeader.appendChild(usernameSpan);
    messageHeader.appendChild(timeSpan);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    // Add timestamp and status checkmarks for own messages
    if (isOwn) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'message-timestamp';
        timestampSpan.textContent = formatTime(timestamp);
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'message-status';
        
        const statusIcon = document.createElement('span');
        statusIcon.className = `message-status-icon status-${status}`;
        
        // Set checkmark based on status
        if (status === 'sending') {
            statusIcon.textContent = '🕐'; // Clock icon
        } else if (status === 'sent') {
            statusIcon.textContent = '✓'; // Single checkmark
        } else if (status === 'delivered') {
            statusIcon.textContent = '✓✓'; // Double checkmark (gray)
        } else if (status === 'read') {
            statusIcon.textContent = '✓✓'; // Double checkmark (blue)
        }
        
        statusSpan.appendChild(statusIcon);
        metaDiv.appendChild(timestampSpan);
        metaDiv.appendChild(statusSpan);
        contentDiv.appendChild(metaDiv);
    }
    
    messageDiv.appendChild(messageHeader);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    autoScroll();
}

/**
 * Add a system message (join/leave notifications)
 */
function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    autoScroll();
}

/**
 * Load chat history
 */
async function loadChatHistory() {
    try {
        const { data: messages, error } = await supabaseClient
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100);
        
        if (error) throw error;
        
        messages.forEach(msg => {
            const isOwn = msg.username === currentUsername;
            addMessage(msg.username, msg.text, msg.created_at, isOwn, 'delivered');
        });
        scrollToBottom();
        console.log('✓ Loaded', messages.length, 'messages');
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// ==================== Online Users Management ====================

/**
 * Update online users list
 */
function updateOnlineUsers(presenceState) {
    const users = Object.values(presenceState).map(presence => presence[0].username);
    
    onlineUsersList.innerHTML = '';
    onlineCount.textContent = `${users.length} online`;
    
    users.forEach(username => {
        const li = document.createElement('li');
        li.className = 'user-item';
        if (username === currentUsername) {
            li.classList.add('current-user');
        }
        
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = getInitial(username);
        avatar.style.background = getColorFromUsername(username);
        avatar.title = 'Online';
        
        const nameContainer = document.createElement('span');
        nameContainer.className = 'user-name';
        
        const name = document.createElement('span');
        name.textContent = username;
        if (username === currentUsername) {
            name.textContent += ' (you)';
        }
        
        const status = document.createElement('span');
        status.className = 'user-status';
        status.textContent = 'online';
        status.style.color = 'var(--primary-color)';
        
        nameContainer.appendChild(name);
        
        li.appendChild(avatar);
        li.appendChild(nameContainer);
        onlineUsersList.appendChild(li);
    });
}

// ==================== Typing Indicator ====================

/**
 * Update typing indicator display
 */
function updateTypingIndicator() {
    if (typingUsers.size === 0) {
        typingIndicator.classList.add('hidden');
        return;
    }
    
    typingIndicator.classList.remove('hidden');
    const users = Array.from(typingUsers);
    
    if (users.length === 1) {
        typingText.textContent = `${users[0]} is typing...`;
    } else if (users.length === 2) {
        typingText.textContent = `${users[0]} and ${users[1]} are typing...`;
    } else {
        typingText.textContent = `${users.length} people are typing...`;
    }
}

/**
 * Handle typing start
 */
function handleTypingStart() {
    if (!isTyping && presenceChannel) {
        isTyping = true;
        presenceChannel.track({ 
            username: currentUsername, 
            typing: true 
        });
    }
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (isTyping && presenceChannel) {
            isTyping = false;
            presenceChannel.track({ 
                username: currentUsername, 
                typing: false 
            });
        }
    }, 2000);
}

// ==================== Realtime Subscriptions ====================

/**
 * Subscribe to new messages
 */
function subscribeToMessages() {
    messageSubscription = supabaseClient
        .channel('messages')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                console.log('📨 New message received:', payload.new);
                const msg = payload.new;
                const isOwn = msg.username === currentUsername;
                addMessage(msg.username, msg.text, msg.created_at, isOwn, 'delivered');
            }
        )
        .subscribe((status) => {
            console.log('Message subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✓ Subscribed to messages');
                updateConnectionStatus(true);
            }
        });
}

/**
 * Subscribe to presence (online users and typing)
 */
function subscribeToPresence() {
    presenceChannel = supabaseClient.channel('online-users', {
        config: {
            presence: {
                key: currentUserId
            }
        }
    });
    
    // Track this user
    presenceChannel
        .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            console.log('👥 Presence synced:', state);
            updateOnlineUsers(state);
            
            // Update typing indicators
            typingUsers.clear();
            Object.values(state).forEach(presences => {
                presences.forEach(presence => {
                    if (presence.typing && presence.username !== currentUsername) {
                        typingUsers.add(presence.username);
                    }
                });
            });
            updateTypingIndicator();
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('👋 User joined:', newPresences);
            const username = newPresences[0].username;
            if (username !== currentUsername) {
                addSystemMessage(`${username} joined the chat`);
            }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('👋 User left:', leftPresences);
            const username = leftPresences[0].username;
            if (username !== currentUsername) {
                addSystemMessage(`${username} left the chat`);
            }
            typingUsers.delete(username);
            updateTypingIndicator();
        })
        .subscribe(async (status) => {
            console.log('Presence subscription status:', status);
            if (status === 'SUBSCRIBED') {
                console.log('✓ Subscribed to presence');
                await presenceChannel.track({ 
                    username: currentUsername,
                    typing: false,
                    online_at: new Date().toISOString()
                });
            }
        });
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(isConnected) {
    const statusText = document.querySelector('.connection-status');
    const indicator = statusText.querySelector('.status-indicator');
    
    if (isConnected) {
        indicator.classList.remove('offline');
        indicator.classList.add('online');
        statusText.childNodes[2].textContent = 'Connected';
    } else {
        indicator.classList.remove('online');
        indicator.classList.add('offline');
        statusText.childNodes[2].textContent = 'Disconnected';
    }
}

// ==================== Form Handlers ====================

/**
 * Handle join form submission
 */
joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    currentUsername = username;
    currentUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Switch screens
    joinScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    // Enable input
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
    
    // Load chat history
    await loadChatHistory();
    
    // Subscribe to realtime updates
    subscribeToMessages();
    subscribeToPresence();
});

/**
 * Handle message form submission
 */
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    if (!text) return;
    
    // Clear input
    messageInput.value = '';
    
    // Stop typing indicator
    if (isTyping && presenceChannel) {
        isTyping = false;
        presenceChannel.track({ 
            username: currentUsername, 
            typing: false 
        });
        clearTimeout(typingTimeout);
    }
    
    // Send message to Supabase
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([
                { 
                    username: currentUsername, 
                    text: text,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        console.log('✓ Message sent:', data);
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
});

/**
 * Handle typing in message input
 */
messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
        handleTypingStart();
    }
});

/**
 * Handle sidebar toggle
 */
toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    const icon = toggleSidebarBtn.querySelector('span');
    icon.textContent = sidebar.classList.contains('hidden') ? '▶' : '◀';
});

// ==================== Cleanup ====================

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (messageSubscription) {
        supabaseClient.removeChannel(messageSubscription);
    }
    if (presenceChannel) {
        presenceChannel.untrack();
        supabaseClient.removeChannel(presenceChannel);
    }
});

// ==================== Initialization ====================

/**
 * Initialize the application
 */
function init() {
    console.log('🚀 Initializing chat application with Supabase Realtime');
    updateConnectionStatus(false);
    
    // Focus username input on load
    usernameInput.focus();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
