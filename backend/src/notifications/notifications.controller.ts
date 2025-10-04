import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    console.log('🔔 User requested GET /notifications endpoint');
    return this.notificationsService.findAllByUser(req.user.id, page, limit);
  }

  @Get('unread')
  async getUnreadNotifications(@Request() req) {
    console.log('🔔 User requested GET /notifications/unread endpoint');
    return this.notificationsService.findUnreadByUser(req.user.id);
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    console.log('🔔 User requested GET /notifications/unread/count endpoint');
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    console.log(`🔔 User requested PATCH /notifications/${id}/read endpoint`);
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    console.log('🔔 User requested PATCH /notifications/read-all endpoint');
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Request() req) {
    console.log(`🔔 User requested DELETE /notifications/${id} endpoint`);
    await this.notificationsService.delete(id, req.user.id);
    return { message: 'Notification deleted' };
  }

  @Delete()
  async deleteAllNotifications(@Request() req) {
    console.log('🔔 User requested DELETE /notifications endpoint');
    await this.notificationsService.deleteAll(req.user.id);
    return { message: 'All notifications deleted' };
  }
}
