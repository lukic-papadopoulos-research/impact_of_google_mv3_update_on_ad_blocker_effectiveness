"use strict";

function createNotificationTitle(type, bypass, counter, title, host) {
  const elems = counter > 1 ? getLocalizedText('elements') : getLocalizedText('element');
  const notificationTitles = {
    [NOTIFICATION_TYPES.adblockDisable]: bypass ? getLocalizedText('other_prevents') : getLocalizedText('other_blocks'),
    [NOTIFICATION_TYPES.adblockWall]: getLocalizedText('this_site_shows'),
    [NOTIFICATION_TYPES.closedPopup]: getLocalizedText('has_closed_popups', [String(counter)]),
    [NOTIFICATION_TYPES.custom]: title,
    [NOTIFICATION_TYPES.disableOther]: getLocalizedText('other_disabled'),
    [NOTIFICATION_TYPES.donate]: getLocalizedText('donation_settings_title'),
    [NOTIFICATION_TYPES.enable]: bypass ? getLocalizedText('stands_back_on') : getLocalizedText('stands_turned_off'),
    [NOTIFICATION_TYPES.enableCurrent]: bypass ? getLocalizedText('blocking_resumed', [String(host)]) : getLocalizedText('the_site_was_whitelisted', [String(host)]),
    [NOTIFICATION_TYPES.rate]: title,
    [NOTIFICATION_TYPES.reactivate]: getLocalizedText('turn_on_fair_adblocking'),
    [NOTIFICATION_TYPES.unblock]: counter > 0 ? getLocalizedText('you_unblocked_on_this_page', [String(counter), elems]) : getLocalizedText('no_blocked_on_this_page')
  };
  return notificationTitles[type];
}