// comfy.module.ts
import { Module } from '@nestjs/common';
import { ComfyController } from './comfy.controller';
import { ComfyService } from './comfy.service';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [ComfyController],
  providers: [ComfyService, FirebaseService],
})
export class ComfyModule {}
