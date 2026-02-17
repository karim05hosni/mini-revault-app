import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UsersEntity } from './users.entity';

@Injectable()
export class AuthRepository {
	private repo: Repository<UsersEntity>;

	constructor(private readonly dataSource: DataSource) {
		this.repo = this.dataSource.getRepository(UsersEntity);
	}

	async findByEmail(email: string): Promise<UsersEntity | null> {
		return this.repo.findOne({ where: { email } });
	}

	async createUser(data: Partial<UsersEntity>): Promise<UsersEntity> {
		const user = this.repo.create(data);
		return this.repo.save(user);
	}
}
