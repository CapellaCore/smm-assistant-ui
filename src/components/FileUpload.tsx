import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  IconButton,
  Image,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tooltip
} from '@chakra-ui/react';
import { 
  AttachmentIcon, 
  CloseIcon, 
  CheckIcon,
  DownloadIcon 
} from '@chakra-ui/icons';
import { FileUploadService } from '../services/fileUpload';
import type { 
  FileUploadProgress, 
  UploadResponse 
} from '../services/fileUpload';

interface FileUploadProps {
  onFileUploaded: (uploadResponse: UploadResponse, file: File) => void;
  isDisabled?: boolean;
  maxFiles?: number;
}

interface FileUploadState {
  file: File;
  progress: number;
  isUploading: boolean;
  isComplete: boolean;
  error?: string;
  uploadResponse?: UploadResponse;
  preview?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  isDisabled = false,
  maxFiles = 5 
}) => {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const generatePreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (uploads.length + selectedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed. Please remove some files first.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newUploads: FileUploadState[] = [];

    for (const file of selectedFiles) {
      const validation = FileUploadService.validateFile(file);
      
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${validation.error}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        continue;
      }

      const preview = await generatePreview(file);
      
      newUploads.push({
        file,
        progress: 0,
        isUploading: false,
        isComplete: false,
        preview
      });
    }

    setUploads(prev => [...prev, ...newUploads]);
    setIsModalOpen(true);
  }, [uploads.length, maxFiles, toast, generatePreview]);

  const uploadFile = useCallback(async (index: number) => {
    const upload = uploads[index];
    if (!upload || upload.isUploading || upload.isComplete) return;

    setUploads(prev => prev.map((item, i) => 
      i === index ? { ...item, isUploading: true, error: undefined } : item
    ));

    try {
      const onProgress = (progress: FileUploadProgress) => {
        setUploads(prev => prev.map((item, i) => 
          i === index ? { ...item, progress: progress.percentage } : item
        ));
      };

      const response = await FileUploadService.uploadFile(upload.file, onProgress);
      
      setUploads(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          isUploading: false, 
          isComplete: true, 
          uploadResponse: response,
          progress: 100 
        } : item
      ));

      onFileUploaded(response, upload.file);

      toast({
        title: 'Upload successful',
        description: `${upload.file.name} has been uploaded successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      setUploads(prev => prev.map((item, i) => 
        i === index ? { 
          ...item, 
          isUploading: false, 
          error: errorMessage,
          progress: 0 
        } : item
      ));

      toast({
        title: 'Upload failed',
        description: `${upload.file.name}: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [uploads, onFileUploaded, toast]);

  const removeFile = useCallback((index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  }, []);

  const uploadAllFiles = useCallback(async () => {
    const pendingUploads = uploads
      .map((upload, index) => ({ upload, index }))
      .filter(({ upload }) => !upload.isUploading && !upload.isComplete && !upload.error);

    for (const { index } of pendingUploads) {
      await uploadFile(index);
    }
  }, [uploads, uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const triggerFileSelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const closeModal = useCallback(() => {
    // Only close if no uploads are in progress
    const hasActiveUploads = uploads.some(upload => upload.isUploading);
    if (!hasActiveUploads) {
      setIsModalOpen(false);
      setUploads([]);
    }
  }, [uploads]);

  const pendingUploads = uploads.filter(upload => !upload.isComplete && !upload.error);
  const completedUploads = uploads.filter(upload => upload.isComplete);
  const hasActiveUploads = uploads.some(upload => upload.isUploading);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      <Tooltip label="Attach files" placement="top">
        <IconButton
          aria-label="Attach files"
          icon={<AttachmentIcon />}
          size="sm"
          variant="ghost"
          colorScheme="gray"
          onClick={triggerFileSelect}
          isDisabled={isDisabled}
          _hover={{ bg: 'gray.100' }}
        />
      </Tooltip>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        size="lg"
        closeOnOverlayClick={!hasActiveUploads}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Upload</ModalHeader>
          <ModalCloseButton isDisabled={hasActiveUploads} />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              {/* Drop Zone */}
              <Box
                p={8}
                border="2px dashed"
                borderColor={isDragOver ? 'blue.300' : 'gray.300'}
                borderRadius="md"
                bg={isDragOver ? 'blue.50' : 'gray.50'}
                textAlign="center"
                cursor="pointer"
                transition="all 0.2s"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <AttachmentIcon boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="lg" fontWeight="medium" color="gray.600">
                  Drop files here or click to browse
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Maximum {maxFiles} files, up to 10MB each
                </Text>
              </Box>

              {/* File List */}
              {uploads.length > 0 && (
                <VStack spacing={3} align="stretch">
                  {uploads.map((upload, index) => (
                    <Box
                      key={index}
                      p={3}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                    >
                      <Flex align="center" justify="space-between">
                        <HStack spacing={3} flex={1}>
                          {upload.preview ? (
                            <Image
                              src={upload.preview}
                              alt="Preview"
                              boxSize="40px"
                              objectFit="cover"
                              borderRadius="md"
                            />
                          ) : (
                            <Box
                              boxSize="40px"
                              bg="gray.100"
                              borderRadius="md"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              fontSize="lg"
                            >
                              {FileUploadService.getFileIcon(upload.file.name)}
                            </Box>
                          )}
                          
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                              {upload.file.name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {FileUploadService.formatFileSize(upload.file.size)}
                            </Text>
                          </VStack>
                        </HStack>

                        <HStack spacing={2}>
                          {upload.isComplete && (
                            <>
                              <CheckIcon color="green.500" boxSize={4} />
                              {upload.uploadResponse?.publicUrl && (
                                <Tooltip label="Download">
                                  <IconButton
                                    aria-label="Download"
                                    icon={<DownloadIcon />}
                                    size="xs"
                                    variant="ghost"
                                    as="a"
                                    href={upload.uploadResponse.publicUrl}
                                    target="_blank"
                                  />
                                </Tooltip>
                              )}
                            </>
                          )}
                          
                          {!upload.isUploading && !upload.isComplete && (
                            <IconButton
                              aria-label="Remove file"
                              icon={<CloseIcon />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeFile(index)}
                            />
                          )}
                        </HStack>
                      </Flex>

                      {upload.isUploading && (
                        <Progress
                          value={upload.progress}
                          size="sm"
                          colorScheme="blue"
                          mt={2}
                        />
                      )}

                      {upload.error && (
                        <Alert status="error" size="sm" mt={2}>
                          <AlertIcon />
                          <AlertDescription fontSize="xs">
                            {upload.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}

              {/* Action Buttons */}
              {uploads.length > 0 && (
                <HStack spacing={3} justify="flex-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={closeModal}
                    isDisabled={hasActiveUploads}
                  >
                    {completedUploads.length > 0 ? 'Done' : 'Cancel'}
                  </Button>
                  
                  {pendingUploads.length > 0 && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={uploadAllFiles}
                      isLoading={hasActiveUploads}
                      loadingText="Uploading..."
                    >
                      Upload {pendingUploads.length} file{pendingUploads.length > 1 ? 's' : ''}
                    </Button>
                  )}
                </HStack>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileUpload; 