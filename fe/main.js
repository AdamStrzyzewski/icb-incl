let folder = localStorage.getItem("folder") ?? "snippet-folder";
const socket = io.connect("localhost:3000", {
  query: `folder=${folder}`,
});

// UI elements
const codeConsole = document.getElementById("code-console");
const resultBox = document.getElementById("result-box");
const snippetList = document.getElementById("snippet-list");
const folderSelector = document.getElementById("folder-selector");

const getHuman = (t) => {
  const ms = parseInt(t);
  return `${ms}ms`;
};

const createReadableACE = (id) => {
  const editor = ace.edit(id, {
    maxLines: Infinity,
    minLines: 5,
    fontSize: "1em",
    readOnly: true,
    highlightActiveLine: false,
    highlightGutterLine: false,
    printMargin: false,
    selectionStyle: "line",
    behavioursEnabled: true,
    wrapBehavioursEnabled: true,
    autoScrollEditorIntoView: true,
    wrap: true,
  });
  editor.setTheme("ace/theme/cobalt");
  editor.session.setMode("ace/mode/javascript");
  editor.renderer.$cursorLayer.element.style.display = "none";
  editor.renderer.setShowGutter(false);
};

const scrollElemToBottom = (el) => {
  el.scrollTop = el.scrollHeight;
};

const printTo = (toPrint, snippet, t = null) => {
  const exampleContainer = document.createElement("div");
  exampleContainer.classList.add("code-example");

  const resultContainer = document.createElement("pre");
  resultContainer.classList.add("code-example__result");

  const snippetContainer = document.createElement("pre");
  snippetContainer.classList.add("code-example__snippet");
  snippetContainer.classList.add("language-js");
  snippetContainer.innerHTML = snippet;

  // exampleContainer.appendChild(snippetContainer);
  exampleContainer.appendChild(resultContainer);

  // credit https://stackoverflow.com/users/789569/logan
  function censor(censor) {
    var i = 0;

    return function (key, value) {
      if (typeof val === "function") {
        return val.toString();
      }

      if (
        i !== 0 &&
        typeof censor === "object" &&
        typeof value === "object" &&
        censor === value
      ) {
        return "[Circular]";
      }

      if (i >= 29) {
        return "[Unknown]";
      }

      ++i;

      return value;
    };
  }

  const toWrite = [];
  toPrint.forEach((loggedArgs) => {
    try {
      loggedArgs.forEach((arg) => {
        toWrite.push(`${JSON.stringify(arg, censor(arg), 4)}`);
      });
    } catch (e) {
      toWrite.push(e.toString());
    }
  });
  resultContainer.innerHTML = toWrite.join("\n");

  resultBox.prepend(exampleContainer);

  // const id = `code-snippet-${Math.floor(Math.random() * 100000)}`;
  // snippetContainer.id = id;
  // createReadableACE(id);

  const idResult = `code-result-${Math.floor(Math.random() * 100000)}`;
  resultContainer.id = idResult;
  createReadableACE(idResult);

  if (t !== null) {
    const timer = document.createElement("span");
    timer.classList.add("timer");
    timer.innerHTML = getHuman(t);
    resultContainer.appendChild(timer);
  }
};

const editor = ace.edit("code-console", {
  maxLines: Infinity,
  minLines: 50,
  fontSize: "1em",
});

editor.setTheme("ace/theme/cobalt");
editor.session.setMode("ace/mode/javascript");

const evalSnippet = (snippet) => {
  let t = Date.now();
  try {
    const result = Function(`
      const toPrint = [];
      const addToPush = (...args) => {
        toPrint.push(args);
      };
      ${snippet
        .replace(/console\.log\(/g, "addToPush(")
        .replace(/log\((.*)\)/g, "addToPush($1)")};
      // TODO: handle setTimeouts etc
      return toPrint;`)();

    t = Date.now() - t;
    return { result, t };
  } catch (e) {
    t = Date.now() - t;
    return { result: [[e.toString()]], t };
  }
};

const runSnippet = (editor) => {
  const snippet = editor.getValue();
  const { result: toPrint, t } = evalSnippet(snippet) ?? { result: [], t };
  printTo(toPrint, snippet, t);
};

// snippet saving handling
const saveSnippet = (editor) => {
  const snippet = editor.getValue();
  // TODO: change folder to dynamically updated
  socket.emit("saveSnippet", { folder, snippet });
};

function loadSnippet() {
  socket.emit("loadSnippet", {
    snippet: this.dataset.snippet,
    folder,
  });
}

const folderKeyup = function () {
  folder = this.value;
  folderMove();
};

const folderChange = function () {
  folder = this.dataset.snippet;
  folderMove();
};

const folderMove = function () {
  folderSelector.value = folder;
  localStorage.setItem("folder", folder);
  socket.emit("loadSnippets", { folder });
};

function deleteSnippet(e) {
  e.stopPropagation();
  socket.emit("deleteSnippet", {
    snippet: this.dataset.snippet,
    folder,
  });
}

socket.on("loadSnippet", (result) => {
  editor.session.setValue(result);
  runSnippet(editor);
});

socket.on("fileList", (data) => {
  const fragment = document.createDocumentFragment();
  data
    .sort((a, b) => parseInt(b.name) - parseInt(a.name))
    .forEach((file) => {
      const listItem = document.createElement("li");
      listItem.classList.add("snippet-list__item");
      const name = document.createElement("span");
      name.innerHTML = file.name;

      if (!file.isFolder) {
        const deleteIcon = document.createElement("span");
        deleteIcon.classList.add("delete-icon");
        deleteIcon.dataset.snippet = file.name;
        listItem.appendChild(deleteIcon);
        deleteIcon.addEventListener("click", deleteSnippet);
      }
      listItem.appendChild(name);
      listItem.dataset.snippet = !file.isFolder ? file.name : file.path;
      if (file.isFolder) {
        listItem.addEventListener("click", folderChange);
      } else {
        listItem.addEventListener("click", loadSnippet);
      }
      fragment.appendChild(listItem);
    });
  snippetList.innerHTML = "";
  snippetList.appendChild(fragment);
});

folderSelector.value = folder;

folderSelector.addEventListener("keyup", folderKeyup);

// NOTE: dev - for testing
// socket.emit("loadSnippet", {
//   snippet: "1-get random int",
//   folder,
// });

editor.commands.addCommand({
  name: "saveSnippet",
  bindKey: { win: "Ctrl-S", mac: "Command-S" },
  exec: saveSnippet,
});

editor.commands.addCommand({
  name: "runSnippet",
  bindKey: { win: "Shift-Enter", mac: "Command-Enter" },
  exec: runSnippet,
});

editor.commands.addCommand({
  name: "overwriteSnippetRun",
  bindKey: { win: "Ctrl-R", mac: "Command-R" },
  exec: runSnippet,
});
