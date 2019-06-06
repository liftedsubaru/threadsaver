const index = require('./index.js')

// https://www.pirate4x4.com/forum/ford/824933-tips-fender-cutting.html#/topics/824933?page=1
// https://www.ultimatesubaru.org/forum/topic/122906-the-awesome-older-generation-picture-thread/
index.handler({
  url:'https://www.ultimatesubaru.org/forum/topic/122906-the-awesome-older-generation-picture-thread',
  pageCount: 5
},
{
  done:(r, e) => {
    console.log('\nDone...');
    console.log(r);
    console.log(e);
}})
