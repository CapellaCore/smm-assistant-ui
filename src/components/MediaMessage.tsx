import React from 'react';
import { resolveMediaType } from '../utils/mediaUtils.tsx';

interface MediaMessageProps {
    declaredType?: 'image' | 'video' | 'preview';
    url?: string;
    caption?: string;
}


const MediaMessage: React.FC<MediaMessageProps> = ({ declaredType, url, caption }) => {
    const type = resolveMediaType(declaredType, url);
    if (!type || !url) return null;

    return (
        <div className="media-block p-2 rounded-xl bg-white shadow-md max-w-md">
            {type === 'image' ? (
                <img src={url} alt="media" className="rounded-xl w-full object-cover" />
            ) : (
                <video controls className="rounded-xl w-full">
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}
            {caption && <p className="text-sm text-gray-700 mt-2">{caption}</p>}
        </div>
    );
};

export default MediaMessage;
