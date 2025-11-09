import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { CommonModule } from 'src/common/common.module';


@Module({
  providers: [FilesService],
  controllers: [FilesController],
  imports: [CommonModule],
  exports: [ FilesService ]
})
export class FilesModule { }
