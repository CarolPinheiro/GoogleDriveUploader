const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
});

const drive = google.drive({ version: "v3", auth });

const fileMetadata = {
    name: "Alguma coisa22",
    mimeType: "application/vnd.google-apps.document",
    parents: ["1_4MmElWjydbS95zD3EBqLtwjrv28M0sj"], // Replace <folder-id> with the ID of the folder you want to store the file in
};

drive.files
    .create({
        resource: fileMetadata,
        fields: "id",
        media: {
            mimeType: "text/plain",
            body: `
            Random greeting

            Random Text


            Heeeey
            `,
        },
    })
    .then((res) => {
        console.log(`File created with ID: ${res.data.id}`);
    })
    .catch((err) => {
        console.error(`Error creating file: ${err}`);
    });
