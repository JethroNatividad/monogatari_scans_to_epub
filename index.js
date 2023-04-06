#!/usr/bin/env node
import axios from 'axios'
import Epub from 'epub-gen'
import inquirer from 'inquirer'
import {load} from 'cheerio'

const getChapter = async (selectedNovel, chapterNumber) => {
    try {
        const { data } = await axios.get(`https://www.monogatariscansmtl.com/post/${selectedNovel.id}-${chapterNumber}`)
        const $ = load(data)
    
        // div > ._1hN1O.uyQefQ
        const mainDiv = $('div > ._1hN1O.uyQefQ')
    
        // get all spans
        const spans = mainDiv.find('span')
    
        const paragraphs = []
    
        paragraphs.push(`<h1>${selectedNovel.title} - Chapter ${chapterNumber}</h1>`)
    
        for(let i of spans) {
            // if the child is a text node
            if(i.children[0].type === 'text') {
                paragraphs.push(`<p>${i.children[0].data}</p>`)
            }
        }
    
        paragraphs.push(`<p>Source: <a href="https://www.monogatariscansmtl.com/post/${selectedNovel.id}-${chapterNumber}">monogatariscansmtl.com/post/${selectedNovel.id}-${chapterNumber}</a></p>`)
    
        // combine paragraphs into a string with new lines
        return paragraphs.join('\n')
    } catch (error) {
        console.log(error)
        throw new Error(`Error getting chapter ${chapterNumber}`)
    }
}

const saveToEpub = ({title, author, publisher, content, chapterNumber}) => {
    const fileName = title.replace(',', '_').replace(/\W+/g, '') + chapterNumber
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
    const novels = [{title: 'Martial Peak', id: 'martial-peak', author: 'MOMO'}]
    // Ask user to select a novel
    const {novel} = await inquirer.prompt([
        {
            type: 'list',
            name: 'novel',
            message: 'Select a novel',
            choices: novels.map(n => n.title),
        }
    ])

    // Ask user to select chapter range
    const {chapterRange} = await inquirer.prompt([
        {
            type: 'input',
            name: 'chapterRange',
            message: 'Enter chapter range (e.g. 1-100)',
            validate: (input) => {
                // check if input is valid, e.g. 1-100, check input is number, check start is less than end
                if(!input.match(/^[0-9]+-[0-9]+$/)) {
                    return 'Invalid chapter range'
                }
                return true
            }
        }
    ])

    // show confirmation, ask user to confirm, "Selected novel: Martial Peak, Chapter range: 1-100, is this correct?"
    const {confirm} = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Selected novel: ${novel}, Chapter range: ${chapterRange}, is this correct?`,
        }
    ])
    
    if(!confirm) {
        console.log('Exiting...')
        return
    }

    // get chapters
    const [start, end] = chapterRange.split('-').map(n => parseInt(n))

    const selectedNovel = novels.find(n => n.title === novel)
    for(let i = start; i <= end; i++) {
        try {
            console.log(`Getting chapter ${i}...`)
            const chapter = await getChapter(selectedNovel, i)
            console.log(`Saving chapter ${i}...`)
            saveToEpub({
                title: selectedNovel.title,
                author: selectedNovel.author,
                publisher: 'JET',
                content: chapter,
                chapterNumber: i
            })
            console.log(`Chapter ${i} saved!`) 
        } catch (error) {
            console.log(error)
            console.log(`Error getting chapter ${i}`)
            break;
        }
    }
}

main()
