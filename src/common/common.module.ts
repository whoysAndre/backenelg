import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EncrypterService } from './services/encrypter.service';


@Module({
  providers: [CloudinaryProvider, CloudinaryService, EncrypterService],
  exports: [CloudinaryProvider, CloudinaryService, EncrypterService]
})
export class CommonModule { }
