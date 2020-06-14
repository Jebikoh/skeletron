import {Message} from 'discord.js';
import {deleteTimer} from '../config.json';

export function deleteMessage(
  messages: Message | Message[],
  timer: number = deleteTimer
) {
  if (messages instanceof Array) {
    for (const message of messages) {
      message.delete({timeout: timer});
    }
  } else {
    messages.delete({timeout: timer});
  }
}

export function dateDifference(firstDate: number, secondDate: number) {
  const secondDiff: number = (secondDate - firstDate) / 1000;
  return secondDiff / 60 / 60 / 24;
}

export function isValidUrl(str: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}
