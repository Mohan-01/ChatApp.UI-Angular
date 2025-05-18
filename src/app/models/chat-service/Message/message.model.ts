export interface MessageDto {
  MessageId: string;
  From: string;
  To: string;
  Time: Date;
  Text: string;
  MessageType: string;
  RepliedTo: string;
  IsEdited: boolean;
  MessageStatus: string;
}
