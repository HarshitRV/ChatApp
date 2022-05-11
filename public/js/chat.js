"use strict";
console.log("chat.js loaded...")

const socket = io();
const inputElement = document.getElementById("message");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatDiv = document.getElementById("chats");
const shareLocationBtn = document.getElementById("share-location");

socket.on("con", (c)=>{
    console.log(c);
});

socket.on("message", (msg)=>{
    console.log(msg);
    chatDiv.innerHTML = ""

  
    for(let i = msg.length - 1; i >= 0; i--){
        const sender = i % 2 === 0 ? 'Person A': 'Person B'
        const html = `<b>${sender}:</b> <p>${msg[i]} </p>`

        chatDiv.insertAdjacentHTML('afterbegin', html);
    }

    
    

    // msg.forEach((m, index)=>{
    //     const sender = index % 2 === 0 ? 'Person A': 'Person B'
    //     const html = `<p>${m} from ${sender}</p>`

    //     chatDiv.insertAdjacentHTML('afterbegin', html);
    // });
    
});

// Listen for location being sent by the server
socket.on("location", (location)=>{
    console.log(`https://www.google.com/maps/@${location.lat},${location.long}`);
});

sendMessageBtn.addEventListener("click", function(e){
    e.preventDefault();
    const message = inputElement.value;
    
    inputElement.value = "";

    if(message.length > 0) socket.emit("sendMessage", message, (acknowledgement)=>{
        if(acknowledgement) return console.log(acknowledgement)
        else console.log("Message Deleivered.")
    });
   
});

shareLocationBtn.addEventListener("click", ()=>{
    if(!navigator.geolocation) return alert("Your browser does not support sharing location.");

    navigator.geolocation.getCurrentPosition((success, error)=>{
        if(!error) {
            socket.emit("geoLocation", {
                lat: success.coords.latitude,
                long: success.coords.longitude
            }, (acknowledgement)=>{
                console.log(acknowledgement);
            });
        } else alert("Couldn't find your location.")
    });
});
