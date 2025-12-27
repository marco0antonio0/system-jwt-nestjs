import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { UserModel } from './models/user.model';
import { RegisterDto } from './dtos/register.dto';

interface User {
  id: string;         
  name: string;
  email: string;
  password: string;   
  role?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UserRepository {
  constructor(@InjectModel(UserModel) private readonly userModel: typeof UserModel) {}

  private mapModelToUser(model: UserModel | null): User | null {
    if (!model) return null;
    return {
      id: String(model.id),
      name: model.name,
      email: model.email,
      password: model.password,
      role: model.role,
      createdAt: model.createdAt as Date,
      updatedAt: model.updatedAt as Date,
    };
  }

  async findUser(email: string, _options: Record<string, any> = {}): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    return this.mapModelToUser(user);
  }

  async findUserByName(name: string, _options: Record<string, any> = {}): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { name } });
    return this.mapModelToUser(user);
  }

  async createUser(data: RegisterDto): Promise<User> {
    const { name, email, password } = data;

    // (Opcional) reforçar unicidade
    const existsEmail = await this.userModel.findOne({ where: { email } });
    if (existsEmail) throw new Error('Email já cadastrado');
    const existsUser = await this.userModel.findOne({ where: { name } });
    if (existsUser) throw new Error('Username já cadastrado');

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const created = await this.userModel.create({
      name,
      email,
      password: hashed,
      role: 0,
    });

    return this.mapModelToUser(created)!;
  }

  async findUserById(id: string | number): Promise<User | null> {
    const user = await this.userModel.findByPk(Number(id));
    return this.mapModelToUser(user);
  }

  async updateUserPassword(userId: string | number, newPassword: string): Promise<User> {
    const user = await this.userModel.findByPk(Number(userId));
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.update({ password: hashed });
    return this.mapModelToUser(user)!;
  }

  async updateUserRole(userId: string | number, newRole: number): Promise<User> {
    const user = await this.userModel.findByPk(Number(userId));
    if (!user) throw new NotFoundException('Usuário não encontrado');

    await user.update({ role: newRole });
    return this.mapModelToUser(user)!;
  }

}
