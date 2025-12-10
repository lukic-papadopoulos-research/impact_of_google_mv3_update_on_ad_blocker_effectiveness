"use strict";

class MessageProcessor {
  actionInCase = {
    [MESSAGE_TYPES.blockElement]: actionInCaseBlockElement,
    [MESSAGE_TYPES.countBlockedElementsRequest]: actionInCaseCountBlockedElements,
    [MESSAGE_TYPES.deactivatedSitesRequest]: actionInCaseDeactivatedSitesRequest,
    [MESSAGE_TYPES.disableAdBlockersRequest]: actionInCaseDisableAdBlocker,
    [MESSAGE_TYPES.editBlockElement]: actionInCaseEditBlockElement,
    [MESSAGE_TYPES.exitBlockElement]: actionInCaseExitBlockElement,
    [MESSAGE_TYPES.getAdBlockerRequest]: actionInCaseGetAdBlocker,
    [MESSAGE_TYPES.getAppDataRequest]: actionInCaseGetAppData,
    [MESSAGE_TYPES.getBlockingDataRequest]: actionInCaseGetBlockingData,
    [MESSAGE_TYPES.getDataProcessingConsentRequest]: actionInCaseGetDataProcessingConsent,
    [MESSAGE_TYPES.getPageDataForContentRequest]: actionInCaseGetPageDataForContent,
    [MESSAGE_TYPES.getPageLoadTime]: actionInCaseGetPageLoadTime,
    [MESSAGE_TYPES.getPagesDataRequest]: actionInCaseGetPagesData,
    [MESSAGE_TYPES.getRuleMatchesRequest]: actionInCaseGetRuleMatches,
    [MESSAGE_TYPES.getUserDataRequest]: actionInCaseGetUserData,
    [MESSAGE_TYPES.getUserSettingsRequest]: actionInCaseGetUserSettings,
    [MESSAGE_TYPES.openSettingsPage]: openSettingsPage,
    [MESSAGE_TYPES.popupBlocked]: actionInCasePopupBlocked,
    [MESSAGE_TYPES.popupSitesRequest]: actionInCasePopupSitesRequest,
    [MESSAGE_TYPES.popupUserAction]: actionInCasePopupUserAction,
    [MESSAGE_TYPES.reportAnonymousData]: actionInCaseReportAnonymousData,
    [MESSAGE_TYPES.reportIssue]: actionInCaseReportIssue,
    [MESSAGE_TYPES.sendFeedback]: actionInCaseSendFeedback,
    [MESSAGE_TYPES.setDataProcessingConsent]: actionInCaseSetDataProcessingConsent,
    [MESSAGE_TYPES.setPageDataCustomCss]: actionInCaseSetPageDataCustomCss,
    [MESSAGE_TYPES.standsPopupOpened]: actionInCaseStandsPopupOpened,
    [MESSAGE_TYPES.undoBlockedElementsRequest]: actionInCaseUndoBlockedElements,
    [MESSAGE_TYPES.uninstallSelf]: actionInCaseUninstallSelf,
    [MESSAGE_TYPES.updateUserRequest]: actionInCaseUpdateUserRequest,
    [MESSAGE_TYPES.updateUserSettingsRequest]: actionInCaseUpdateUserSettings
  };
  async sendMessage(request, sender) {
    debug.log(`[MessageProcessor] Message received ${request.type}`, request);
    return new Promise(resolve => {
      statisticsComponent.runWhenStarted(async () => {
        await application.loadAllAndRun(async () => {
          const result = await this.actionInCase[request.type]?.(request, sender);
          resolve(result ?? true);
        });
      });
    });
  }
}
const messageProcessor = new MessageProcessor();