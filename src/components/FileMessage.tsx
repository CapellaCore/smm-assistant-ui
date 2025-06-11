import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Image,
  Tooltip,
} from '@chakra-ui/react';
import { ExternalLinkIcon, DownloadIcon } from '@chakra-ui/icons';
import { FileUploadService } from '../services/fileUpload';
import type { UploadResponse } from '../services/fileUpload';

interface FileMessageProps {
  uploadResponse: UploadResponse;
  fileName: string;
  fileSize?: number;
  isUser: boolean;
}

const FileMessage: React.FC<FileMessageProps> = ({ 
  uploadResponse, 
  fileName, 
  fileSize,
  isUser 
}) => {
  const isImage = fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
  const isVideo = fileName.toLowerCase().match(/\.(mp4|avi|mov|wmv|webm)$/);
  
  const handleDownload = () => {
    window.open(uploadResponse.publicUrl, '_blank');
  };

  const renderFilePreview = () => {
    if (isImage) {
      return (
        <Image
          src={uploadResponse.publicUrl}
          alt={fileName}
          maxW="300px"
          maxH="200px"
          objectFit="cover"
          borderRadius="md"
          cursor="pointer"
          onClick={() => window.open(uploadResponse.publicUrl, '_blank')}
          _hover={{ opacity: 0.8 }}
        />
      );
    }

    if (isVideo) {
      return (
        <Box
          maxW="300px"
          borderRadius="md"
          overflow="hidden"
        >
          <video
            controls
            style={{ width: '100%', maxHeight: '200px' }}
            preload="metadata"
          >
            <source src={uploadResponse.publicUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      );
    }

    // For other file types, show a file icon and details
    return (
      <Box
        p={3}
        border="1px solid"
        borderColor={isUser ? 'blue.200' : 'gray.200'}
        borderRadius="md"
        bg={isUser ? 'blue.50' : 'gray.50'}
        maxW="300px"
      >
        <HStack spacing={3}>
          <Box
            boxSize="40px"
            bg={isUser ? 'blue.100' : 'gray.100'}
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="lg"
          >
            {FileUploadService.getFileIcon(fileName)}
          </Box>
          
          <VStack align="start" spacing={1} flex={1}>
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              noOfLines={1}
              color={isUser ? 'blue.800' : 'gray.800'}
            >
              {fileName}
            </Text>
            {fileSize && (
              <Text fontSize="xs" color={isUser ? 'blue.600' : 'gray.600'}>
                {FileUploadService.formatFileSize(fileSize)}
              </Text>
            )}
          </VStack>
          
          <VStack spacing={1}>
            <Tooltip label="Open in new tab">
              <IconButton
                aria-label="Open file"
                icon={<ExternalLinkIcon />}
                size="xs"
                variant="ghost"
                colorScheme={isUser ? 'blue' : 'gray'}
                onClick={() => window.open(uploadResponse.publicUrl, '_blank')}
              />
            </Tooltip>
            
            <Tooltip label="Download">
              <IconButton
                aria-label="Download file"
                icon={<DownloadIcon />}
                size="xs"
                variant="ghost"
                colorScheme={isUser ? 'blue' : 'gray'}
                onClick={handleDownload}
              />
            </Tooltip>
          </VStack>
        </HStack>
      </Box>
    );
  };

  return (
    <Box>
      {renderFilePreview()}
      
      {uploadResponse.uploadTime && (
        <Text 
          fontSize="xs" 
          color={isUser ? 'blue.300' : 'gray.400'} 
          mt={1}
        >
          Uploaded {new Date(uploadResponse.uploadTime).toLocaleString()}
        </Text>
      )}
    </Box>
  );
};

export default FileMessage; 