// get the username and the userId from the session storage 
let username = sessionStorage.getItem("username");
let userId = sessionStorage.getItem("userId");

if(username === null || userId === null){
    $(location).attr('href','http://localhost:3000/');
}else{

    let socket = io.connect("http://localhost:3000");

    if(sessionStorage.message === "The user was registered successfully !"){
        console.log(sessionStorage.message);
        socket.emit("Send registration confirmation e-mail", {'email': sessionStorage.email});

    }

    socket.emit("get users");

    //loads all users
    socket.on("broadcasted users", function(data) {
        let users = data.users;
        
        $("#users-container-small").text("");

        users.forEach(user => {                
            if(user.id !== +userId){
                //If the user is active appends the user with a green dot
                if(user.is_active){
                    $("#users-container-small").append(
                "<div id='new-user'><div id='nick-name'>"+ user.username +"</div><div id='name'>"+ user.firstName +" "+ user.lastName +"</div><div id='activ'></div></div>");
                }else{
                    $("#users-container-small").append(
                        "<div id='new-user'><div id='nick-name'>"+ user.username +"</div><div id='name'>"+ user.firstName +" "+ user.lastName +"</div></div>");
                } 
            }
        });
        
    });


    $(document).ready(function(){

        //Sets the first letters of the name, so the user can see that this is his/her session
        $("#letters").text(username);

        //gets all messages
        $.get( "get-messages", function(data) {
            console.log(data.messages);

            if (data.status === 200){
                let messages = data.messages;
                messages.forEach(m => {  
                    // Appends the message to the DOM
                    if(m.user_id === userId){
                        let message = 
                        "<div id='self-message'><div id='nick-name'>Me</div><div><div id='text'>"+ m.text +"</div><div id='time'>"+ m.created_at +"</div></div></div>";
                        $("#chat-area").append(message);
                    }else{
                        let message = 
                        "<div id='message'><div id='nick-name'>"+ m.username +"</div><div><div id='text'>"+ m.text +"</div><div id='time'>"+ m.created_at +"</div></div></div>";
                        $("#chat-area").append(message);
                    }
                });
            }else{
                let erorMessage ="<div id='left'>"+ data.message +" - left the chatroom !!!</div>";
                $("#chat-area").append(erorMessage);
            }
                //Starts the scrollbar at the bottom
                $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
        });

        $(document).keypress(function(e) {
            //Detect Enter key pressed
            if(e.which == 13 || event.keyCode == 13) {
                let message = $("#new-message-container").val();
                //removes all the white spaces
                message = message.replace(/>\s*</, '><').replace(/\s+$/, '');
                let date = new Date(Date.now());
                let selfMessage = 
                "<div id='self-message'><div id='nick-name'>Me</div><div><div id='text'>"+ message +"</div><div id='time'>"+ date.toLocaleString() +"</div></div></div>";

                if(message !== ''){                    
                    $("#chat-area").append(selfMessage);

                    //Starts the scrollbar at the bottom
                    $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);

                    // It sends the message to the server via socket
                    socket.emit("new message", {"userId":userId, "username": username,"message": message, "date": date.toLocaleString()});

                }
                // Clear the text area after the message was send
                $("#new-message-container").val('');
            }
        });

        
        socket.on("broadcasted message", function(data) {
            // Appends the new message to the DOM
            let message = 
            "<div id='message'><div id='nick-name'>"+ data.data.username +"</div><div><div id='text'>"+ data.data.message +"</div><div id='time'>"+ data.data.date +"</div></div></div>";
            $("#chat-area").append(message);
            //Starts the scrollbar at the bottom
            $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
        });

        //The heartbeat of the system
        setInterval(function(){
            socket.emit("heartbeat", { "userId":userId, "username": username, "date": Date.now() });
        }, 4000);

        socket.on("socket close", function(data){
            let username = data.username;
            let message ="<div id='left'>"+ username +" - left the chatroom !!!</div>";
            $("#chat-area").append(message);
            //updates the users
            setTimeout(() => {
                socket.emit("get users");
            }, 1000);
            //Starts the scrollbar at the bottom
            $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);
        });

        socket.on("Registration success", function(data){

            let message ="<div id='left'>"+ data.message +"</div>";
            $("#chat-area").append(message);
            $("#left").css("color", "red");


            //Starts the scrollbar at the bottom
            $("#chat-area").scrollTop($("#chat-area")[0].scrollHeight);

            setTimeout(() => {
                $("#left").fadeOut("slow");
            }, 3000);

            
        });
    });
}
