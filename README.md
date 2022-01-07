# Easy B

Easy B is a simple tool to manage files uploaded to the BSV blockchain using the [b](https://github.com/unwriter/B)
protocol. It can be used as a CLI tool or as a libary inside nodejs.

## CLI

### Download a file

By default easy-b writes the content of the file to the standard output:

``` bash
easy-b read 2cfc649249aa845af21009d7bf8fe6f75f375f87e692ea7d92c3b3ac3d6583cb > my-audio.mp3
```

You can also specify an output file:

``` bash
easy-b read 2cfc649249aa845af21009d7bf8fe6f75f375f87e692ea7d92c3b3ac3d6583cb --output=my-audio.mp3
```

If you instead specify a directory easy-b is going to try to deduce te name of the file using the metadata of the B upload.

``` bash
easy-b read 2cfc649249aa845af21009d7bf8fe6f75f375f87e692ea7d92c3b3ac3d6583cb --output=~/Downloads
ls ~/Downloads # sample-3s.mp3
```

### Publish a file

In order to publish a file it's necesary to provide a private key with funds in WIF format. There are 2 ways to specify the key, using an env variable or as an option in the cli

``` bash 
export PURSE_WIF=<key>
easy-b publish path/to/file.png 
```

or

``` bash
easy-b --purse=<key> publish path/to/file.png 
```

### Specifying network

Easy-b works with mainnet and testnet.

``` bash
easy-b publish ./my-image.png --network=test
```

## Using inside nodejs

Publish:

``` js
const { BFile, publish, networks } = require('@runonbitcoin/easy-b') 

const purse = process.env.PURSE_WIF

const main = async () => {
  const bFile = await BFile.fromFilePath('/home/migue/Pictures/dragon.png')
  const txid = await publish(bFile, networks.MAINNET, purse)
  console.log(txid)
}

main()
```

Read:

``` js
const { BFile, publish, networks } = require('@runonbitcoin/easy-b') 

const purse = process.env.PURSE_WIF

const main = async () => {
  const bFile = await BFile.fromFilePath('/home/migue/Pictures/dragon.png')
  const txid = await publish(bFile, networks.MAINNET, purse)
  console.log(txid)

}

main()
```