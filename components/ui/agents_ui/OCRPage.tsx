'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AnimatePresence } from 'framer-motion';
import { 
  FileText, File, FileSpreadsheet, Image as ImageIcon, 
  Upload, X, Loader2, AlertCircle, 
  Server, Cloud, FileOutput
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Switch } from '@/components/ui/shadcn/switch';
import { toast } from 'sonner';

// ... [Keep your existing ParserOption interface and array here] ...
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
    { id: 'pdf', name: 'PDF Parser', description: 'LlamaParse for complex PDFs.', icon: FileText, supportedFormats: ['.pdf'], color: 'bg-red-500/10 text-red-400' },
    { id: 'docx', name: 'DOCX Parser', description: 'Standard Word extraction.', icon: File, supportedFormats: ['.docx'], color: 'bg-blue-500/10 text-blue-400' },
    { id: 'excel', name: 'Excel Parser', description: 'Structured spreadsheet data.', icon: FileSpreadsheet, supportedFormats: ['.xlsx', '.csv'], color: 'bg-green-500/10 text-green-400' },
    { id: 'image', name: 'Image Analysis', description: 'Gemini Vision processing.', icon: ImageIcon, supportedFormats: ['.png', '.jpg', '.jpeg'], color: 'bg-purple-500/10 text-purple-400' }
];

export default function OCRPage() {
  const { getToken } = useAuth();
  const [selectedParser, setSelectedParser] = useState<ParserType>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // States for process flow
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'complete' | 'error'>('idle');
  const [parsedContent, setParsedContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const [useAWS, setUseAWS] = useState(false); 

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setStatus('idle');
    setParsedContent("");
    setError(null);
  };

  const handleUploadAndParse = async () => {
    if (!uploadedFile || !selectedParser) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const backendUrl = 'https://cortex-l8hf.onrender.com';

      // --- STEP 1: UPLOAD ---
      setStatus('uploading');
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadRes = await fetch(`${backendUrl}/api/v1/object-storage/upload?use_s3=${useAWS}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const objectName = uploadData.object_name;

      // --- STEP 2: PARSE ---
      setStatus('parsing');
      
      const parseRes = await fetch(`${backendUrl}/api/v1/ocr/parse`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ object_name: objectName }),
      });

      if (!parseRes.ok) throw new Error("Parsing failed");
      const parseData = await parseRes.json();

      setParsedContent(parseData.content);
      setStatus('complete');
      toast.success("Document processed successfully!");

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Processing failed");
      setStatus('error');
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen text-white">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">AI Document Intelligence</h2>
          <p className="text-white/60">Upload, Extract, and Analyze using LlamaParse & Gemini.</p>
        </div>
        {/* Toggle Switch */}
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/10">
          <div className={`flex items-center gap-2 text-sm ${!useAWS ? 'text-purple-400 font-bold' : 'text-white/50'}`}>
            <Server className="w-4 h-4" /> <span>MinIO</span>
          </div>
          <Switch checked={useAWS} onCheckedChange={setUseAWS} className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-purple-600"/>
          <div className={`flex items-center gap-2 text-sm ${useAWS ? 'text-orange-400 font-bold' : 'text-white/50'}`}>
            <Cloud className="w-4 h-4" /> <span>AWS S3</span>
          </div>
        </div>
      </div>

      {/* Parser Selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {parserOptions.map((parser) => (
          <Card 
            key={parser.id}
            className={`bg-black/30 border-white/15 cursor-pointer transition-all ${selectedParser === parser.id ? 'ring-2 ring-purple-500 bg-purple-500/10' : 'hover:bg-black/50'}`}
            onClick={() => handleFileSelect && setSelectedParser(parser.id)}
          >
            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${parser.color.split(' ')[0]}`}>
                        <parser.icon className={`w-5 h-5 ${parser.color.split(' ')[1]}`} />
                    </div>
                    <CardTitle className="text-base">{parser.name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent><p className="text-xs text-white/60">{parser.description}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Upload & Results Area */}
      <AnimatePresence mode="wait">
        {selectedParser && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT: Upload Card */}
            <Card className="bg-black/30 border-white/15">
              <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {!uploadedFile ? (
                   <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:bg-white/5 transition cursor-pointer relative">
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                      <Upload className="w-10 h-10 mx-auto mb-2 text-white/40" />
                      <p className="text-sm text-white/70">Click to browse</p>
                   </div>
                ) : (
                   <div className="flex justify-between items-center p-4 bg-white/5 rounded border border-white/10">
                      <div className="flex items-center gap-3">
                          <FileText className="text-purple-400" />
                          <span className="font-medium">{uploadedFile.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)} disabled={status === 'parsing' || status === 'uploading'}><X className="w-4 h-4"/></Button>
                   </div>
                )}

                <Button 
                    onClick={handleUploadAndParse} 
                    disabled={!uploadedFile || status === 'uploading' || status === 'parsing'}
                    className="w-full bg-purple-600 hover:bg-purple-500"
                >
                    {status === 'uploading' && <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Uploading...</>}
                    {status === 'parsing' && <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> AI Parsing...</>}
                    {(status === 'idle' || status === 'complete' || status === 'error') && <><FileOutput className="mr-2 h-4 w-4"/> Process File</>}
                </Button>
              </CardContent>
            </Card>

            {/* RIGHT: Results Card */}
            <Card className="bg-black/30 border-white/15 flex flex-col h-[500px]">
              <CardHeader className="pb-2 border-b border-white/10">
                  <div className="flex justify-between items-center">
                      <CardTitle>Extracted Content</CardTitle>
                      {status === 'complete' && <Badge className="bg-green-500/20 text-green-400">Success</Badge>}
                  </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-4 font-mono text-sm text-white/80">
                  {status === 'parsing' && (
                      <div className="h-full flex flex-col items-center justify-center text-white/50 gap-4">
                          <div className="relative w-16 h-16">
                              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <p>Extracting structured data...</p>
                      </div>
                  )}
                  
                  {status === 'error' && (
                      <div className="h-full flex flex-col items-center justify-center text-red-400 gap-2">
                          <AlertCircle className="w-10 h-10" />
                          <p>{error}</p>
                      </div>
                  )}

                  {status === 'complete' && parsedContent ? (
                      <pre className="whitespace-pre-wrap leading-relaxed">{parsedContent}</pre>
                  ) : (
                      status !== 'parsing' && status !== 'error' && <p className="text-white/30 italic">No content processed yet.</p>
                  )}
              </CardContent>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}