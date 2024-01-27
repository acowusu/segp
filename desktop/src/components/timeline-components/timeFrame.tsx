import React from "react";
import { TimelineAction, TimelineRow } from "@xzdarcy/react-timeline-editor";
import { additionalDataType } from "../../pages/editor";
import { Slider } from "../ui/slider";
import { MediaStoreContext } from "../../contexts/media";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../ui/context-menu";

interface TimeFrameProps {
  action: TimelineAction;
  row: TimelineRow;
  data: additionalDataType;
  deleteItem: (id: string, rowid: string) => void;
  setToReplace: (
    action: { rowid: string; action: TimelineAction } | null,
  ) => void;
  toReplace: { rowid: string; action: TimelineAction } | null;
}

export const TimeFrame: React.FC<TimeFrameProps> = ({
  action,
  row,
  data,
  deleteItem,
  setToReplace,
  toReplace,
}) => {
  const mediaStore = React.useContext(MediaStoreContext);
  const [brightness, setBrightness] = React.useState([0]);

  const handleBrightnessChange = (brightness: number[]) => {
    setBrightness(brightness);
    console.log(mediaStore.get(action.id));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          key={row.id}
          className={`flex cursor-pointer flex-row items-center border ${toReplace && toReplace.action.id === action.id ? "border-2 border-blue-400" : "border-white"} h-full hover:opacity-[80%]`}
        >
          <img
            src={data.img}
            alt={action.id}
            className="h-full w-full object-cover object-center"
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => deleteItem(action.id, row.id)}>
          Delete
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            if (toReplace && toReplace.action.id === action.id) {
              setToReplace(null);
            } else {
              setToReplace({ rowid: row.id, action: action });
            }
          }}
        >
          {toReplace && toReplace.action.id === action.id
            ? "Deselect"
            : "Replace"}
        </ContextMenuItem>
        <ContextMenuItem>Set Animation</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Move Layers</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Layer 1</ContextMenuItem>
            <ContextMenuItem>Layer 2</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Add Effects</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuSub>
              <ContextMenuSubTrigger>Brightness</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuItem>
                  <Slider
                    value={brightness}
                    min={-255}
                    max={255}
                    step={1}
                    onValueChange={handleBrightnessChange}
                  />
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem>Layer 2</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};
