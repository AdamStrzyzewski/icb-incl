let folder = localStorage.getItem("folder") ?? "snippet-folder";

// user actions
const saveSnippet = (editor) => {
  const snippet = editor.getValue();
  socket.emit("saveSnippet", { folder, snippet });
};

function loadSnippet() {
  socket.emit("loadSnippet", {
    snippet: this.dataset.snippet,
    folder,
  });
}

function deleteSnippet(e) {
  e.stopPropagation();
  socket.emit("deleteSnippet", {
    snippet: this.dataset.snippet,
    folder,
  });
}

// folderActions
const folderMove = function () {
  folderSelector.value = folder;
  localStorage.setItem("folder", folder);
  socket.emit("loadSnippets", { folder });
};

const folderChange = function () {
  folder = this.dataset.snippet;
  folderMove();
};

const folderKeyup = function () {
  folder = this.value;
  folderMove();
};

const initSocket = () => {
  const socket = io.connect("localhost:3000", {
    query: `folder=${folder}`,
  });

  folderSelector.value = folder;

  folderSelector.addEventListener("keyup", folderKeyup);

  // server handling
  socket.on("loadSnippet", (result) => {
    editor.session.setValue(result);
    runSnippet(editor);
  });

  socket.on("fileList", (data) => {
    const fragment = document.createDocumentFragment();
    data
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
      .forEach((file) => {
        const fileHTML = createFileHtml(file);
        fragment.appendChild(fileHTML);
      });
    // reset file list
    snippetList.innerHTML = "";
    snippetList.appendChild(fragment);
  });

  return socket;
};
