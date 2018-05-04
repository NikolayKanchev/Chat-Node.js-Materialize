$("#error").css("color", "white");

$(document).ready(function(){

    $('form').submit(function(event){
        event.preventDefault();
        let firstName= $('#first-name').val();
        let lastName= $('#last-name').val();
        let email= $('#email').val();
        let pass= $('#password').val();
        
        let data = {
            "firstName": firstName,
            "lastName": lastName,
            "email": email,
            "password": pass
        }

        $.ajax({
            type: "POST",
            url: "register-user",
            data: data
        }).done(function(response) {
            let status = response.status;
            let username = response.username;
            let message = response.message;
            let userId = response.userId;

            if (status === 200){
                sessionStorage.setItem("username", username);               
                sessionStorage.setItem("message", message); 
                sessionStorage.setItem("email", email); 
                sessionStorage.setItem("userId", userId);                             
                $(location).attr('href','http://localhost:3000/chat');
            }else{
                $("#error").text(response.message);
                $("#error").css("color","red");
            }
        });
    });
});