const { google } = require("googleapis");
const cheerio = require("cheerio");
const MarkdownIt = require("markdown-it");
const TurndownService = require("turndown");

const md = new MarkdownIt();
const fs = require("fs");
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

const turndownService = new TurndownService();
let index = 0;

turndownService.addRule("700", {
    filter: ["span", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6"],
    replacement: function (content, node) {
        if (node.style.fontWeight === "700") {
            // Check if content ends with a newline character
            const endsWithLineBreak = /\n$/.test(content);

            return "**" + content + "**";
        } else if (
            node.parentNode.nodeName === "UL" &&
            node.nodeName === "LI"
        ) {
            return "* " + content + "\n";
        } else if (
            node.parentNode.nodeName === "OL" &&
            node.nodeName === "LI"
        ) {
            return `${(index += 1)}. ` + content + "\n";
        } else if (node.style.fontStyle === "italic") {
            return "_" + content + "_";
        }
        return content;
    },
});

async function getFileContents(fileId) {
    const res = await drive.files.export({ fileId, mimeType: "text/html" });

    const $ = cheerio.load(res.data);
    $("style").remove(); // remove all style tags

    return turndownService
        .turndown($.html())
        .replaceAll(/\u00a0 | U\+00a0 | \s/g, "");
}

async function listFilesInFolder(folderId) {
    const res = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: "files(id, name)",
    });
    const files = res.data.files;
    const fileData = [];
    if (files.length) {
        for (const file of files) {
            fileData.push({
                id: file.name,
                body: await getFileContents(file.id),
            });
        }
    } else {
        console.log("No files found.");
    }
    fs.writeFile(
        "output.json",
        JSON.stringify(fileData, null, 2).replace(/\\r/g, ""),
        "utf-8",
        function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("JSON file has been saved.");
        }
    );
}

listFilesInFolder("1CKDgXkajOysG3MXIiRGaqBj3N19pc64f");
