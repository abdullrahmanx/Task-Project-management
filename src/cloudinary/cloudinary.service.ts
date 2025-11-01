import { BadRequestException, Injectable } from '@nestjs/common';
import {v2 as cloudinary} from 'cloudinary'

@Injectable()
export class CloudinaryService {
    allowedMimeTypes= [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    async uploadFile(file: Express.Multer.File,folder: string) {

        if(!file) {
            throw new BadRequestException('No file uploaded')
        }
        if(!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file mimetype allowed mimetypes: ${this.allowedMimeTypes.join(', ')}`)
        }
        return new Promise((resolve,reject) => {
            cloudinary.uploader.upload_stream({folder},(error,result) => {
                if(error) reject(error)
                if(!result) {
                    reject(new Error('Upload result is undefined'))
                }
                resolve(result)    
            })
            .end(file.buffer)
        })
    }
    async deleteFile(publicId: string) {
        await cloudinary.uploader.destroy(publicId)
    }
}
