const getToWrite = (toPrint) => {
  const toWrite = [];
  if (!Array.isArray(toPrint)) {
    toPrint = [toPrint];
  }

  toPrint.forEach((loggedArg) => {
    try {
      if (Number.isNaN(loggedArg)) {
        loggedArg = "NaN";
      }
      toWrite.push(`${JSON.stringify(loggedArg, censor(loggedArg), 4)}`);
    } catch (e) {
      toWrite.push(e.toString());
    }
  });
  return toWrite.join("\n");
};

const printTo = (idResult, ...toPrint) => {
  const snippet = document.getElementById(idResult);
  if (snippet) {
    // append to an existing result (due to timers or async code)
    const editor = ace.edit(idResult);
    editor.setValue(editor.getValue() + `\n${getToWrite(toPrint)}`, -1);
  } else {
    // create a fresh snippet result box
    createAndAppendHtmlResultContainer(idResult, toPrint);
    createReadableACE(idResult);
  }
};

const evalSnippet = (snippet) => {
  const idResult = `code-result-${Math.floor(Math.random() * 100000)}`;
  try {
    // to produce an empty result box
    printTo(idResult);
    const result = Function(`
        ${snippet
          .replace(/console\.log\(/g, `printTo('${idResult}',`)
          .replace(/log\((.*)\)/g, `printTo('${idResult}',$1)`)};
        `)();

    return { result };
  } catch (e) {
    printTo(idResult, e.toString());
  }
};
