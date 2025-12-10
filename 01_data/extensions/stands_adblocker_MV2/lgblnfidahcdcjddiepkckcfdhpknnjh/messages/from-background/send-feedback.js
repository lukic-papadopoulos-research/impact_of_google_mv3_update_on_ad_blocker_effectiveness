"use strict";

async function actionInCaseSendFeedback({
  payload
}) {
  const {
    geo
  } = userDataComponent.getSettings();
  const content = `Geo: ${geo}\nFeedback: ${payload.feedback}`;
  await sendEmail('Feedback', 'App', content);
}