import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CommonService } from './common.service';
import { DeleteImageDTO } from './dto/delete-image.dto';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes()
  postImageAsTemp(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
    };
  }

  @Delete('image')
  async deleteImage(@Body() body: DeleteImageDTO) {
    return await this.commonService.deleteImage(body);
  }
}
