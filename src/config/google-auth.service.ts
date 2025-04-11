import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleAuthService {
    private readonly config: {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        scope: string[];
    };

    constructor() {
        this.config = {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/user/auth/google/callback',
            scope: [
                'email',
                'profile',
            ],
        };
    }

    getConfig() {
        return this.config;
    }
}