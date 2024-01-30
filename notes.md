# Notes for CS 260

## Links to Note Sections
1. [Read Me](README.md)
1. [Writing Documentation in Github](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

## Git and Github
- You can create alias and create custom commands for git
- Always try to create your projects in github first and then clone it to your computer
- Always pull changes before you push changes

### Basic Git Commands
```
git add . (Adds all changes to staged section)
git commit -m "message" (Adds all changes to git file)
git pull (pulls files from github)
git push (pushes files into github)
git status (shows currently modified files)
git branch (gets current branch)
git checkout <branch_name> (changes current branch to branch_name)
git diff HEAD HEAD~1 (compares the current head with the previous commit)
git clone <link to repository> (clones github repository)
```

## Server Information
IP Address - 35.153.188.223
SSH Command - ssh -i [key pair file] ubuntu@[ip address]

## HTML
- inside body it is seperated into 3 sections (header, main, footer)
- `<element_name>` - tags that contain elements inside of them
- html element represents top level page structure
- id attribute makes it a variable that can be referenced
- class associates it to a class that can be used in CSS
- a href="url" - element for referencing a url
- `<span>` - used to apply styles to a element (can assign class so CSS can reference)
