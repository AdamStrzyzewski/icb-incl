const getHuman = (t) => {
  const ms = parseInt(t);
  return `${ms}ms`;
};

const scrollElemToBottom = (el) => {
  el.scrollTop = el.scrollHeight;
};

// credit https://stackoverflow.com/users/789569/logan
function censor(censor) {
  let i = 0;

  return function (key, value) {
    if (typeof value === "function") {
      return value.toString();
    }

    if (typeof value === "undefined") {
      return "undefined";
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
