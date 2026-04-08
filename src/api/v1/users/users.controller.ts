import {
  Post,
  Body,
  Get,
  Req,
  Patch,
  Param,
  UsePipes,
  UseGuards,
  Controller,
  ValidationPipe,
  Delete,
  ParseIntPipe,
  Query,
  Headers,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UserFilterDto } from './dto/user-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({
  path: 'users',
  version: '1',
})
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get('')
  async findAll(@Query() filter: UserFilterDto) {
    return await this.usersService.findAll(filter);
  }

  // Endpoint de registro público (sin UseGuards temporalmente)
  @Post('register')
  async register(
    @Body() userData: CreateUserDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.usersService.create(userData, tenantId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user')
  async getProfile(@Req() req) {
    return await this.usersService.findById(req.user['userId']);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: number) {
    return this.usersService.toggleStatus(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/change-password')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return await this.usersService.changePassword(id, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.usersService.remove(+id);
  }
}
