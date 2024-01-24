import { TimelineAction, TimelineRow } from '@xzdarcy/react-timeline-editor';

export const TimeFrame: React.FC<{ action: TimelineAction; row: TimelineRow }> = ({action, row}) => {
    return ( 
        <div key={row.id} className="flex flex-row items-center cursor-pointer">
            <div> 
                {action.id}: {(action.end - action.start).toFixed(1)}s
            </div>
        </div>
    );
};