# Cruna Listener

A tool to index events emitted by vaults, managers and plugins forked from https://github.com/superpowerlabs/event-scraper

## Installation

Install the dependencies

```sh
npm i -g pnpm pm2
pnpm i
```

Set your `.env` file using `env-template.txt` as a template

Modify `config/deployedProduction.json` with the proper contracts and addresses.

Modify `config/eventsByContract.json` with the proper events and parameters.

## Usage

### Historical events

To launch an historical scrape of the events, you must have a Moralis account and a Moralis API key in your `.env` file. You can get a key [here](https://moralis.io/).

Then you can launch

```shell
./scraper.js
```

If you want to see the possible options, launch

```shell
./scraper.js --help
```

### Monitor realtime events

In this case, you may launch

```shell
node monitor.js
```

or, better, use PM2 to manage the process, and launch

```shell
./start.sh
```

## Testing

The tests are working with SuperPower Labs contracts and events. If you modify this script, write your own tests.

## License

MIT

(c) 2023+ SuperPower Labs, Cruna

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# cruna-listener
