import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.app'
import { PostsModule } from './posts/posts.module'
import { APP_FILTER } from '@nestjs/core'
import { AllExceptionsFilter } from './AllExceptionsFilter'

@Module({
	imports: [AuthModule, UsersModule, PostsModule],
	providers: [
		{
			provide: APP_FILTER,
			useClass: AllExceptionsFilter,
		},
	],
})
export class AppModule {}
