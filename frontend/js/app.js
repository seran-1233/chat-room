// ==================== Configuration ====================
// Supabase Configuration - everything runs on Vercel!
const SUPABASE_URL = 'https://jgyvmrhjmjsswyqdglbp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneXZtcmhqbWpzc3d5cWRnbGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMDcxOTUsImV4cCI6MjA5OTY4MzE5NX0.cKTJPB6JL8pmK-biGwF2ZgPSf09s1Ub88mM78fhOWEE';

console.log('🔌 Connecting to Supabase Realtime (Vercel Compatible)');

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

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getInitial(username) {
    return username.charAt(0).toUpperCase();
}

function getColorFromUsername(username) {
    const colors = [
        '#4f46e5', '#7c3aed', '#db2777', '#dc2626', 
        '#ea580c', '#ca8a04', '#16a34a', '#0891b2'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function autoScroll() {
    const threshold = 100;
    const scrollPosition = messagesContainer.scrollTop + messagesContainer.clientHeight;
    const isNearBottom = messagesContainer.scrollHeight - scrollPosition < threshold;
    
    if (isNearBottom) {
        scrollToBottom();
    }
}

// ==================== Message Rendering ====================

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
        statusIcon.textContent = status === 'delivered' ? '✓✓' : '✓';
        
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
        
        const nameContainer = document.createElement('span');
        nameContainer.className = 'user-name';
        
        const name = document.createElement('span');
        name.textContent = username;
        if (username === currentUsername) {
            name.textContent += ' (you)';
        }
        
        nameContainer.appendChild(name);
        li.appendChild(avatar);
        li.appendChild(nameContainer);
        onlineUsersList.appendChild(li);
    });
}

// ==================== Typing Indicator ====================

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

function subscribeToMessages() {
    messageSubscription = supabaseClient
        .channel('messages')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                console.log('📨 New message:', payload.new);
                const msg = payload.new;
                const isOwn = msg.username === currentUsername;
                addMessage(msg.username, msg.text, msg.created_at, isOwn, 'delivered');
            }
        )
        .subscribe((status) => {
            console.log('Message subscription:', status);
            if (status === 'SUBSCRIBED') {
                updateConnectionStatus(true);
            }
        });
}

function subscribeToPresence() {
    presenceChannel = supabaseClient.channel('online-users', {
        config: {
            presence: { key: currentUserId }
        }
    });
    
    presenceChannel
        .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState();
            updateOnlineUsers(state);
            
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
        .on('presence', { event: 'join' }, ({ newPresences }) => {
            const username = newPresences[0].username;
            if (username !== currentUsername) {
                addSystemMessage(`${username} joined the chat`);
            }
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            const username = leftPresences[0].username;
            if (username !== currentUsername) {
                addSystemMessage(`${username} left the chat`);
            }
            typingUsers.delete(username);
            updateTypingIndicator();
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({ 
                    username: currentUsername,
                    typing: false
                });
            }
        });
}

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

joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    currentUsername = username;
    currentUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    joinScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
    
    await loadChatHistory();
    subscribeToMessages();
    subscribeToPresence();
});

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = messageInput.value.trim();
    if (!text) return;
    
    messageInput.value = '';
    
    if (isTyping && presenceChannel) {
        isTyping = false;
        presenceChannel.track({ username: currentUsername, typing: false });
        clearTimeout(typingTimeout);
    }
    
    try {
        console.log('📤 Sending message:', { username: currentUsername, text });
        
        const { data, error } = await supabaseClient
            .from('messages')
            .insert([{ username: currentUsername, text: text }]);
        
        if (error) {
            console.error('❌ Supabase error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            alert('Failed to send message: ' + error.message);
            throw error;
        }
        
        console.log('✅ Message sent successfully!', data);
    } catch (error) {
        console.error('❌ Catch error:', error);
        alert('Failed to send message: ' + (error.message || 'Unknown error'));
    }
});

messageInput.addEventListener('input', () => {
    if (messageInput.value.trim()) {
        handleTypingStart();
    }
});

toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    const icon = toggleSidebarBtn.querySelector('span');
    icon.textContent = sidebar.classList.contains('hidden') ? '▶' : '◀';
});

// ==================== Cleanup ====================

window.addEventListener('beforeunload', () => {
    if (messageSubscription) supabaseClient.removeChannel(messageSubscription);
    if (presenceChannel) {
        presenceChannel.untrack();
        supabaseClient.removeChannel(presenceChannel);
    }
});

// ==================== Initialization ====================

function init() {
    console.log('🚀 Chat app v1.1 - Vercel + Supabase Realtime');
    updateConnectionStatus(false);
    usernameInput.focus();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
