"use strict";
console.log("chat.js loaded...")

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
// --------------------------------------------------------------------------------

socket.on("message", (msg)=>{
    console.log(msg);
    const html = `<p>${msg.text} ${getCurrentTime(msg.createdAt)}</p>`;
    chatDiv.insertAdjacentHTML('beforeend', html); 
});

// Events emit and listen ----------------------------------------------------------
// Listen for location being sent by the server
socket.on("location", (location)=>{
    console.log(`https://www.google.com/maps/@${location.lat},${location.long}`);
    const loc = `https://www.google.com/maps/@${location.lat},${location.long}`
    const html = `<p><a href="${loc}" target=_blank>This is my location</a></p>`;
    chatDiv.insertAdjacentHTML('beforeend', html) 
});

sendMessageBtn.addEventListener("click", function(e){
    e.preventDefault();

    // Setting the button to be disabled unless the acknowledgement is received or 
    // message is delivered.
    sendMessageBtn.setAttribute("disabled", "disabled");
    const message = inputElement.value;
    
    inputElement.value = "";

    if(message.length > 0) socket.emit("sendMessage", message, (acknowledgement)=>{
        if(acknowledgement) return console.log(acknowledgement)
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
            socket.emit("geoLocation", {
                lat: success.coords.latitude,
                long: success.coords.longitude
            }, (acknowledgement)=>{
                console.log(acknowledgement);
            });
        } else alert("Couldn't find your location.")

        shareLocationBtn.removeAttribute("disabled");
    });
});