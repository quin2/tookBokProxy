const express = require('express')

const app = express();
const port = 3000;

//set up static
app.set('view engine', 'pug')
app.use(express.static('css'));

//serve only endpoint
app.get('/', async (req, res) => {

  /*
  for (let i = 0; i < 5; i++) {
    
    if (finalContent != "") break;
  }
  */

  let finalContent = await generate()

  res.render('index', { book: finalContent })
});

async function generate() {
  let maxBooks = 70048; //this is the limit as of 2/27/23

  let book = await getRandomBook(maxBooks);

  console.log(book)

  if (!book.languages.includes("en")) {

    return "";
  }

  let finalContent = ""

  //check if we have the formats we need
  let okFormats = ['text/plain; charset=utf-8', 'text/plain']
  for (const format of okFormats) {
    if (format in book.formats) {
      finalContent = await loadBook(book.formats[format])
      break;
    }
  }

  if (finalContent.split(' ').length > 400) {
    return finalContent
  }

  return ""
}

async function getRandomBook(maxBooks) {
  let randomBook = getRandomInt(1, maxBooks)
  let rbookMeta = await fetch(`https://gutendex.com/books/${randomBook}`)
  rbookMeta = await rbookMeta.json()

  return rbookMeta
}

async function loadBook(bookURL) {
  //get content
  let content = await fetch(bookURL, { cors: 'no-cors' })
  content = await content.text()

  //parse out start + end tokens
  let sm = "*** START OF THIS PROJECT GUTENBERG EBOOK"
  let em = "PROJECT GUTENBERG"

  let starti = content.indexOf(sm)
  if (starti == -1) {
    sm = "***START"
    starti = content.indexOf(sm)
  }

  //start 100 letters in
  starti += 100
  let endi = content.indexOf(em, starti)
  let result = content.substring(starti, endi)

  //find a random exerpt
  words = result.split(' ')
  length = 500
  //if content is too short, quit
  if (words < length) {
    return ""
  }

  //find random start word
  let marker = getRandomInt(1, words.length - length)

  //slice that up
  const slicedPassage = words.slice(marker, marker + length)



  for (let i = 0; i < slicedPassage.length; i++) {
    let process = slicedPassage[i];
    if ((process.split('\r\n').length - 1) < 2) {
      slicedPassage[i] = process.replace('\r\n', ' ')
    }
  }

  console.log(slicedPassage)

  //return 
  return slicedPassage.join(' ')
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.listen(port);