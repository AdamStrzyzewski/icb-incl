const createFileHtml = (file) => {
  const fileListItem = document.createElement("li");
  fileListItem.classList.add("snippet-list__item");
  const name = document.createElement("span");
  name.innerHTML = file.name;

  if (!file.isFolder) {
    const deleteIcon = document.createElement("span");
    deleteIcon.classList.add("delete-icon");
    deleteIcon.dataset.snippet = file.name;
    fileListItem.appendChild(deleteIcon);
    deleteIcon.addEventListener("click", deleteSnippet);
  }
  fileListItem.appendChild(name);
  fileListItem.dataset.snippet = !file.isFolder ? file.name : file.path;
  if (file.isFolder) {
    fileListItem.addEventListener("click", folderChange);
  } else {
    fileListItem.addEventListener("click", loadSnippet);
  }
  return fileListItem;
};

const createAndAppendHtmlResultContainer = (idResult, toPrint) => {
  const exampleContainer = document.createElement("div");
  exampleContainer.classList.add("code-example");

  const resultContainer = document.createElement("pre");
  resultContainer.classList.add("code-example__result");

  exampleContainer.appendChild(resultContainer);

  resultContainer.innerHTML = getToWrite(toPrint);

  resultContainer.id = idResult;

  resultBox.prepend(exampleContainer);
};
