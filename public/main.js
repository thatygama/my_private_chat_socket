const socket = io();

let username = '';
let userList = [];

let loginPage = document.querySelector('#loginPage');
let chatPage = document.querySelector('#chatPage');

let loginInput = document.querySelector('#loginNameInput');
let buttonLogin = document.querySelector('#buttonLogin');
let chatInput = document.querySelector('#chatTextInput');

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList (){
    let ul = document.querySelector('.userList');
    ul.innerHTML = '';

    userList.forEach(user => {
        ul.innerHTML += `<li>${user}</li>`;
    });
};

function addMessage(type, user, msg){
    let ul = document.querySelector('.chatList');

    switch(type){
        case 'status':
            ul.innerHTML += `<li class="m-status">${msg}</li>`
        break;
        case 'msg':
            if(username == user){
                ul.innerHTML += `<li class="m-txt"><span class="me">${user}</span> ${msg}</li>`
            } else{
                ul.innerHTML += `<li class="m-txt"><span>${user}</span> ${msg}</li>`
            }
        break;
    };

    ul.scrollTop = ul.scrollHeight;
};

chatInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        let txt = chatInput.value.trim();
        chatInput.value = '';
    
        if(txt != ''){
            socket.emit('send-msg', txt);
        };
    };
});

function enterChat (){
    let name = loginInput.value.trim();
    
    if(name != ''){
        username = name;
        document.title = `Chat (${username})`;
        socket.emit('join-request', username);
    };
}

loginInput.addEventListener('keyup', (e) => {
    if(e.keyCode === 13){
        enterChat();
    }
});

buttonLogin.addEventListener('click', enterChat);

socket.on('user-ok', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatInput.focus();

    addMessage('status', null, 'Connected!');

    userList = list;
    renderUserList();
})

socket.on('list-update', (data) => {
    if(data.joined){
        addMessage('status', null, data.joined+' joined the chat.');
    }

    if(data.left){
        addMessage('status', null, data.left+' left the chat.');
    }

    userList = data.list;
    renderUserList();

});

socket.on('show-msg', (data) => {
    addMessage('msg', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'You have been disconnected!');
    userList = [];
    renderUserList();
});

socket.on('reconnect_error', () => {
    addMessage('status', null, 'Attempting to reconnect...');
});

socket.on('reconnect', () => {
    addMessage('status', null, 'Reconnected!');

    if(username != ''){
        socket.emit('join-request', username);
    }
});
