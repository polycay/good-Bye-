// comfy.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ComfyService {
  private comfyApiUrl = 'http://127.0.0.1:8188';

  async generateImage(data: any, headers: Record<string, string>): Promise<any> {
    const response = await axios.post(`${this.comfyApiUrl}/prompt`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Comfy-User': headers['comfy-user'] || 'undefined',
      },
    });
    return response.data;
  }

  async waitForCompletion(promptId: string): Promise<any> {
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

  async getGeneratedImages(promptId: string): Promise<string[]> {
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
