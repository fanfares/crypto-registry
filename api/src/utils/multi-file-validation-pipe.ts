import { BadRequestException, PipeTransform } from '@nestjs/common';

export class MultiFileValidationPipe implements PipeTransform {
  transform(files: { [fieldname: string]: Express.Multer.File }) {
    for (const field in files) {
      const file = files[field][0];
      if (file.size > 10000) {
        throw new BadRequestException('File size is too large:' + file.size + ' (max 10000)');
      }
      if (file.mimetype !== 'text/csv') {
        // todo - on firefox, file type is xl/csv
        throw new BadRequestException('Invalid file type:' + file.mimetype );
      }
    }
    return files;
  }
}
