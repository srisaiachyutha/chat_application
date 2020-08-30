/*
Copyright (c) 2020 by Sajad Hashemian (https://codepen.io/sajadhsm/pen/odaBdd)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


I used the https://codepen.io/sajadhsm/pen/odaBdd  pen for user interface in this porject
*/


const socket = io('http://localhost:3000')
const messageContainer = document.getElementById('message-container');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');
// is user is active on tab or not
var windowActive = true ;
// to count unread messages
var unread = 0;

if(messageForm != null){
    var name = prompt('Type your nick name.' , '');
    // checking the name entered must be not empty string
    while(true){
        if(name === '' || name == null || name == undefined){
            name = prompt('enter name whose length greater than 1');
        }else if( name.indexOf(' ') >= 0 ){
            name = prompt('name must not contain spaces');
        }else if(name.includes('/')){
            name = prompt('name must not contain /');
        }else{
            break;
        }
    }

    // setting the room name in the chat-box header
    const title_holder = document.getElementById("titleholder");
    title_holder.innerText = `Room name : ${roomName}`; 
    

    // emitting that u have joined in to room
    socket.emit('new-user',roomName,name);

    messageForm.addEventListener('submit',e=>{
        e.preventDefault();
        if(messageInput.value == null || messageInput.value.trim() === ''){
            // here message value is null so we simply do nothing here
        }
        else{
            const message = messageInput.value;
            //userMessage(`You(${name}) : ${message}`);
            appendMessage(name , 'right' , message);
            socket.emit('send-chat-message',roomName ,message);
            messageInput.value = '';
        }
    })

}

socket.on('users-online-list',usersList => {
    appendMessage('Online users','left',usersList);

    // to append that you have joined
    appendMessage(`You(${name})` , 'right', 'joined');
});

socket.on('chat-message',data => {
    appendMessage(  data.name , 'left', `${data.message}`);
})

socket.on('user-connected',name => {
    appendMessage( name , 'left' , ` connected`);
})

socket.on('user-disconnected',name => {
    appendMessage( name , 'left',`disconnected`);
})

// for appending message
function appendMessage(name, side, text) {
    // creating the message with required elements and data
    const messageElement = document.createElement('div');
    const leftorright = document.createElement('div');
    if(side == 'left'){
        leftorright.classList.add("left-msg");
    }else{
        leftorright.classList.add("right-msg");
    }
    leftorright.classList.add("msg");

    const bub = document.createElement('div');
    bub.classList.add("msg-bubble");

    const inf = document.createElement('div');
    inf.classList.add("msg-info");

    const infname = document.createElement('div');
    infname.classList.add("msg-info-name");
    infname.innerText = name;

    const inftime = document.createElement("div");
    inftime.classList.add("msg-info-time");
    inftime.innerText = formatDate(new Date());

    inf.appendChild(infname);
    inf.appendChild(inftime);

    const msgte = document.createElement("div");
    msgte.classList.add("msg-text");
    msgte.innerText = text;

    bub.appendChild(inf);
    bub.appendChild(msgte);

    leftorright.appendChild(bub);
    messageElement.appendChild(leftorright);
    // creating of message is completed
   
    // message is placed in the container
    messageContainer.append(messageElement);

    // if user is active we may scroll  to the last message
    if(windowActive){
        messageContainer.scrollTo(0 , messageContainer.scrollHeight);
        unread = 0;
    }else{
        // if user is not in active we have to update notifications
        // so we update unread and we change title of documentation
        unread += 1;
        document.title = `(${unread}) TemporaryChat`;
    }
    
  }


  // to format date in a required format
  function formatDate(date) {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();
  
    return `${h.slice(-2)}:${m.slice(-2)}`;
  }

// when user is active on this tab this will be called
// if any messages are still not read they will be make to be read
// and title will be change
window.onfocus = function () {
	windowActive = true;
    messageContainer.scrollTo(0 , messageContainer.scrollHeight);
    unread = 0;
	document.title = 'TemporaryChat';
}

// if window is not active
window.onblur = function () {
    windowActive = false;
    
}


