# ThumbnailFetcher

command line tool to fetch thumbnail images based on an APIs output

## Requirements

Nodejs 18+

## Usage

In the `/dist` folder run the tool starting any command with `node index.js <command>`

```bash
Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  fetch <configpath> <setname>  Fetch thumbnail images for a configured vufind
                                query set
  check <configpath> <setname>  Check if thumbnails are missing for the
                                specified query set.
  help [command]                display help for command
```

## Configuration

```json lines
{
  "basis_archive_photos": {
    // the name of your query set
    "mdsource": {
      // source APIs configuration, providing an axios parameter array
      "baseurl": "http://host.docker.internal/resources/api/v1/search?",
      "parameters": {
        "field[]": [
          "id",
          "rawData"
        ],
        "filter[]": "ctrlnum:\"AT-OeAW-BA-3-27-P-*\"",
        "limit": 100
        // it's pagesize - the pageing parameter is assumed to be "page"
      },
      "rescountpath": "resultCount",
      "recsetpath": "records",
      "identifierpath": "id"
    },
    "imgsource": [
      //multiple image APIs descended through, untill one of them returns a valid jpeg
      {
        "baseurl": "https://opacbasis.acdh.oeaw.ac.at/wwwopac.ashx?",
        "parameters": {
          "command": "getcontent",
          "server": "images",
          "imageformat": "jpg",
          "width": 500,
          "height": 500,
          "value": "${rawData['is_hierarchy_id']}.tif"
        },
        "expectedtype": "image/jpeg"
        // the expected return MIME-type, as of now only jpeg is possible
      }
    ],
    "target": "/opt/thumbnails"
    // the target directory where downloaded imagery is to be saved
  }
}
```

## Development
Commands:

```bash
# transpile ts to js
yarn run build

# start bin/index.ts
yarn run bin

# run tests
yarn run test
```

## License
*MIT*
