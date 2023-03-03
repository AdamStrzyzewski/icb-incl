const ACE_SETTINGS = {
  maxLines: Infinity,
  minLines: 50,
  fontSize: "1em",
};

const READABLE_ACE_SETTINGS = {
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
};

const initEditor = () => {
  const editor = ace.edit("code-console", ACE_SETTINGS);
  editor.commands.addCommand({
    name: "beautify",
    bindKey: { win: "Ctrl-Shift-F", mac: "Command-Shift-F" },
    exec: beautify,
  });

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

  editor.setTheme("ace/theme/cobalt");
  editor.session.setMode("ace/mode/javascript");
  return editor;
};

const beautify = (editor) => {
  editor.getSession().setValue(
    js_beautify(editor.getValue(), {
      indent_size: 2,
    })
  );
};

const createReadableACE = (id) => {
  const editor = ace.edit(id, READABLE_ACE_SETTINGS);
  editor.setTheme("ace/theme/cobalt");
  editor.session.setMode("ace/mode/javascript");
  editor.renderer.$cursorLayer.element.style.display = "none";
};

const runSnippet = (editor) => {
  const snippet = editor.getValue();
  evalSnippet(snippet);
};
