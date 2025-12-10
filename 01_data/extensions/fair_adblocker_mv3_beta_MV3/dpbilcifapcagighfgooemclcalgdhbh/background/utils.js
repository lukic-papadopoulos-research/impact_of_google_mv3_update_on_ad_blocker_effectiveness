// this function is to get new Date, yeah
const utcTimeGetter = () => new Date();
function getDoubleDigitNumber(number) {
    return number.toString().length === 1 ? Number('0' + number) : number;
}
function sendEmail(type, source, content) {
    callUrl({
        url: 'https://zapier.com/hooks/catch/b2t6v9/?type=' +
            encodeURIComponent(type) + '&Source=' + encodeURIComponent(source) +
            '&Content=' + encodeURIComponent(content)
    });
}
function getMandatory(obj, name) {
    if (obj) {
        return obj;
    }
    throw chrome.i18n.getMessage('is_mandatory', name);
}
