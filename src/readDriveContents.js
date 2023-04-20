const { google } = require("googleapis");
const fs = require("fs");
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const drive = google.drive({ version: "v3", auth });

async function getFileContents(fileId) {
    const res = await drive.files.export({ fileId, mimeType: "text/plain" });
    return res.data.substring(1).replaceAll(" ", "");
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
