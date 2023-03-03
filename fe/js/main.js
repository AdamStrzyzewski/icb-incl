// UI elements
const codeConsole = document.getElementById("code-console");
const resultBox = document.getElementById("result-box");
const snippetList = document.getElementById("snippet-list");
const folderSelector = document.getElementById("folder-selector");

const editor = initEditor();
const socket = initSocket();

// NOTE: dev - for testing
// socket.emit("loadSnippet", {
//   snippet: "1-get random int",
//   folder,
// });
