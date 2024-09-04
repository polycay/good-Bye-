import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

require('dotenv').config();

const firebaseKeyPath = process.env.FIREBASE_KEY_PATH || '';

if (!firebaseKeyPath) {
  throw new Error('FIREBASE_KEY_PATH is not defined');
}

const serviceAccount = require(firebaseKeyPath);


@Injectable()
export class FirebaseService {
  constructor() {
    const serviceAccount = require('../../firebase-key.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'database-genmage.appspot.com',
      });
    }
  }

  async uploadImage(file: Buffer, filename: string): Promise<string> {
    const bucket = admin.storage().bucket();
    const fileUpload = bucket.file(filename);
    
    await fileUpload.save(file);
    
    return fileUpload.publicUrl();
  }

  async getImages(): Promise<string[]> {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles();
    return files.map(file => file.publicUrl());
  }
}