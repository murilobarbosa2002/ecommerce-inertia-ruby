export interface FlashData {
  notice?: string;
  alert?: string;
}

export interface SharedProps {
  flash: FlashData;
}
