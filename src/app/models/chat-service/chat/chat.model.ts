import { MessageDto } from '../Message/message.model';

export interface PrivateChatDto {
  chatId: string;
  username1: string;
  username2: string;
  messages: MessageDto[];
  createdAt: Date;
  lastMessageTime: Date;
  chatStatus: string;
}

export const InitializePrivateChatDto: PrivateChatDto = {
  chatId: '',
  username1: '',
  username2: '',
  messages: [],
  createdAt: new Date(Date.UTC(1900, 1, 1)),
  lastMessageTime: new Date(Date.UTC(1900, 1, 1)),
  chatStatus: '',
};
