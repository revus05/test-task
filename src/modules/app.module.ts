import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.app'
import { PostsModule } from './posts/posts.module'
import { PostsController } from './posts/posts.controller'
import { PostsService } from './posts/posts.service'

@Module({
	imports: [AuthModule, UsersModule, PostsModule],
	controllers: [PostsController],
	providers: [PostsService],
})
export class AppModule {}
