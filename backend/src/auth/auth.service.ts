// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ExcelStorageService } from './excel-storage.service';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly excelStorage: ExcelStorageService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.excelStorage.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = {
      id: uuidv4(),
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      createdAt: new Date().toISOString(),
    };

    await this.excelStorage.addUser(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Đăng ký thành công',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.excelStorage.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async getProfile(userId: string) {
    const user = await this.excelStorage.findById(userId);
    if (!user) throw new UnauthorizedException('User không tồn tại');
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  }
}