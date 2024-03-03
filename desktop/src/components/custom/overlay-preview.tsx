import React from "react";
import { MockVideo } from "./mock-video";
interface OverlayPreviewProps {
  backgroundUrl: string;
  avatarUrl: string;
  showAvatar?: boolean;
  showSubtitle?: boolean;
  subtitleStyle?: string;
}

export const OverlayPreview: React.FC<OverlayPreviewProps> = ({
  backgroundUrl,
  avatarUrl,
  showAvatar = false,
  showSubtitle = false,
  subtitleStyle = "80px sans-serif",
}) => {
  return (
    <div className="overflow-hidden rounded-md mt-4 relative   aspect-[16/9] w-full">
      <MockVideo
        backgroundUrl={backgroundUrl}
        avatarUrl={avatarUrl}
        showAvatar={showAvatar}
        showSubtitle={showSubtitle}
        subtitleStyle = {subtitleStyle}/>
      {/* <img
        src={backgroundUrl}
        alt={"background"}
        className={cn(
          "h-auto w-auto object-cover transition-all absolute bottom-0 right-0"
        )}
      />
      {showAvatar && (
        <img
          src={avatarUrl}
          alt={"avatar"}
          width={300}
          height={400}
          className={cn(
            "h-32 w-auto object-cover transition-all  absolute bottom-0 right-0"
          )}
        />
      )}

      {showSubtitle && (
        <div className="absolute bottom-5 inset-x-5 opacity-75	">
          <div className="bg-black text-white rounded-lg  p-1">
            <div className="text-sm font-bold">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Aliquam
              efficitur, magna
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};
