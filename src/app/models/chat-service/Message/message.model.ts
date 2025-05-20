export interface MessageDto {
  messageId: string;
  clientId: string;
  from: string;
  to: string;
  time: Date;
  text: string;
  messageType: string;
  repliedTo: string;
  isEdited: boolean;
  messageStatus: string;
}

export interface SendMessageDto {
  chatId: string;
  from: string;
  to: string;
  time: Date;
  text: string;
  messageType: string;
  repliedTo?: string;
}

export interface ChangeMessageStatus {
  messageId: string;
  from: string;
  to: string;
  messageStatus: string;
}
