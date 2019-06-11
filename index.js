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
This likely needs to be more than just this lambda
  Roadmap:

  1. check for each page's existence and build list of ones to request.
    a. paginate
      - maybe build map of site:pages by trying known combos to find the correct one
        (this is a big ?. some forums take params with page numbers
        others an item count IE: theSamba, &start=440. (offset)
        pirate4x4 does not use params at all, the page name is altered.
        Perhaps solution should be more of a crawler based on page content than api)
      - allow users to enter page params
    b. request archives
    c. return entire list of archive links.
  2. create git commit.
      a. git site repo
      b. create rando branch
      c. build page with input data + archive links (array).
          - need to change styling.
          - need to grab images for thumbnail, possibly resize/optimize, find an api somewhere.
            JIMP! https://www.npmjs.com/package/jimp


  v1. Should be biased towards archiving, not just submitting links.

*/








/*
  event == { url, pageCount }
*/
async function handler(event, context) {
  if (!event.url) return context.done({error:{status_code:400,description: "url not defined"}});

  const archiveUrl = await waybackCheck(event);
  if (archiveUrl) return context.done(archiveUrl);

  // request some archives
  // TODO: This doesnt work the way you think it does
  const resourceInfo = urlParser(event.url);
  const paginationString = config.pagination[resourceInfo.tokenized[1]]; // .sld should return 'google' from www.google.com

  let archiveRequest = `${config.archive_api.save}/${event.url}`
  let pageCount = event.pageCount || 1;

  // if pagination is not mapped for this domain, dont paginate
  if (!paginationString) {
    pageCount = 1;
  }

  for (var i = 0; i < event.pageCount; i++) {
    let url = archiveRequest;

    if (paginationString) {
      url = `${archiveRequest}${paginationString}${i}`
    }

    console.log(`Requesting Archive for: ${url}`);
    await rp(url);
  }

  context.done(
    await waybackCheck(event)
  );
}

module.exports = { handler };
