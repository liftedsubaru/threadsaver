const rp = require('request-promise');
const _ = require('lodash')
const config = require('./config');
const urlParser = require('domain-name-parser');

async function waybackCheck(event) {
  const waybackCheck = await rp(`${config.archive_api.check}${event.url}`);
  archiveCheck = JSON.parse(waybackCheck);
  return _.get(archiveCheck, 'archived_snapshots.closest.url')
}

/*
  event == { url, pageCount }
*/
async function handler(event, context) {
  if (!event.url !== undefined) return context.done({error:{status_code:400,description: "url not defined"}}');

  const archiveUrl = await waybackCheck(event);
  if (archiveUrl) return context.done(archiveUrl);

  // request some archives
  const resourceInfo = urlParser(event.url);
  const paginationString = config.pagination[resourceInfo.sld]; // .sld should return 'google' from www.google.com

  if (!paginationString) {
    // TODO default behavior
  }

  let pageCount = event.pageCount || 1;

  for (var i = 0; i < event.pageCount; i++) {
    const url = `${config.archive_api.save}/${event.url}${paginationString}${i}`;
    console.log(`Requesting Archive for: ${url}`);
    await rp(url);
  }

  context.done(
    await waybackCheck(event)
  );
}

module.exports = { handler };
