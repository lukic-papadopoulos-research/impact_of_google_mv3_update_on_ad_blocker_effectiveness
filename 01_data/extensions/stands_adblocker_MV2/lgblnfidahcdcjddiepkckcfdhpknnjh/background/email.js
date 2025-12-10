"use strict";

async function sendEmail(type, source, content) {
  await serverApi.callUrl({
    url: `https://zapier.com/hooks/catch/b2t6v9/?type=${encodeURIComponent(type)}&Source=${encodeURIComponent(source)}&Content=${encodeURIComponent(content)}`
  });
}