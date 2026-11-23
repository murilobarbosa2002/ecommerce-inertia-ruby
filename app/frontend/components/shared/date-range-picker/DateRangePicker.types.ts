export interface DateRangePickerValue {
  // yyyy-MM-dd, "" quando não escolhido.
  from: string;
  to: string;
  // HH:mm, "" quando não escolhido (vira meia-noite/23:59 na hora de
  // montar o filtro, não aqui — este componente só edita o que foi
  // digitado).
  fromTime: string;
  toTime: string;
}

export interface DateRangePickerProps extends DateRangePickerValue {
  onChange: (value: DateRangePickerValue) => void;
}
