import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinaryInstance, UploadApiResponse } from 'cloudinary';
import 'multer';
import { CLOUDINARY_CLIENT } from './cloudinary.constants';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY_CLIENT)
    private readonly cloudinary: typeof cloudinaryInstance,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinary.uploader
        .upload_stream(
          {
            folder,
            filename_override: file.originalname,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result)
              return reject(new Error('Cloudinary upload returned no result'));
            return resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
