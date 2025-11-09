import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './interfaces/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';


@Injectable()
export class CloudinaryService {

  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) return reject(error);
          if (!result) return;
          resolve(result)
        }
      )
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    })
  }

  deleteFile(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
    })
  }


}
