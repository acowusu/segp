import React from "react";
import etro from "etro";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/ui/tooltip";

import { PlusIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

//TODO pass in the movie?
function addAudiolayer(): void {}

function addImageLayer(): void {}

function addVideoLayer(): void {}

const AddLayerButton: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button className="idk-button-of-some-sort">
                <PlusIcon />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuLabel> Possible Layers</DropdownMenuLabel>
              <DropdownMenuItem onClick={addAudiolayer}>
                Add Audio Layer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addImageLayer}>
                Add Image Layer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={addVideoLayer}>
                Add Video Layer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent> Add Layer </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Timeline: React.FC<{ movie: etro.Movie }> = ({ movie }) => {
  return (
    <div className="timeline-window">
      <AddLayerButton />
    </div>
  );
};
