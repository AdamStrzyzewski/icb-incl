const express = require("express");
const fs = require("fs").promises;
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:8080",
    methods: ["GET", "POST"],
  },
});
const cors = require("cors");

app.use(express.static(__dirname + "/fe"));
app.use(cors({}));

server.listen(process.env.PORT || 3000, function () {
  console.log("Server running in port 3000");
});

const getPath = (folder) => `${__dirname}/snippets/${folder}`;

const getFileList = async (folder) => {
  let list;
  try {
    list = await fs.readdir(getPath(folder));
    const promiseArr = list.map(
      async (filename) =>
        new Promise(async (resolve) => {
          const stats = await fs.stat(`${getPath(folder)}/${filename}`);
          const isFolder = stats.isDirectory();
          let path = filename;
          if (isFolder) {
            path = `${folder}/${filename}`;
          }

          resolve({
            name: filename,
            isFolder,
            path,
          });
        })
    );
    return Promise.all(promiseArr);
  } catch (e) {
    return [];
  }
};

const getLastNonTakenIndex = async (folder) => {
  const fileList = await getFileList(folder);

  return (
    parseInt(
      fileList
        .map((el) => {
          const n = parseInt(el.name, 10);
          const isNaN = Number.isNaN(n);
          return isNaN ? 0 : n;
        })
        .sort((a, b) => b - a)
        .shift() ?? "0",
      10
    ) + 1
  );
};

const createSnippetFolder = async (folder) => {
  const folderPath = getPath(folder);
  try {
    await fs.access(folderPath);
  } catch (e) {
    await fs.mkdir(folderPath, { recursive: true });
  }
};

const saveFile = async (folder, stringToSave, nameSuffix) => {
  const lastNonTakenIndex = await getLastNonTakenIndex(folder);
  const folderPath = getPath(folder);
  return fs.writeFile(
    `${folderPath}/${lastNonTakenIndex}${
      nameSuffix ? `-${nameSuffix.split(" ").join("-")}` : ""
    }`,
    stringToSave
  );
};

const saveSnippet = async ({ snippet, folder }) => {
  const snippetName =
    snippet.split(/\n/).shift().split("//")?.[1]?.trim() || null;
  await createSnippetFolder(folder);
  const stringToSave = snippet;

  await saveFile(folder, stringToSave, snippetName);
};

const getSnippet = async ({ snippet, folder }) => {
  try {
    const data = await fs.readFile(`${getPath(folder)}/${snippet}`);
    return data.toString();
  } catch (e) {
    return e.toString();
  }
};

const sendFileList = async (broadcast, folder) => {
  const fileList = await getFileList(folder);
  broadcast("fileList", fileList);
};

const deleteFile = async ({ folder, snippet }) => {
  await fs.rm(`${getPath(folder)}/${snippet}`);
};

io.sockets.on("connection", (client) => {
  const broadcast = (event, data) => {
    client.emit(event, data);
  };

  const { folder } = client.handshake.query;
  sendFileList(broadcast, folder);

  client.on("saveSnippet", async ({ snippet, folder }) => {
    await saveSnippet({ snippet, folder });
    await sendFileList(broadcast, folder);
  });

  client.on("loadSnippet", async ({ snippet, folder }) => {
    const data = await getSnippet({ snippet, folder });
    broadcast("loadSnippet", data);
  });

  client.on("loadSnippets", ({ folder }) => {
    sendFileList(broadcast, folder);
  });

  client.on("deleteSnippet", async ({ folder, snippet }) => {
    await deleteFile({ folder, snippet });
    sendFileList(broadcast, folder);
  });
});
