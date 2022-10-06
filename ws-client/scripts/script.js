const socket = new WebSocket('ws://localhost:8080', 'echo-protocol');
const messagesWindow = document.getElementById('messagesWindow');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('button-addon2');
const status = document.getElementById('status');

let name;

socket.onmessage = messageEvent => {
    const data = JSON.parse(messageEvent.data);
    if (data.type === 'registration') {
        name = data.name;
    }

    if (data.type === 'message') {
        addMessage(data);
    }

    if (data.type === 'typing' || data.type === 'close') {
        udpdateStatus(data);
    }
};

let statusTimeout;

function udpdateStatus(data) {
    if (data.type === 'typing' && data.name !== name) {
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            status.textContent = '';
        }, 1000);
        status.textContent = `${data.name} is typing...`;
    }

    if (data.type === 'close') {
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            status.textContent = '';
        }, 3000);
        status.textContent = `${data.name} left the conversation`;
    }


}

messageInput.addEventListener('keydown', () => {
    const messageObj = {
        type: 'typing',
        name
    };
    socket.send(JSON.stringify(messageObj));
});

function addMessage(messageObj) {
    const message =
    `<div class="message-box ${messageObj.name === name ? 'own-message-box' : ''} ">
    <div class="message">
    <span class ="message-user">${messageObj.name}</span>
    <p class="message-text">${messageObj.message}</p>
    <span class ="message-time"> ${messageObj.time}</span></div>
    </div>`;

    messagesWindow.innerHTML += message;
}

function messageHandle() {
    const message = messageInput.value;
    if (message) {
        const messageObj = {
            type: 'message',
            message,
            name
        };
        socket.send(JSON.stringify(messageObj));
    }
    messageInput.value = '';
}

socket.onopen = () => {
    console.log('Connection is open');

    sendButton.addEventListener('click', messageHandle);

    document.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            messageHandle();
        }
    });
};

socket.onerror = () => {
    console.log('Connection Error');
};

socket.onclose = () => {
    console.log('Connection is close');
};


