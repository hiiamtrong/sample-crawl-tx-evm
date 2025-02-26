import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN } from 'src/firebase/firebase.constant';
import { FirebaseAuthervice } from 'src/firebase/firebase-auth.service';
import { AppConfigService } from 'src/shared/configs/config.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: FIREBASE_ADMIN,
      useFactory: (config: AppConfigService) => {
        const serviceAccount = config.firebase.serviceAccountPath;
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      },
      inject: [AppConfigService],
    },
    FirebaseAuthervice,
  ],
  exports: [FIREBASE_ADMIN, FirebaseAuthervice],
})
export class FirebaseModule {}
