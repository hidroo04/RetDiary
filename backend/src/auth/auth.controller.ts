import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface DosenPayload {
  id: string;
  email: string;
  nama: string;
}

@ApiTags('Auth')
@Controller('api/admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // FR-11, FR-12
  @Post('login')
  @ApiOperation({ summary: 'Login dosen' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // FR-13A
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout dosen (invalidasi token di sisi client)' })
  logout() {
    return this.authService.logout();
  }

  // FR-13, FR-13B
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard summary dosen' })
  dashboard(@CurrentUser() user: DosenPayload) {
    return this.authService.getDashboard(user.id);
  }
}
