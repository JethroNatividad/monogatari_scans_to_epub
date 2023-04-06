import puppeteer from "puppeteer"
import inquirer from 'inquirer'
import {getChapterData, saveToEpub} from './functions.js'


(async () => {
    const browser = await puppeteer.launch()
    const {chapterStart, chapterEnd} = await inquirer.prompt([
        {
            type: 'input',
            name: 'chapterStart',
            message: 'Enter chapter start',
        },
        {
            type: 'input',
            name: 'chapterEnd',
            message: 'Enter chapter end',
        }
    ])

    // show confirmation, ask user to confirm, "Selected novel: Martial Peak, Chapter range: 1-100, is this correct?"
    const {confirm} = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Download chapter range: ${chapterStart}-${chapterEnd}, is this correct?`,
        }
    ])
    
    if(!confirm) {
        console.log('Exiting...')
        return
    }

    for(let i = chapterStart; i <= chapterEnd; i++) {
        try {
            console.log(`Getting chapter ${i}...`)
            const chapter = await getChapterData({chapterNumber: i, browser})
            console.log(`Saving chapter ${i}...`)
            saveToEpub({
                title: 'Martial Peak',
                author: 'MOMO',
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
    
    await browser.close()
})()