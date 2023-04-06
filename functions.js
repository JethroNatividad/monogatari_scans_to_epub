import Epub from 'epub-gen'

export const getChapterData = async ({chapterNumber, browser}) => {
    const page = await browser.newPage()
    const url = `https://www.monogatariscansmtl.com/post/martial-peak-${chapterNumber}`
    await page.goto(url)
    const mainDiv = await page.waitForSelector('div[data-id="rich-content-viewer"]')
    // data-hook="post-title"
    const titleElement = await page.waitForSelector('h1[data-hook="post-title"]')
    const title = await titleElement.evaluate(el => el.innerHTML)
    const content = await mainDiv.evaluate(el => el.innerHTML)
    const addon = `<p>Source: <a href="${url}">${url}</a></p>`
    return `<div>${title} ${content} ${addon}}</div>`
}
export const saveToEpub = ({title, author, publisher, content, chapterNumber}) => {
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
