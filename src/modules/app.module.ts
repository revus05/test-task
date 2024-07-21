import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.app'
import { PostsModule } from './posts/posts.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
	imports: [
		CacheModule.register({
			ttl: 10,
			max: 1024,
			isGlobal: true,
		}),
		AuthModule,
		UsersModule,
		PostsModule,
	],
})
export class AppModule {}
