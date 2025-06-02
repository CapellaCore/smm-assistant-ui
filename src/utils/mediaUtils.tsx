export const resolveMediaType = (type?: string, url?: string): 'image' | 'video' | undefined => {
    if (type === 'video') return 'video';
    if (type === 'image') return 'image';

    // Infer from URL if no clear type
    const ext = url?.split('.').pop()?.toLowerCase();
    if (!ext) return undefined;

    if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';

    return undefined;
};

