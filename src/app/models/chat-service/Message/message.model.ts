export interface MessageDto {
  messageId: string;
  chatId: string;
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

export class MessageStatus {
  static Sent: string = 'Sent'; // Message sent by the sender but not yet delivered
  static Delivered: string = 'Delivered'; // Message delivered to the recipient's device
  static Seen: string = 'Seen'; // Message seen/read by the recipient
  static Failed: string = 'Failed'; // Message failed to send/deliver
  static Pending: string = 'Pending'; // Message waiting to be sent or processed
  static Acknowledged: string = 'Acknowledged'; // Message acknowledged by the server/recipient
  static Deleted: string = 'Deleted'; // Message deleted by sender/recipient
  static Archived: string = 'Archived'; // Message archived and out of active view
  static Expired: string = 'Expired'; // Message has expired and is no longer valid
}
