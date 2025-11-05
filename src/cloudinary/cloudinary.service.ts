import { BadRequestException, Injectable } from '@nestjs/common';
import {v2 as cloudinary, UploadApiResponse} from 'cloudinary'

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
    
    async uploadFile(file: Express.Multer.File,folder: string): Promise<UploadApiResponse> {

        if(!file) {
            throw new BadRequestException('No file uploaded')
        }
        if(!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file mimetype allowed mimetypes: ${this.allowedMimeTypes.join(', ')}`)
        }
        return new Promise((resolve,reject) => {
            const upload= cloudinary.uploader.upload_stream({folder},(error,result) => {
                if(error) return reject(error)
                    
                if(!result) {
                    return reject(new Error('Upload result is undefined'))
                }
                resolve(result)    
            })
            upload.end(file.buffer)
        }) 
    } 
    async deleteFile(publicId: string) {
        await cloudinary.uploader.destroy(publicId)
    }
}
