import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

describe('NotificationsService ownership', () => {
  const updateMany = jest.fn();

  const prisma = {
    notification: {
      updateMany,
    },
  } as unknown as PrismaService;

  const service = new NotificationsService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks a notification read only when it belongs to the user', async () => {
    updateMany.mockResolvedValue({ count: 1 });

    await service.markRead('n1', 'u1');

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      data: { readAt: expect.any(Date) as unknown as Date },
    });
  });

  it('rejects a notification owned by another user', async () => {
    updateMany.mockResolvedValue({ count: 0 });

    await expect(service.markRead('n1', 'u2')).rejects.toThrow(
      NotFoundException,
    );
  });
});
