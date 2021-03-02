# REPT - simple repo templating

This is a super simple repo base directory templating allow to clone a git repo and process the files when creating new directory content

## Usage

`npx rept -r SOME_GIT_REPO -d DEST`

## Options
`npx rept -h`
```
Options:
      --version      Show version number                               [boolean]
  -d, --destination  destination directory                   [string] [required]
  -r, --repo         git repo to use                         [string] [required]
  -b, --branch       git repo branch                      [string] [default: ""]
  -s, --subDir       sub directory to use                 [string] [default: ""]
      --reptFile     should get template params from rept.config
                                                       [boolean] [default: true]
  -h, --help         Show help                                         [boolean]
```
