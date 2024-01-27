import { TimelineAction, TimelineRow } from '@xzdarcy/react-timeline-editor';
import { additionalDataType } from '../../pages/editor';

export const TimeFrame: React.FC<{ action: TimelineAction; row: TimelineRow, data:additionalDataType }> = ({action, row, data}) => {
    return ( 
        <div key={row.id} className="flex flex-row items-center cursor-pointer border h-full">
            <img src={data.img} alt={action.id} className="object-cover object-center w-full h-full" />
        </div>
    );
};