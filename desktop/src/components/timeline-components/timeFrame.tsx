import { TimelineAction, TimelineRow } from "@xzdarcy/react-timeline-editor";
import { additionalDataType } from "../../pages/editor";

export const TimeFrame: React.FC<{
  action: TimelineAction;
  row: TimelineRow;
  data: additionalDataType;
}> = ({ action, row, data }) => {
  return (
    <div
      key={row.id}
      className="flex h-full cursor-pointer flex-row items-center border"
    >
      <img
        src={data.img}
        alt={action.id}
        className="h-full w-full object-cover object-center"
      />
    </div>
  );
};
