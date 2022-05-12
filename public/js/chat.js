"use strict";
console.log("chat.js loaded...")
document.getElementById("page-title").textContent = "Chat Room";

// Declarations -------------------------------------------------------------------
const socket = io();
const inputElement = document.getElementById("message");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const chatDiv = document.getElementById("chats");
const shareLocationBtn = document.getElementById("share-location");
// --------------------------------------------------------------------------------


// Utility Functions --------------------------------------------------------------
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
  var query = url.substr(1);
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

// Globals ------------------------------------------------------------------------
const { username, room } = getJsonFromUrl();
// --------------------------------------------------------------------------------


// --------------------------------------------------------------------------------
// Listening for message event...
socket.on("message", (msg)=>{
    console.log(msg);
    // const html = `<p>${msg.text} : ${getCurrentTime(msg.createdAt)}</p>`;
    const html = `  
      <p>
        <span class="message__name">${msg.username}</span>
        <span class="message__meta">${getCurrentTime(msg.createdAt)}</span>
      </p>
      <p>${msg.text}</p>`
    chatDiv.insertAdjacentHTML('beforeend', html); 
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
    chatDiv.insertAdjacentHTML('beforeend', html) 
});

sendMessageBtn.addEventListener("click", function(e){
    e.preventDefault();

    // Setting the button to be disabled unless the acknowledgement is received or 
    // message is delivered.
    sendMessageBtn.setAttribute("disabled", "disabled");
    const message = inputElement.value;
    
    inputElement.value = "";

    // Emitting the event to the server
    if(message.length > 0) socket.emit("sendMessage", { message, username }, (acknowledgement)=>{
        if(acknowledgement) {
          sendMessageBtn.removeAttribute("disabled");
          return console.log(acknowledgement);
        }
        else console.log("Message Delivered.")

        // Enable the button once the acknowlegement is received or
        // message is delivered
        sendMessageBtn.removeAttribute("disabled");
        inputElement.focus();
    });
   
});

shareLocationBtn.addEventListener("click", ()=>{
    if(!navigator.geolocation) return alert("Your browser does not support sharing location.");

    // Diabling the share location button while the location
    // is being fetched.
    shareLocationBtn.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((success, error)=>{
        if(!error) {
            // Emitting the event to the server
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

socket.emit("joinRoom", { username, room });