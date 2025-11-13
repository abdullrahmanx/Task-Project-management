import { BadRequestException, Injectable } from '@nestjs/common';
import {v2 as cloudinary} from 'cloudinary'
import * as path from 'path';

@Injectable()
export class CloudinaryService {
    private readonly allowedMimeTypes= [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
     private readonly allowedExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
        '.pdf',
        '.doc',
        '.docx'
    ] 

    private readonly mimeToExtMap= {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }

    private readonly MAX_IMAGE_SIZE= 5 * 1024 * 1024
    private readonly MAX_DOCUMENT_SIZE= 10 * 1024 * 1024
    
    async uploadFile(file: Express.Multer.File, folder: string) {

       if(!file) {
        throw new BadRequestException('No file uploaded')
       }

       if (!file.buffer || file.size === 0) {
            throw new BadRequestException('File is empty');
       }

       if(!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file mimetype allowed mimetypes:
                ${this.allowedMimeTypes.join(',')}`)
       }

       const fileExt= path.extname(file.originalname).toLowerCase()
       if(!this.allowedExtensions.includes(fileExt)) {
        throw new BadRequestException(`Invalid file extension. Allowed extensions:
            ${this.allowedExtensions.join(', ')}`)
       }
       
       const expectedExtensions= this.mimeToExtMap[file.mimetype]
       if(!expectedExtensions?.includes(fileExt)) {
        throw new BadRequestException('File extension does not match file type - possible spoofing detected');
       }

       const isImage= file.mimetype.startsWith('image/')
       const maxSize= isImage ? this.MAX_IMAGE_SIZE : this.MAX_DOCUMENT_SIZE
       
       if(file.size > maxSize) {
        throw new BadRequestException(`File too large. Maximum size: ${maxSize / 1024 / 1024} MB`)
       }
       
      const resourceType= isImage ? 'image' : 'raw'

      return new Promise((resolve,reject) => {
        cloudinary.uploader.upload_stream({folder,resource_type: resourceType}, (error,result) => {
            if (error) return reject(new BadRequestException('Error uploading file'));
            resolve(result)
        })
        .end(file.buffer)
      })
    }  
    async deleteFile(publicId: string,resourceType: 'image' | 'raw' = 'image') {
        try {
         const result= await cloudinary.uploader.destroy(publicId,{resource_type: resourceType})
         if(result.result !== 'ok') {
            throw new Error('File deletion failed');
         }
        }catch(err) {
            throw new BadRequestException('Error deleting file');
        }     
    }
}

