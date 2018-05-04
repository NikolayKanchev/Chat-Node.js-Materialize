$("#error").css("color", "white");

$(document).ready(function(){

    $('form').submit(function(event){
        event.preventDefault();
        let email= $('#email').val();
        let pass= $('#password').val();
        let pattern = new RegExp("^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
        let result = pattern .test(email);

        if(email === "" || pass === ""){
            $("#error").text("Fill out all fields !");
            $("#error").css("color","red");
        }
        else if(!result){
            $("#error").css("color","red");
            $("#error").text("Invalid e-mail !");
        }else{
            let data = {
                "email": email,
                "password": pass
            }

            $.ajax({
                type: "POST",
                url: "sign-in",
                data: data
            }).done(function(response) {
                let status = response.status;
                let username = response.username;
                let userId = response.userId;
                let active = true;
                
                if (status === 200){
                    $.post("updateActive", { userId: userId, isActive: active });
                    sessionStorage.setItem("username", username);                
                    sessionStorage.setItem("userId", userId);                
                    $(location).attr('href','http://localhost:3000/chat');
                }else{
                    $("#error").css("color","red");
                    $("#error").text(response.message);
                }
            });
        }
    });
});