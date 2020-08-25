const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');


if(messageForm != null){
const name = prompt('Type your nick name.');
userMessage(`You(${name}): joined`);
socket.emit('new-user',roomName,name);

messageForm.addEventListener('submit',e=>{
    e.preventDefault();
    const message = messageInput.value;
    userMessage(`You(${name}) : ${message}`);
    socket.emit('send-chat-message',roomName ,message);
    messageInput.value = '';
})

}

socket.on('chat-message',data => {
    appendMessage(`${data.name}:${data.message}`);
})

socket.on('user-connected',name => {
    appendMessage(`${name} connected`);
})

socket.on('user-disconnected',name => {
    appendMessage(`${name} disconnected`);
})

function appendMessage(message){
    const  messageElement = document.createElement('div');
    messageElement.innerText = message;
    messageContainer.append(messageElement);
}
function userMessage(message){
    const messageElement = document.createElement('div');
    messageElement.style["background-color"]="green";
    messageElement.style["color"] = "white";
    messageElement.style["right"] = "0px";
    messageElement.style["text-align"] = "right";
    messageElement.style["border-radius"] = "5%";
    messageElement.style["flex-direction"] = "right";
    messageElement.innerText = message;
    messageContainer.append(messageElement);

}
