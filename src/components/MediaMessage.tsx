import React from 'react';

interface MediaMessageProps {
    declaredType?: 'image_url' | 'video_url' ;
    mediaUrl?: string;
    caption?: string;
}


const MediaMessage: React.FC<MediaMessageProps> = ({ declaredType, mediaUrl, caption }) => {

    if (!declaredType || !mediaUrl) return null;

    return (
        <div className="media-block p-2 rounded-xl bg-white shadow-md max-w-md">
            {declaredType === 'image_url' ? (
                <img src={mediaUrl} alt="media" className="rounded-xl w-full object-cover" />
            ) : (
                <video controls className="rounded-xl w-full">
                    <source src={mediaUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            {caption && <p className="text-sm text-gray-700 mt-2">{caption}</p>}
        </div>
    );
};

export default MediaMessage;
