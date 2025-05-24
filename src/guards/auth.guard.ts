import { BadRequestException, CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { GuardsService } from './guards.service';

@Injectable()
export class AuthGuard implements CanActivate {
    @Inject(GuardsService)
    private readonly guardsService: GuardsService

    constructor() { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            let user = await this.guardsService.getUserById(payload.sub);
            if(!user) throw new UnauthorizedException('Invalid token');
             
            // Attach the user payload to the request object
            request.user = user;
            // default timezone is WAT (UTC+01:00)
            request.userTimezoneOffset = Math.round((request.headers?.timezone || -60) / 60);

            if (Math.abs(request.userTimezoneOffset) > 12)
                throw new BadRequestException("invalid timezone provided");

        } catch (e: any) {
            if (e instanceof BadRequestException) throw e;
            throw new UnauthorizedException('Invalid token');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}