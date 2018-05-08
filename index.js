let nedb = require('nedb')
  , mongodb = require('mongodb')
  , path = require('path')
  , fs = require('fs-extra')
  , readline = require('readline')
  , MongoClient = mongodb.MongoClient
  , args = process.argv
  , convert = (nedbpath, dbname) => {
    let url = `mongodb://localhost:27017/${dbname}`
      , count = 0
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      console.log(`Database ${dbname} created!`)
      var dbo = db.db(dbname);
      fs.readdir(path.resolve(nedbpath)).then(files => {
        files.forEach(file => {
          dbo.createCollection(file, (err, res) => {
            if (err) throw err
            var lineReader = readline.createInterface({
              input: fs.createReadStream(path.resolve(nedbpath, file))
            })
            lineReader.on('line', (line) => {
              var obj
              try {
                obj = JSON.parse(line)
                delete obj._id
              } catch (err) {
                console.error(err)
              }
              dbo.collection(file).insertOne(obj, (err, res) => {
                if (err) { console.log(err) }
                count++
                console.log(`${count} document inserted`)
              });
            })
            // db.close()
          })
        })
      }).catch(console.error)
    })
  }

let dbpath = args[args.length - 2]
let dbname = args[args.length - 1]
convert(dbpath, dbname)
