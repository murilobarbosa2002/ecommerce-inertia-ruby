import { Select as RadixSelect } from "radix-ui";

import ChevronDownIcon from "@/components/shared/icons/chevron-down-icon/ChevronDownIcon";

import { type SelectProps } from "./Select.types";
import { selectContent, selectItem, selectTrigger } from "./Select.variants";

export default function Select({
  value,
  onValueChange,
  options,
  placeholder,
  id,
  name,
}: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} name={name}>
      <RadixSelect.Trigger id={id} className={selectTrigger()}>
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDownIcon />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          className={selectContent()}
          position="popper"
          sideOffset={4}
        >
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={selectItem()}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
