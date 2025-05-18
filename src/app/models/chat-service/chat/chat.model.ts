import { MessageDto } from '../Message/message.model';

export interface PrivateChatDto {
  ChatId: string;
  Username1: string;
  Username2: string;
  Messages: MessageDto[];
  CreatedAt: Date;
  LastMessageTime: Date;
  ChatStatus: string;
}
