import { Module } from '@nestjs/common';
import { ComfyController } from './comfy/comfy.controller';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [],
  controllers: [ComfyController],
  providers: [FirebaseService],
})
export class AppModule {}