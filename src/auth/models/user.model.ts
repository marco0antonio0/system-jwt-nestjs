import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class UserModel extends Model<UserModel> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ allowNull: false, unique: true })
  name: string;

  @Column({ allowNull: false, unique: true })
  email: string;

  @Column({ allowNull: false })
  password: string;

  @Column({ allowNull: false, defaultValue: 0 })
  role: number;

}
