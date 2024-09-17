// comfy.controller.ts
import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ComfyService } from './comfy.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('comfy')
export class ComfyController {
  constructor(
    private readonly comfyService: ComfyService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post('generate')
  async generateImage(@Body() data: any, @Headers() headers: Record<string, string>) {
    try {
      // เรียก service เพื่อสร้างรูปภาพ
      const response = await this.comfyService.generateImage(data, headers);
      
      // รอให้ ComfyUI ประมวลผลเสร็จ
      const result = await this.comfyService.waitForCompletion(response.prompt_id);
      
      // ดึงประวัติและดาวน์โหลดภาพ
      const images = await this.comfyService.getGeneratedImages(response.prompt_id);
      
      return { prompt_id: response.prompt_id, images };
    } catch (error) {
      console.error('Error generating image:', error.response?.data || error.message);
      throw new Error('Failed to generate image');
    }
  }
}
