'use strict';

require('dotenv').config();

const fs = require('fs');
const crypto = require ('crypto');

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


//so this has the object on the right overwrite the thing on the left.
//if the filetype on the right is returned, (for instance, if it returns ext: 'png' and mime 'image/png')
//it will overwrite the default object on the left
const mimeType = (data) => {
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  },fileType(data));  //this on the right gets pushed into the thing on the left
};

const randomHexString = (length) =>{
  return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (error, buffer) => {
        if (error) {
          reject(error);
        }

        resolve(buffer.toString('hex'));
      });
  });
};

let filename = process.argv[2] || '';


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

const awsUpload = (file) => {
  return randomHexString(16)
  .then((filename) => {
    let dir = new Date().toISOString().split('T')[0];
    return {
      ACL : 'public-read',
      Body : file.data,
      Bucket : "matt-wdi-boston-bucket",
      ContentType :  file.mime,
      Key : `${dir}/${filename}.${file.ext}`,
  };
  })
  .then((options) => {
  return new Promise((resolve, reject) => {
    s3.upload(options, (error, data ) =>  {
      if (error) {
          reject(error);
        }

        resolve(data);
      });
    });
  });
};

readFile(filename)
.then((data) => {
  let file = mimeType(data);
  file.data = data;
  return file;
})
.then(awsUpload)
// .then((data) => console.log(`${filename} is ${data.length} bytes long`))
.then(console.log) //this console logs wahtever the last .then returned
.catch(console.error);
