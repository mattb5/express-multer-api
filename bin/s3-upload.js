'use strict';

require('dotenv').config();

const uploader = require('../lib/aws-s3-upload.js');

const fs = require('fs');
const crypto = require ('crypto');

const mongoose = require('../app/middleware/mongoose');
const Upload = require ('../app/models/upload.js');

const fileType = require('file-type');
const AWS = require('aws-sdk');

const s3 = new AWS.S3(
  {
    credentials: {
        accessKeyId : process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWX_SECRET_ACCESS_KEY,
    },
  }
);

let filename = process.argv[2] || '';
let comment = process.argv[3] || 'No comment';



//so this has the object on the right overwrite the thing on the left.
//if the filetype on the right is returned, (for instance, if it returns ext: 'png' and mime 'image/png')
//it will overwrite the default object on the left
// const mimeType = (data) => {
//   return Object.assign({
//     ext: 'bin',
//     mime: 'application/octet-stream',
//   },fileType(data));  //this on the right gets pushed into the thing on the left
// };
//
// const randomHexString = (length) =>{
//   return new Promise((resolve, reject) => {
//       crypto.randomBytes(length, (error, buffer) => {
//         if (error) {
//           reject(error);
//         }
//
//         resolve(buffer.toString('hex'));
//       });
//   });
// };
//

//
// const awsUpload = (file) => {
//   return randomHexString(16)
//   .then((filename) => {
//     let dir = new Date().toISOString().split('T')[0];
//     return {
//       ACL : 'public-read',
//       Body : file.data,
//       Bucket : "matt-wdi-boston-bucket",
//       ContentType :  file.mime,
//       Key : `${dir}/${filename}.${file.ext}`,
//   };
//   })
//   .then((options) => {
//   return new Promise((resolve, reject) => {
//     s3.upload(options, (error, data ) =>  {
//       if (error) {
//           reject(error);
//         }
//
//         resolve(data);
//       });
//     });
//   });
// };

//
//
const readFile = (filename) => {
  return new Promise ((resolve, reject) =>{
    fs.readFile(filename, (error, data) =>{
      if (error) {
        reject(error);
      }

      resolve(data);
      });
  });
};


readFile(filename)
.then(uploader.prepareFile)
.then(uploader.awsUpload)
.then((response) => {
  let upload = {
    location: response.Location,
    comment: comment, //not defined yet
  };

  return Upload.create(upload);

})
// .then((data) => console.log(`${filename} is ${data.length} bytes long`))
.then(console.log) //this console logs wahtever the last .then returned
.catch(console.error)
.then(() => mongoose.connection.close());
