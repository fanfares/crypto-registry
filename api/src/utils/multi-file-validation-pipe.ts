import { BadRequestException, PipeTransform } from '@nestjs/common';

export class MultiFileValidationPipe implements PipeTransform {
  transform(files: { [fieldname: string]: Express.Multer.File }) {
    for (const field in files) {
      const file = files[field][0];
      if (file.size > 10000) {
        throw new BadRequestException('File size is too large');
      }
      if (file.mimetype !== 'text/csv') {
        throw new BadRequestException('Invalid file type');
      }
    }
    return files;
  }
}
