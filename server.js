const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

const rooms = { }

// for the staring of the main page
app.get('/',(req, res) => {
    // rendering the main page
    res.render('main',{});
})

app.post('/room',(req,res) => {
    // if somebody have entered the room name in the main form
    // directing him into that page

    if(rooms[req.body.room] == null){
        rooms[req.body.room] = {users : {} , len : 0};
    }
    res.redirect('/'+ req.body.room);
})

app.get('/:room',(req , res) => {
    // if the requested room is not in the server
    // creating the room from that request and after that we render that
    // page for the user who requested
    if(rooms[req.params.room]== null){
        rooms[req.params.room] = { users : {} , len : 0};
    }
    // here as we are using /:room as our routing capturing we
    // get the room as a parameter so we can use that for our purpose
    res.render('room',{ roomName : req.params.room})
})

server.listen(3000);

// for connecting the sockets to the server
io.on('connection' , socket => {

    // if a new user is created we are cnnecting to that room
    socket.on('new-user',(room, name) => {
        
        if(rooms[room] === undefined){
            //console.log(room);
            return;
            
        }else{
            socket.join(room);
            if(socket.id != undefined){
                
                

                if(rooms[room] != {}){
                    let usersList = '';
                    for(let socketid in rooms[room].users){
                        usersList += `${ rooms[room].users[socketid]} ,`;
                    }
                    if(usersList.trim() === ''){
                        socket.emit('users-online-list','No users yet.')
                    }else{
                        socket.emit('users-online-list',usersList);
                    }
                }
                rooms[room].users[socket.id] = name;
                rooms[room].len +=1 ;

                socket.to(room).broadcast.emit('user-connected',name);

            }else{
                res.redirect('/'+ room);
            }
        }
    });

    // sending the message from a user of a room to entire users of 
    // that room
    socket.on('send-chat-message',(room ,message) =>{
        
            if(rooms[room] === undefined){
                return;
            }
        socket.to(room).broadcast.emit('chat-message',{message:message , name: rooms[room].users[socket.id]})
    });

    // if user is diconnected from a room
    socket.on('disconnect',()=>{
        for(let room in rooms){
            if(rooms[room].users[socket.id] != null){
                socket.to(room).broadcast.emit('user-disconnected',rooms[room].users[socket.id]);
                
                // deleting the user from that room 
                delete rooms[room].users[socket.id];
                rooms[room].len -= 1;

                // checking whether the room is empty 
                if (Object.keys(rooms[room].users).length === 0){
                    // if no user is present we can delete the room from rooms

                    delete rooms[room];
                }
            }
        }
        
    });
})