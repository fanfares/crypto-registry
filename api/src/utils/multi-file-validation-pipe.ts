import { BadRequestException, PipeTransform } from '@nestjs/common';
import { formatBytes } from './format-bytes';

export class MultiFileValidationPipe implements PipeTransform {
  transform(files: { [fieldname: string]: Express.Multer.File }) {
    for (const field in files) {
      const file = files[field][0];
      const max = 10 * 1024 * 1024;
      if (file.size > max) {
        throw new BadRequestException('File size is too large: ' + formatBytes(file.size) + ` (max ${formatBytes(max)})}` );
      }
    }
    return files;
  }
}
