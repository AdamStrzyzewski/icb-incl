# Quick snippet runner and saver

## Why?
I needed a tool for teaching a JS class, that is relatively useful, and has a feature of saving multiple snippets quickly into multiple folders that I can later share with the class in separate repos - after 3hrs we are here


## how it looks?

About something like this:

![image](https://user-images.githubusercontent.com/36886348/199022533-54d55a88-2060-4c15-ab34-f19800da109b.png)

## how to run

```
1. go to the folder, and run npm install
2. npm run start
3. go to localhost:3000
```

## UI
- bottom part is console, run a snippet with `command+enter (macos)` or `shift+enter (windows)`, or `command+R` / `ctrl+R`
- you will see a code+result with the execution time on the top
- on `command+s` or `ctrl+s` you save the snippet to the currently typed folder (top right input), default snippet-folder, does support nested paths
- when saving the snippet, it autoincrements the name, but you can also add a first line comment with a name for the snippet like so:

```
// test
const x = 5;
console.log(x);
=> 1-test
```

```
const x = 5;
console.log(x);
=> 1
```

- right hand side supports folders vs snippets, allows to delete snippets, no folder removing (for safety), if you click a folder it navigates into it, if you click a snippet you run it as if you typed it

- there's no back button in folder list because I'm lazy

## general notes
- timeout,interval function etc. don't currently work
- you can use console.log() or log() to make results appear in the result box
- this could use a major refactor - pending
- BE could use typescript - pending
- yes it looks terrible idc
- using Function constructor, so everything that entails
- might use electron to bundle as an app after a couple of downloads
- you are welcome to PR especially for styles, but I would recommend waiting a bit while this takes shape
- yes it's vanilla js, I don't see a point for a framework here

## libs used
- [ACE Editor](https://github.com/ajaxorg/ace) - for all code highlight and editing, cool stuff
- express - for hosting statics
- socket.io - for communication because it's nicer than REST

## why name tho
[I can't believe it's not console.log](https://www.youtube.com/watch?v=e33SNyaXNsk)

## what can I do with it
it's free real estate, do whatever, if you want you can credit me
