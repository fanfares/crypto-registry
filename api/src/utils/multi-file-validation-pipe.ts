import { BadRequestException, PipeTransform } from '@nestjs/common';

export class MultiFileValidationPipe implements PipeTransform {
  transform(files: { [fieldname: string]: Express.Multer.File }) {
    for (const field in files) {
      const file = files[field][0];
      if (file.size > 100000) {
        throw new BadRequestException('File size is too large:' + file.size + ' (max 10000)');
      }
    }
    return files;
  }
}
