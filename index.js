#!/usr/bin/env node
import axios from 'axios'
import {load} from 'cheerio'
import Epub from 'epub-gen'

const getChapter = async (chapterNumber) => {
    const { data } = await axios.get(`https://www.monogatariscansmtl.com/post/martial-peak-${chapterNumber}`)
    const $ = load(data)

    // div > ._1hN1O.uyQefQ
    const mainDiv = $('div > ._1hN1O.uyQefQ')

    // get all spans
    const spans = mainDiv.find('span')

    const paragraphs = []

    paragraphs.push(`<h1>Martial Peak - Chapter ${chapterNumber}</h1>`)

    for(let i of spans) {
        // if the child is a text node
        if(i.children[0].type === 'text') {
            paragraphs.push(`<p>${i.children[0].data}</p>`)
        }
    }

    paragraphs.push(`<p>Source: <a href="https://www.monogatariscansmtl.com/post/martial-peak-${chapterNumber}">monogatariscansmtl.com/post/martial-peak-${chapterNumber}</a></p>`)

    // combine paragraphs into a string with new lines
    return paragraphs.join('\n')
}

const saveToEpub = ({title, author, publisher, content}) => {
    const fileName = title.replace(',', '_').replace(/\W+/g, '')
    const option = {
        title: title, // *Required, title of the book.
        author: author, // *Required, name of the author.
        publisher: publisher, // optional
        cover: '',
        content: [
            {
                data: content
            }

        ]
    }

    new Epub(option, `./bin/${fileName}.epub`)
}

const main = async () => {
    const chapterNumber = 5000
    const chapter = await getChapter(chapterNumber)
    saveToEpub({title: `MartialPeak-${chapterNumber}`, author: 'MOMO', publisher: 'JET', content: chapter})
}

main()
