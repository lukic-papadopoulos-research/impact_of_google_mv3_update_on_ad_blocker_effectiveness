"use strict";

const sponsoredTexts = ['sponsoreret', 'sponsrad', 'հովանավորվող', 'реклама', 'sponsorisé', 'patrocinado', 'sponsa', 'bersponsor', 'commandité', 'ditaja', 'gesponsert', 'gesponsord', 'publicidad', 'sponset', 'sponsored', 'sponsorizat', 'sponsorizzato', 'sponsorlu', 'sponsorowane', 'sponsoroitu', 'may sponsor', 'χορηγούμενη', 'la maalgeliyey', 'geborg', 'reklam', 'kanthi sponsor', 'giisponsoran', 'sponzorirano', 'paeroniet', 'patrocinat', 'sponzorováno', 'noddwyd', 'anzeige', 'szpōnzorowane', 'مُموَّل', 'পৃষ্ঠপোষকতা কৰা', 'spunsurizatu', '広告', 'ⵉⴷⵍ', 'ܒܘܕܩܐ ܡܡܘܘܢܐ', 'پاڵپشتیکراو', 'reklamo', 'рэклама', 'спонсорирано', 'спонзорирано', 'সৌজন্যে', 'babestua', 'دارای پشتیبانی مالی', 'stuðlað', 'urraithe', 'oñepatrosinapyre', 'પ્રાયોજિત', 'daukar nauyi', 'ממומן', 'plaćeni oglas', 'peye', 'प्रायोजित', 'kostað', 'disponsori', 'რეკლამა', 'демеушілік көрсеткен', 'បានឧបត្ថម្ភ', 'демөөрчүлөнгөн', 'ຜູ້ສະໜັບສະໜູນ', 'remiama', 'apmaksāta reklāma', 'misy mpiantoka', 'സ്പോൺസർ ചെയ്തത്', 'ивээн тэтгэсэн', 'sponsorjat', 'ပံ့ပိုးထားသည်', 'sponzorované', 'zvabhadharirwa', 'la maalgeliyey', 'imedhaminiwa', 'хәйрияче', 'được tài tr'];
function blockMetaFeedAds(closest) {
  setInterval(() => {
    const uses = document.querySelectorAll('use');
    uses.forEach(use => {
      const state = use.getAttribute('stndz-state');
      if (state === '1') {
        return;
      }
      let href = use.getAttribute('xlink:href');
      const svg = document.querySelector(`svg${href}`);
      if (svg) {
        href = svg.querySelector('use').getAttribute('xlink:href');
      }
      const text = document.querySelector(`text${href}`);
      if (text && sponsoredTexts.includes(text.textContent.toLowerCase())) {
        const parent = use.closest(closest);
        if (parent) {
          parent.style.display = 'none';
          use.setAttribute('stndz-state', '1');
        }
      }
    });
  }, 250);
}