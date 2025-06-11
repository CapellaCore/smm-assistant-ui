export const resolveMediaType = (type?: string, mediaUrl?: string): 'image' | 'video' | undefined => {
    if (type === 'video') return 'video';
    if (type === 'image') return 'image';

    // Infer from URL if type is unknown
    const ext = mediaUrl?.split('.').pop()?.toLowerCase();
    if (!ext) return undefined;

    if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';

    return undefined;
};

