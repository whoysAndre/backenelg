import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { EncrypterService } from './services/encrypter.service';
import { PdfService } from './services/pdf.service';


@Module({
  providers: [CloudinaryProvider, CloudinaryService, EncrypterService, PdfService],
  exports: [CloudinaryProvider, CloudinaryService, EncrypterService, PdfService]
})
export class CommonModule { }
