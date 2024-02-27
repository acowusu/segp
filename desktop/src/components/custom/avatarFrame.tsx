interface AvatarFrameProps {
    isSelected: boolean;
    label: string;
    imagePath: string;
    onClick: () => void;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({ isSelected, label, imagePath, onClick }) => {
    return (
      <div className={` border ${isSelected && 'border-sky-500 '} rounded-lg transform transition duration-200 ease-in-out  hover:opacity-[80%] hover:border-sky-500 hover: hover:border-dashed cursor-pointer flex flex-col items-center justify-between p-2`}>
          <img src={imagePath} onClick={onClick} className="h-full w-full object-cover object-center mb-2  h-32 "  />
          <p className="">{label}</p>
      </div>
    );
};