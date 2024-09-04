import { Controller, Post, Body, Headers, Get, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as admin from 'firebase-admin';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FirebaseService {
    async uploadImageToFirebase(imageData: Buffer, filename: string): Promise<void> {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`images/${filename}`);

        await file.save(imageData, {
            metadata: {
                contentType: 'image/png', // ปรับตามประเภทไฟล์รูปภาพของคุณ
            },
        });

        console.log(`Uploaded ${filename} to Firebase Storage`);
    }
}

@Controller('comfy')
export class ComfyController {
  private comfyApiUrl = 'http://127.0.0.1:8188';

  @Post('generate')
  async generateImage(@Body() data: any, @Headers() headers: Record<string, string>) {
    try {
      const response = await axios.post(`${this.comfyApiUrl}/prompt`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Comfy-User': headers['comfy-user'] || 'undefined',
        },
      });
      
      // รอให้ ComfyUI ประมวลผลเสร็จ
      const result = await this.waitForCompletion(response.data.prompt_id);
      
      // ดึงประวัติและดาวน์โหลดภาพ
      const images = await this.getGeneratedImages(response.data.prompt_id);
      
      return { prompt_id: response.data.prompt_id, images };
    } catch (error) {
      console.error('Error generating image:', error.response?.data || error.message);
      throw new Error('Failed to generate image');
    }
  }

  private async waitForCompletion(promptId: string): Promise<any> {
    let isCompleted = false;
    let status;
    while (!isCompleted) {
      const response = await axios.get(`${this.comfyApiUrl}/history/${promptId}`);
      status = response.data;
      isCompleted = status[promptId].status.completed;
      if (!isCompleted) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return status;
  }

  private async getGeneratedImages(promptId: string): Promise<string[]> {
    const history = await axios.get(`${this.comfyApiUrl}/history/${promptId}`);
    const output_images = [];
    
    for (const nodeId in history.data[promptId].outputs) {
      const nodeOutput = history.data[promptId].outputs[nodeId];
      if ('images' in nodeOutput) {
        for (const image of nodeOutput.images) {
          const imageData = await this.getImage(image.filename, image.subfolder, image.type);
          output_images.push(imageData);
        }
      }
    }
    
    return output_images;
  }

  private async getImage(filename: string, subfolder: string, type: string): Promise<string> {
    const imageUrl = `${this.comfyApiUrl}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/png;base64,${base64}`;
  }
}