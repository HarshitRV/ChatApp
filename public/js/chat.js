"use strict";

console.log("chat.js loaded...")
document.getElementById("page-title").textContent = "Chat Room";

// Declarations -------------------------------------------------------------------
const socket = io();
const inputMessageElement = document.getElementById("message");
const messagesDiv = document.getElementById("messages");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatDiv = document.getElementById("chats");
const shareLocationBtn = document.getElementById("share-location");
const chatSidebar = document.getElementById("chat-sidebar");
// --------------------------------------------------------------------------------


// Utility Functions --------------------------------------------------------------

/**
 * @description - This function enables the autoscroll on new messages
 */
const autoscroll = () => {
  // New message element
  const $newMessage = messagesDiv.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  // Visible height
  const visibleHeight = messagesDiv.offsetHeight

  // Height of messages container
  const containerHeight = messagesDiv.scrollHeight

  // How far have I scrolled?
  const scrollOffset = messagesDiv.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight
  }
}

/**
 * @description - This function returns the current time in Intl format
 * @param {string} format - Locale time string
 * @returns {object} Intl.DateTimeFormat object | eg:- 06:00 AM
 */
const getCurrentTime = function (time, format = 'en-US') {
    return new Intl.DateTimeFormat(format, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(time));
}

/**
 * @description - This function returns the number of days passed.
 * 
 * @param {object} time - Time object | eg:2022-05-11T15:21:16.888Z
 * @returns {number} - number of days passed
 */
const calcDaysPassed = function (time) {
    const daysPassed = Math.abs(Math.round((new Date() - time) / (1000 * 60 * 60 * 24)));
    return daysPassed;
}

/**
 * @description  This function returns the date object with day, month and year
 * 
 * @param {string} - Locale string | @default 'en-US'
 * @param {object} time - Time object | eg:2022-05-11T15:21:16.888Z
 * @returns {object} - Intl.DateTimeFormat object | eg:- 11/09/2022
 */
const formatMessageDate = function (time, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(time);
}

/**
 * @description - This function returns the time in days, month and year Intl format
 * @param {object} time - Time object | eg:2022-05-11T15:21:16.888Z
 * @param {string} locale - Locale string | @default "en-US"
 * @returns {object} - Intl.DateTimeFormat object | eg:- 11/09/2022
 */
const formatMovementDates = function (time, locale = 'en-US') {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(time);
}

/**
 * @description - This function formats the days message as Today
 *                tomorrow, 7 days ago or, 11/09/2022
 * 
 * @param {number} numDays - Number of days passed
 * @param {string} locale - Locale string | @default "en-US"
 * @returns {string}
 */
const formatDaysMessage = function (numDays, locale = 'en-US') {
    if (numDays === 0) {
      return 'Today';
    } else if (numDays === 1) {
      return 'Yesterday';
    } else if (numDays <= 7) {
      return `${numDays} ago`
    } else {
      return formatMovementDates(numDays * 1000 * 60 * 60 * 24, locale)
    }
}

/**
 * @description - This function is used to parse the url.
 * @param {string} url - The url you want to parse.
 * @returns {object} with the property names and value
 */
const getJsonFromUrl = url => {
  if(!url) url = location.search;
  const query = url.slice(1);
  const result = {};
  query.split("&").forEach(function(part) {
    const item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

// Globals ------------------------------------------------------------------------
const { username, room } = getJsonFromUrl();
// --------------------------------------------------------------------------------


// Emitting the joinRoom when a user joins the room.
socket.emit("joinRoom", { username, room }, (error)=>{
  if(error) {
    alert(error);
    location.href = '/'
  }
  else {
    alert("Joined the chat room");
  }
});

socket.on("roomData", ({ room, users })=>{

  const getLiTags = (users) => {
    let liTags = ''
    users.forEach(user => {
      liTags += `<li>${user.username}</li>`
    });

    return liTags
  }

  const html = `
    <h2 class="room-title">room id - ${room}</h2>
    <h3 class="list-title">Online Users</h3>
    <ul class="users">
      <li>${ getLiTags(users) }</li>
    </ul>
  `
  chatSidebar.innerHTML = html

});

// Listening for message event...
socket.on("message", (msg)=>{
    const html = `
      <div class="messages">
        <p>
          <span class="message__name">${msg.username}</span>
          <span class="message__meta">${getCurrentTime(msg.createdAt)}</span>
        </p>
        <p>${msg.text}</p>
      </div> 
    `
    messagesDiv.insertAdjacentHTML('beforeend', html);
    autoscroll(); 
});

// Events emit and listen ----------------------------------------------------------
// Listening for location event...
socket.on("location", (locObj)=>{
  const html = `  
    <p>
      <span class="message__name">${locObj.username}</span>
      <span class="message__meta">${getCurrentTime(locObj.createdAt)}</span>
    </p>
    <p><a href="${locObj.url}" target=_blank>Location</a></p>`
    messagesDiv.insertAdjacentHTML('beforeend', html) 
    autoscroll();
});



sendMessageBtn.addEventListener("click", function(e){
    e.preventDefault();

    // Setting the button to be disabled unless the acknowledgement is received or 
    // message is delivered.
    
    const message = inputMessageElement.value;
    
    inputMessageElement.value = "";

    // Emitting the event to the server
    if(message.length > 0) {
      sendMessageBtn.setAttribute("disabled", "disabled");

      socket.emit("sendMessage", { message, username }, (acknowledgement)=>{
        if(acknowledgement) {
          alert(acknowledgement);
        } else {
          console.log("Message Delivered.");
        }
        // Enable the button once the acknowlegement is received or
        // message is delivered
        sendMessageBtn.removeAttribute("disabled");
        inputMessageElement.focus();
      });
    }
});

shareLocationBtn.addEventListener("click", ()=>{
    if(!navigator.geolocation) return alert("Your browser does not support sharing location.");

    // Diabling the share location button while the location
    // is being fetched.
    

    navigator.geolocation.getCurrentPosition((success, error)=>{
        if(!error) {
            // Emitting the event to the server
            shareLocationBtn.setAttribute("disabled", "disabled");

            socket.emit("geoLocation", {
                lat: success.coords.latitude,
                long: success.coords.longitude,
                username
            }, (acknowledgement)=>{
                console.log(acknowledgement);
            });
        } else alert("Couldn't find your location.")

        shareLocationBtn.removeAttribute("disabled");
    });
});