import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class FilesService {

  constructor(
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async uploadImageToCloudinary(file: Express.Multer.File) {
    if (!file) throw new BadRequestException(`No file provided`);
    const result = await this.cloudinaryService.uploadFile(file);
    return {
      message: 'File uploaded successfully',
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async updateImage(publicId: string, newFile: Express.Multer.File) {
    if (!publicId) throw new BadRequestException('Public ID is required');
    if (!newFile) throw new BadRequestException('New file is required');

    await this.cloudinaryService.deleteFile(publicId);

    const result = await this.cloudinaryService.uploadFile(newFile);
    return {
      message: 'Image updated successfully',
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async deleteImage(publicId: string) {
    if (!publicId) throw new BadRequestException('Public ID is required');
    const result = await this.cloudinaryService.deleteFile(publicId);
    return { message: 'Image deleted successfully', result };
  }

}
