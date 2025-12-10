"use strict";

function getDateString(date, hours = 0, min = 0, sec = 0) {
  const result = new Date(date);
  result.setUTCHours(hours, min, sec, 0);
  return result.toISOString();
}
function isLastMinutes(time, minutes) {
  return isLastSeconds(time, minutes * 60);
}
function isLastSeconds(time, seconds) {
  return new Date().getTime() - time.getTime() < seconds * 1000;
}
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}