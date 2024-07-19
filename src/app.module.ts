import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.app'

@Module({
	imports: [AuthModule],
})
export class AppModule {}
