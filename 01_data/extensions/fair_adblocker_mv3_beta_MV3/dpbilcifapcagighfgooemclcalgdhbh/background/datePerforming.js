function getDateString(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}
function getUtcDateString(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate();
}
function getUtcDateAndHourString(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + ' ' + getDoubleDigitNumber(date.getUTCHours()) + ':00';
}
function getUtcDateAndMinuteString(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + ' ' + getDoubleDigitNumber(date.getUTCHours()) + ':' + getDoubleDigitNumber(date.getUTCMinutes());
}
function getUtcDateAndSecondString(date) {
    return date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + ' ' + getDoubleDigitNumber(date.getUTCHours()) + ':' + getDoubleDigitNumber(date.getUTCMinutes()) + ':' + getDoubleDigitNumber(date.getUTCSeconds());
}
function getLocalDateAndMinuteString(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + getDoubleDigitNumber(date.getHours()) + ':' + getDoubleDigitNumber(date.getMinutes());
}
function getLocalDateAndSecondString(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + getDoubleDigitNumber(date.getHours()) + ':' + getDoubleDigitNumber(date.getMinutes()) + ':' + getDoubleDigitNumber(date.getSeconds());
}
function toUTCString(time) {
    return time.getUTCFullYear() + '-' +
        (time.getUTCMonth() + 1) + '-' +
        time.getUTCDate() + ' ' +
        time.getUTCHours() + ':' +
        time.getUTCMinutes() + ':' +
        time.getUTCSeconds();
}
function isLastMinutes(time, minutes) {
    return isLastSeconds(time, minutes * 60);
}
function isLastSeconds(time, seconds) {
    return (utcTimeGetter().getTime() - time.getTime()) < seconds * 1000;
}
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
}
function isSameDayUtc(date1, date2) {
    return date1.getUTCFullYear() === date2.getUTCFullYear() && date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCDate() === date2.getUTCDate();
}
function isSameDayByTimeZone(date1, date2, timeZone) {
    const timeZoneDiff = getHoursDiffByTimeZone(timeZone);
    const date1WithTimeZone = new Date(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate(), date1.getHours() + timeZoneDiff, 0, 0, 0);
    const date2WithTimeZone = new Date(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate(), date2.getHours() + timeZoneDiff, 0, 0, 0);
    return date1WithTimeZone.getFullYear() === date2WithTimeZone.getFullYear() && date1WithTimeZone.getMonth() == date2WithTimeZone.getMonth() && date1WithTimeZone.getDate() === date2WithTimeZone.getDate();
}
function getHoursDiffByTimeZone(timeZone) {
    const now = new Date();
    return ((new Date(getUtcDateString(now) + ' 00:00 UTC').getTime() - new Date(getUtcDateString(now) + ' 00:00 ' + timeZone).getTime()) / (60 * 60 * 1000)) + (now.getTimezoneOffset() / 60);
}
function getMondayOfWeek(date) {
    const day = date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (day == 0 ? -6 : 1) - day);
}
