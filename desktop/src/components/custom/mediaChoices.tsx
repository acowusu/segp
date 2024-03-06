"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { ImageData } from "../../../electron/mockData/data"


export function MediaChoices({prompts, callback}: {prompts: ImageData[], callback: (name: string)=>void}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(prompts[0]?.prompt)

  React.useEffect(() => {
    if (prompts.length > 0) setValue(prompts[0]?.prompt)
  }, [prompts])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-wrap"

        >
          {value
            ? value
            : "Find an image"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search Prompt..." />
          <CommandEmpty>No Image prompts.</CommandEmpty>
          <CommandGroup>
            {prompts.map((prompt) => (
              <CommandItem
                key={prompt.prompt}
                value={prompt.prompt}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  callback(currentValue)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === prompt.prompt.toLowerCase() ? "opacity-100" : "opacity-0"
                  )}
                />
                {prompt.prompt}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
