import { Controller, Get, Inject, Res, Query, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { GoogleAuthService } from '../config/google-auth.service';
import axios from 'axios';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guard';

@Controller('user')
export class UserController {

    @Inject(GoogleAuthService)
    private readonly googleAuthService: GoogleAuthService

    @Inject(UserService)
    private readonly userService: UserService


    @Get('auth/google')
    async initiateGoogleAuth(@Res() res: Response) {
        const state = Math.random().toString(36).substring(7);
        const googleAuthConfig = this.googleAuthService.getConfig();

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
            client_id: googleAuthConfig.clientID,
            redirect_uri: googleAuthConfig.callbackURL,
            response_type: 'code',
            scope: googleAuthConfig.scope.join(' '),
            state,
            access_type: 'offline',
            prompt: 'consent'
        }).toString()}`;

        return res.json({ url: googleAuthUrl });
    }

    @Get('auth/google/callback')
    async handleGoogleCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Res() res: Response
    ) {
        try {
            const googleAuthConfig = this.googleAuthService.getConfig();
            
            // Exchange authorization code for tokens
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                code,
                client_id: googleAuthConfig.clientID,
                client_secret: googleAuthConfig.clientSecret,
                redirect_uri: googleAuthConfig.callbackURL,
                grant_type: 'authorization_code',
            });

            const { access_token } = tokenResponse.data;

            // Fetch user profile information
            const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${access_token}` },
            });

            const userProfile: {
                email: string
                name: string
                given_name: string
                family_name: string
                picture: string
            } = userInfoResponse.data;

            let user = await this.userService.findByEmail(userProfile.email);

            if (!user) {
                // create user
                user = await this.userService.createUser({
                    email: userProfile.email,
                    firstName: userProfile.given_name,
                    lastName: userProfile.family_name,
                    profilePicture: userProfile.picture,
                    signUpMethod: "google"
                })
            }

            // create jwt for user and redirect to FE
            let token = this.userService.generateToken(user);

            // redirect to FE with token as query param
            return res.redirect(`${process.env.FRONTEND_URL}/authSuccess?token=${token}`);

        } catch (error) {
            throw new UnauthorizedException('Failed to authenticate with Google');
        }
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    async getProfile(@Req() req: Request & { user: any }) {
        const user = req.user;
        return {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            signUpMethod: user.signUpMethod
        };
    }
}
