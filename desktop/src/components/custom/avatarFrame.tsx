export const AvatarFrame: React.FC<{ label: string; avatarUrl: string; onClick: () => void }> = ({ label, avatarUrl, onClick }) => {
    return (
      <div className='border border-black rounded-lg h-32 transform transition duration-700 ease-in-out hover:scale-105 hover:opacity-[80%] hover:border-white cursor-pointer flex flex-col items-center justify-between p-2'>
          <img src={avatarUrl} onClick={onClick} className="h-full w-full object-cover object-center mb-2" style={{ maxHeight: '100%', maxWidth: '100%' }} />
          {label}
      </div>
    );
};