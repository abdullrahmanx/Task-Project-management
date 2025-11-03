  import { Module } from '@nestjs/common';
  import { CloudinaryService } from './cloudinary.service';
  import { CloudinaryConfig } from './cloudinary.provider';

  @Module({
    providers: [CloudinaryService,CloudinaryConfig],
    exports: [CloudinaryService]
  })
  export class CloudinaryModule {}
