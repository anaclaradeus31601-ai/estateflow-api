import { BadRequestException, Injectable } from '@nestjs/common';
import { VisitStatus } from '@prisma/client';
import { CreateVisitDto } from '../dto/create-visit.dto';
import { UpdateVisitDto } from '../dto/update-visit.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class VisitAdminService {
  constructor(private prisma: PrismaService, private notification: NotificationService) { }

  async create(createVisitDto: CreateVisitDto) {
    const visitExists = await this.prisma.visit.findFirst({
      where: {
        scheduledAt: createVisitDto.scheduledAt,
        realtorId: createVisitDto.realtorId,
        clientId: createVisitDto.clientId,
        propertyId: createVisitDto.propertyId,
      },
    });

    if (visitExists) {
      throw new EntityAlreadyExistsException('Visita já agendada');
    }

    const createdVisit = await this.prisma.visit.create({
      data: createVisitDto,
    });

    const property = await this.prisma.property.findUnique({
      where: { id: createdVisit.propertyId },
      select: { title: true },
    });

    const visitNotification = {
      type: 'VISIT_CREATED',
      title: 'Nova visita agendada',
      message: `Uma visita para o imóvel ${property?.title ?? createdVisit.propertyId} foi agendada para ${new Date(createdVisit.scheduledAt).toLocaleString('pt-BR')}.`,
      data: {
        visitId: createdVisit.id,
        propertyId: createdVisit.propertyId,
        status: createdVisit.status,
      },
    };

    await this.notification.notifyUsers(
      [createdVisit.clientId, createdVisit.realtorId],
      visitNotification,
    );
    await this.notification.notifyAdmins(visitNotification);

    return createdVisit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto) {
    const visitExists = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!visitExists) {
      throw new EntityNotFoundException('Visita', id);
    }

    const updateEntries = Object.entries(updateVisitDto).filter(
      ([, value]) => value !== undefined,
    );

    if (updateEntries.length === 0) {
      throw new BadRequestException('Nenhum dado foi enviado para atualizar a visita');
    }

    const isOnlyStatusUpdate =
      updateEntries.length === 1 && updateEntries[0][0] === 'status';

    if (
      isOnlyStatusUpdate &&
      updateVisitDto.status &&
      updateVisitDto.status === visitExists.status
    ) {
      throw new BadRequestException(
        `A visita já está com o status ${visitExists.status}`,
      );
    }

    const shouldNotifyCancellation = visitExists.status !== VisitStatus.CANCELLED && updateVisitDto.status === VisitStatus.CANCELLED;

    const updatedVisit = await this.prisma.visit.update({
      where: { id },
      data: {
        ...updateVisitDto,
        scheduledAt: updateVisitDto.scheduledAt
          ? new Date(updateVisitDto.scheduledAt)
          : undefined,
      },
    });

    if (shouldNotifyCancellation) {
      const propertyName =
        (
          await this.prisma.property.findUnique({
            where: { id: visitExists.propertyId },
            select: { title: true },
          })
        )?.title || 'desconhecido';

      const formattedDate = new Date(visitExists.scheduledAt).toLocaleString('pt-BR');

      const visitNotification = {
        type: 'VISIT_CANCELLED',
        title: 'Visita cancelada',
        message: `A visita do imóvel ${propertyName} para o dia ${formattedDate} foi cancelada.`,
        data: {
          propertyId: visitExists.propertyId,
          visitId: visitExists.id,
        },
      };

      try {
        await this.notification.sendNotification({
          userId: visitExists.clientId,
          ...visitNotification,
        });
      } catch {
        // A visita já foi cancelada; falha de notificação não deve desfazer a operação.
      }

      try {
        await this.notification.sendNotification({
          userId: visitExists.realtorId,
          ...visitNotification,
        });
      } catch {
        // A visita já foi cancelada; falha de notificação não deve desfazer a operação.
      }
    }

    const shouldNotifyCompletion =
      visitExists.status !== VisitStatus.COMPLETED &&
      updateVisitDto.status === VisitStatus.COMPLETED;

    if (shouldNotifyCompletion) {
      const propertyName =
        (
          await this.prisma.property.findUnique({
            where: { id: visitExists.propertyId },
            select: { title: true },
          })
        )?.title || 'desconhecido';

      const visitNotification = {
        type: 'VISIT_COMPLETED',
        title: 'Visita concluída',
        message: `A visita do imóvel ${propertyName} foi concluída.`,
        data: {
          propertyId: visitExists.propertyId,
          visitId: visitExists.id,
        },
      };

      await this.notification.notifyUsers(
        [visitExists.clientId, visitExists.realtorId],
        visitNotification,
      );
      await this.notification.notifyAdmins(visitNotification);
    }

    const shouldNotifyNoShow =
      visitExists.status !== VisitStatus.NO_SHOW &&
      updateVisitDto.status === VisitStatus.NO_SHOW;

    if (shouldNotifyNoShow) {
      const propertyName =
        (
          await this.prisma.property.findUnique({
            where: { id: visitExists.propertyId },
            select: { title: true },
          })
        )?.title || 'desconhecido';

      const visitNotification = {
        type: 'VISIT_NO_SHOW',
        title: 'Ausência registrada na visita',
        message: `A visita do imóvel ${propertyName} foi marcada como ausência.`,
        data: {
          propertyId: visitExists.propertyId,
          visitId: visitExists.id,
        },
      };

      await this.notification.notifyUsers(
        [visitExists.clientId, visitExists.realtorId],
        visitNotification,
      );
      await this.notification.notifyAdmins(visitNotification);
    }

    return updatedVisit;
  }

  async remove(id: string) {
    const visitExists = await this.prisma.visit.findUnique({
      where: { id },
    });

    if (!visitExists) {
      throw new EntityNotFoundException('Visita', id);
    }

    return this.prisma.visit.delete({
      where: { id },
    });
  }
}
