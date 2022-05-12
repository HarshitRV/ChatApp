console.log("join page script loaded...");
document.getElementById("page-title").textContent = "Join";

const socket = io();

const joinRoomForm = document.getElementById("join-room-form");
joinRoomForm.addEventListener("submit", (e)=>{
    const username = joinRoomForm.querySelector('input[name="username"]').value;
    const room = joinRoomForm.querySelector('input[name="room"]').value;
    
    if(!username.length > 2 || !room.length > 0){
        return console.log("Invalid request");
    }
})