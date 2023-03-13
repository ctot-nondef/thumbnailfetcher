![Test & Deploy](https://github.com/ctot-nondef/thumbnailfetcher/actions/workflows/build.yml/badge.svg) [![codecov](https://codecov.io/gh/ctot-nondef/thumbnailfetcher/branch/master/graph/badge.svg?token=M806CCGIIZ)](https://codecov.io/gh/ctot-nondef/thumbnailfetcher)

# ThumbnailFetcher

command line tool to fetch thumbnail images based on an APIs output

## Requirements

Nodejs 18+

## Usage

In the `/dist` folder run the tool starting any command with `node index.js <command>`
(you'll need to build first running `npm run build`)
Alternately you can run it through yarn or npm script `npm run bin <command>`

```
Usage: thumbnailfetcher [options] [command]

command line tool to fetch thumbnail images based on API input

Options:
  -V, --version                           output the version number
  -h, --help                              display help for command

Commands:
  fetch [options]                         Fetch thumbnail images for a configured vufind query set
  check [options] <configpath> <setname>  Check if thumbnails are missing for the specified query set.
  help [command]                          display help for command
```

## Configuration

Configuration can be either a path to a `json` file or a URL returning a `json` following this template:

```json lines
{
  "basis_archive_photos": { // the name of your query set
    "mdsource": { // source APIs configuration, providing an axios parameter array
      "baseurl": "http://host.docker.internal/resources/api/v1/search?",
      "parameters": {
        "field[]": [
          "id",
          "rawData"
        ],
        "filter[]": "ctrlnum:\"AT-OeAW-BA-3-27-P-*\"",
        "limit": 100
        // the pagesize - the pageing parameter (wich is set dynamically based on  
        // rescountpath) is assumed to be "page"
      },
      "rescountpath": "resultCount", // JSON path in the APIs response where the sets result count can be found
      "recsetpath": "records", // JSON path in the APIs response where the Array of records is returned
      "identifierpath": "id" // JSON path *within* one Item of the result list to indicate the thumbnails identifier 
    },
    "imgsource": [ //multiple image APIs descended through, until one of them returns a valid jpeg
      {
        "baseurl": "https://opacbasis.acdh.oeaw.ac.at/wwwopac.ashx?",
        "parameters": {
          "command": "getcontent",
          "server": "images",
          "imageformat": "jpg",
          "width": 500,
          "height": 500,
          "value": "${rawData['is_hierarchy_id']}.tif" //parameters can be parsed with js template syntax, properties are 
                                                       //referring to the current item processed form the array in recsetpath 
        },
        "expectedtype": "image/jpeg" // the expected return MIME-type, as of now only jpeg is possible
      }
    ],
    "target": "/opt/thumbnails" // the target directory where downloaded imagery is to be saved
  }
}
```

## Development
Commands:

```bash
# transpile ts to js
yarn run build

# include dependency folder in dist
yarn run postbuild

# start bin/index.ts
yarn run bin <command>

# run tests
yarn run test
```

## License
*MIT*
