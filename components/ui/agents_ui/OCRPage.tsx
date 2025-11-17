'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  File, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Upload,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';

type ParserType = 'pdf' | 'docx' | 'excel' | 'image' | null;

interface ParserOption {
  id: ParserType;
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  supportedFormats: string[];
  color: string;
}

const parserOptions: ParserOption[] = [
  {
    id: 'pdf',
    name: 'PDF Parser',
    description: 'Extract text, tables, and structured data from PDF documents. Supports multi-page documents and complex layouts.',
    icon: FileText,
    supportedFormats: ['.pdf'],
    color: 'bg-red-500/10 text-red-400 border-red-500/20'
  },
  {
    id: 'docx',
    name: 'DOCX Parser',
    description: 'Parse Microsoft Word documents (.docx) with support for formatting, tables, and embedded content.',
    icon: File,
    supportedFormats: ['.docx', '.doc'],
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  },
  {
    id: 'excel',
    name: 'Excel/CSV Parser',
    description: 'Extract data from Excel spreadsheets and CSV files. Supports formulas, multiple sheets, and data validation.',
    icon: FileSpreadsheet,
    supportedFormats: ['.xlsx', '.xls', '.csv'],
    color: 'bg-green-500/10 text-green-400 border-green-500/20'
  },
  {
    id: 'image',
    name: 'Image Parser',
    description: 'OCR capabilities for images. Extract text from scanned documents, photos, and screenshots using advanced OCR technology.',
    icon: ImageIcon,
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }
];

export default function OCRPage() {
  const [selectedParser, setSelectedParser] = useState<ParserType>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!selectedParser) {
      alert('Please select a parser type first');
      return;
    }

    // Validate file type based on selected parser
    const parser = parserOptions.find(p => p.id === selectedParser);
    if (parser) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!parser.supportedFormats.includes(fileExtension)) {
        alert(`This file type is not supported for ${parser.name}. Supported formats: ${parser.supportedFormats.join(', ')}`);
        return;
      }
    }

    setUploadedFile(file);
    setProcessingResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!uploadedFile || !selectedParser) return;

    setIsProcessing(true);
    setProcessingResult(null);

    // Simulate processing
    setTimeout(() => {
      setProcessingResult(`Successfully processed ${uploadedFile.name} using ${parserOptions.find(p => p.id === selectedParser)?.name}. This is a demo - actual processing would extract and return the parsed content.`);
      setIsProcessing(false);
    }, 2000);
  };

  const handleReset = () => {
    setSelectedParser(null);
    setUploadedFile(null);
    setProcessingResult(null);
    setIsProcessing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 bg-black min-h-screen"
    >
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">OCR & Document Parser</h2>
        <p className="text-white/60">
          Choose a parser type and upload your document to extract text and structured data.
        </p>
      </div>

      {/* Parser Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {parserOptions.map((parser) => {
          const IconComponent = parser.icon;
          const isSelected = selectedParser === parser.id;

          return (
            <motion.div
              key={parser.id}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`bg-black/30 border-white/15 backdrop-blur-sm cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-purple-500/50 bg-purple-500/10'
                    : 'hover:bg-black/50'
                }`}
                onClick={() => {
                  setSelectedParser(parser.id);
                  setUploadedFile(null);
                  setProcessingResult(null);
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-black/30 border border-white/15 flex items-center justify-center ${
                      isSelected ? 'bg-purple-500/20 border-purple-500/30' : ''
                    }`}>
                      <IconComponent className={`w-6 h-6 ${isSelected ? 'text-purple-400' : 'text-white/70'}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg">{parser.name}</CardTitle>
                      {isSelected && (
                        <Badge className={`mt-1 ${parser.color}`}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-white/70 text-sm">
                    {parser.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {parser.supportedFormats.map((format, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-white/5 border-white/10 text-white/70"
                      >
                        {format}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* File Upload Section */}
      <AnimatePresence mode="wait">
        {selectedParser && (
          <motion.div
            key={selectedParser}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-black/30 border-white/15 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload Document</CardTitle>
                <CardDescription className="text-white/70">
                  Select or drag and drop your file to process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!uploadedFile ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                      dragActive
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/70 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-white/50 text-sm mb-4">
                      Supported formats:{' '}
                      {parserOptions
                        .find(p => p.id === selectedParser)
                        ?.supportedFormats.join(', ')}
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept={parserOptions
                        .find(p => p.id === selectedParser)
                        ?.supportedFormats.join(',')}
                      onChange={handleFileInput}
                    />
                    <Button
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="bg-purple-600 hover:bg-purple-500 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-white/15">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                          {selectedParser === 'pdf' && <FileText className="w-5 h-5 text-purple-400" />}
                          {selectedParser === 'docx' && <File className="w-5 h-5 text-blue-400" />}
                          {selectedParser === 'excel' && <FileSpreadsheet className="w-5 h-5 text-green-400" />}
                          {selectedParser === 'image' && <ImageIcon className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{uploadedFile.name}</p>
                          <p className="text-white/50 text-sm">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedFile(null);
                          setProcessingResult(null);
                        }}
                        className="text-white/40 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleProcess}
                        disabled={isProcessing}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Process Document
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        className="bg-black/30 border-white/15 text-white hover:bg-white/10"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {processingResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-green-400 text-sm">{processingResult}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section */}
      {!selectedParser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-black/30 border border-white/15 rounded-lg"
        >
          <p className="text-white/70 text-center">
            Select a parser type above to get started with document processing
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

