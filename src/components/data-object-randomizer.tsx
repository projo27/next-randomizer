'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Wand2, Copy, Check, PlusCircle, Trash2, ExternalLink, X, Table2Icon,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { randomizeObjects } from '@/app/actions/data-object-randomizer-action';
import { PresetManager } from "./preset-manager";
import type { DataObjectPresetParams } from "@/types/presets";
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { threwConfetti } from '@/lib/confetti';

type ColumnType = 'text' | 'number' | 'imageUrl' | 'urlLink';
type Column = {
  id: string;
  name: string;
  type: ColumnType;
};
type DataObject = Record<string, any>;

const exampleData = [
  {
    "name": "Vintage Leather Jacket",
    "price": 120,
    "image": "https://picsum.photos/seed/jacket/200/200",
    "link": "https://example.com/jacket"
  },
  {
    "name": "Modern Art Print",
    "price": 45,
    "image": "https://picsum.photos/seed/art/200/200",
    "link": "https://example.com/art"
  },
  {
    "name": "Ergonomic Office Chair",
    "price": 350,
    "image": "https://picsum.photos/seed/chair/200/200",
    "link": "https://example.com/chair"
  }
];

export default function DataObjectRandomizer() {
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'name', type: 'text' },
    { id: '2', name: 'price', type: 'number' },
    { id: '3', name: 'image', type: 'imageUrl' },
    { id: '4', name: 'link', type: 'urlLink' },
  ]);
  const [data, setData] = useState<DataObject[]>(exampleData);
  const [dataText, setDataText] = useState(JSON.stringify(exampleData, null, 2));
  const [count, setCount] = useState('1');
  const [results, setResults] = useState<DataObject[] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration, confettiConfig } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  const getCurrentParams = (): DataObjectPresetParams => ({
    data: dataText,
    count: count,
    columns: columns,
  });

  const handleLoadPreset = (params: any) => {
    const p = params as DataObjectPresetParams;
    setDataText(p.data);
    setCount(p.count);

    if (p.columns && Array.isArray(p.columns)) {
      setColumns(p.columns);
    } else {
      // Fallback: try to auto-detect if columns not saved
      try {
        const parsed = JSON.parse(p.data);
        if (Array.isArray(parsed)) {
          setData(parsed);
          if (parsed.length > 0) {
            const firstItem = parsed[0];
            const newColumns: Column[] = Object.keys(firstItem).map((key) => {
              let type: ColumnType = 'text';
              const val = firstItem[key];
              if (typeof val === 'number') type = 'number';
              else if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
                if (val.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) type = 'imageUrl';
                else type = 'urlLink';
              }
              return { id: Date.now().toString() + Math.random().toString().slice(2, 6), name: key, type };
            });
            setColumns(newColumns);
          }
        }
      } catch (e) {
        console.error("Failed to parse data for column detection", e);
      }
    }

    try {
      const parsed = JSON.parse(p.data);
      if (Array.isArray(parsed)) setData(parsed);
    } catch (e) { }
  };

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

  // --- Auto-detect columns ---
  const detectColumns = (newData: DataObject[]) => {
    if (newData.length === 0) return;
    const firstItem = newData[0];
    const newColumns: Column[] = Object.keys(firstItem).map((key) => {
      // Try to preserve existing type if column exists
      const existing = columns.find(c => c.name === key);
      let type: ColumnType = existing ? existing.type : 'text';

      // Simple type inference
      const val = firstItem[key];
      if (!existing) {
        if (typeof val === 'number') type = 'number';
        else if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('/'))) {
          if (val.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = 'imageUrl';
          else type = 'urlLink';
        }
      }
      return {
        id: existing ? existing.id : Date.now().toString() + Math.random().toString().slice(2, 6),
        name: key,
        type: type,
      };
    });
    setColumns(newColumns);
  };

  const updateData = (newData: DataObject[]) => {
    setData(newData);
    setDataText(JSON.stringify(newData, null, 2));
    setError(null);
    detectColumns(newData);
    toast({ title: 'Data Loaded', description: `Loaded ${newData.length} items and updated columns.` });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error('File must contain a JSON array');
        updateData(json);
      } catch (err: any) {
        setError(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handlePasteSpreadsheet = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) throw new Error('Clipboard needs at least a header row and one data row.');

      const headers = lines[0].split('\t').map(h => h.trim());
      const newItems = lines.slice(1).map(line => {
        const values = line.split('\t');
        const obj: DataObject = {};
        headers.forEach((h, i) => {
          if (values[i]) {
            // Basic number parsing
            const val = values[i].trim();
            const num = Number(val);
            obj[h] = !isNaN(num) && val !== '' ? num : val;
          }
        });
        return obj;
      });

      updateData(newItems);
    } catch (err: any) {
      setError(`Failed to read from clipboard: ${err.message}`);
    }
  };

  const handleCopyInput = () => {
    if (!dataText) return;
    navigator.clipboard.writeText(dataText);
    toast({ title: 'Copied!', description: 'Input data copied to clipboard.' });
  };

  const handleGenerateColumnByInput = () => {
    try {
      if (!dataText) return;
      const parsed = JSON.parse(dataText);
      if (!Array.isArray(parsed)) throw new Error('Text is not a valid JSON array.');

      detectColumns(parsed);
      setData(parsed); // Ensure data state is synced
      toast({ title: 'Structure Generated', description: 'Columns updated based on JSON input.' });
    } catch (err: any) {
      setError(`Failed to generate structure: ${err.message}`);
    }
  };

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { id: Date.now().toString(), name: `col${columns.length + 1}`, type: 'text' },
    ]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((col) => col.id !== id));
  };

  const handleColumnChange = (id: string, field: 'name' | 'type', value: string) => {
    setColumns(
      columns.map((col) => (col.id === id ? { ...col, [field]: value } : col))
    );
  };

  const handleRandomize = async () => {
    sendGTMEvent({ event: 'action_data_object_randomizer', user_email: user?.email ?? 'guest' });
    if (isRandomizing || isRateLimited) return;

    setError(null);
    let currentData = [];

    // Prioritize text area if in that mode and modified, but for now we sync them.
    // We already sync dataText to 'data' state on upload/paste.
    // If user edited text area manually, we need to parse it.
    try {
      const parsed = JSON.parse(dataText);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
      currentData = parsed;
    } catch (e: any) {
      setError(`Invalid JSON format: ${e.message}`);
      return;
    }

    if (currentData.length === 0) {
      setError("Please provide at least one data object.");
      return;
    }

    triggerRateLimit();
    playAudio();
    setIsRandomizing(true);
    setResults(null);
    setIsCopied(false);

    try {
      const randomResults = await randomizeObjects(currentData, parseInt(count, 10));
      setTimeout(() => {
        setResults(randomResults);
        setIsRandomizing(false);
        if (confettiConfig.enabled) {
          threwConfetti({
            particleCount: confettiConfig.particleCount,
            spread: confettiConfig.spread,
          });
        }
      }, animationDuration * 1000);
    } catch (err: any) {
      setError(err.message);
      setIsRandomizing(false);
      stopAudio();
    }
  };

  const handleCopy = () => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    setIsCopied(true);
    toast({ title: 'Copied!', description: 'Result JSON copied to clipboard.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderCell = (item: DataObject, column: Column) => {
    const value = item[column.name];
    if (value === undefined || value === null) return <span className="text-muted-foreground/50">N/A</span>;
    switch (column.type) {
      case 'imageUrl':
        return (
          <div className="relative group cursor-pointer" onClick={() => setZoomedImage(String(value))}>
            <Image
              src={String(value)}
              alt="Data image"
              width={80}
              height={80}
              className="rounded-md object-cover h-10 w-10 md:h-20 md:w-20 transition-transform hover:scale-105"
              unoptimized
            />
          </div>
        );
      case 'urlLink':
        return <Link href={String(value)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center gap-1 max-w-[150px] md:max-w-none">{String(value)} <ExternalLink className="h-3 w-3 shrink-0" /></Link>;
      case 'number':
        return <div className="font-mono w-full text-right">{Number(value).toLocaleString()}</div>;
      case 'text':
      default:
        return String(value);
    }
  };

  return (
    <Card className="w-full shadow-lg border-none">
      <CardHeader>
        <CardTitle>Data Object Randomizer</CardTitle>
        <CardDescription>Define a data structure, provide JSON data, and pick random items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PresetManager
          toolId="data-object"
          currentParams={getCurrentParams()}
          onLoadPreset={handleLoadPreset}
        />

        {/* --- Step 1: Data Input --- */}
        <div className="space-y-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <Label className="text-base font-semibold">1. Input Your Data</Label>
            <div className="flex gap-2">
              <div className="relative">
                <Input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="w-full md:w-auto"><PlusCircle className="mr-2 h-4 w-4" /> Upload JSON</Button>
              </div>
              <Button variant="outline" size="sm" onClick={handlePasteSpreadsheet} className="w-full md:w-auto"><Copy className="mr-2 h-4 w-4" /> Paste Spreadsheet</Button>
            </div>
          </div>
          <div className="relative">
            <Textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              rows={10}
              placeholder='[{"column1": "value1"}, {"column1": "value2"}]'
              className="font-mono text-xs"
            />
            <div className="flex flex-row">
              <Button variant="ghost" size="icon" onClick={handleCopyInput} className="absolute top-2 right-4" title="Copy Json Data"><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={handleGenerateColumnByInput} className="absolute top-10 right-4" title="Generate Column By Json Data"><Table2Icon className="h-4 w-4" /></Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Paste JSON directly, or use buttons to import. Spreadsheet data should have headers in the first row.</p>
        </div>

        {/* --- Step 2: Column Definition --- */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">2. Define Data Structure</Label>
          <div className="p-4 border space-y-2 rounded-lg bg-muted/30">
            <div className="space-y-2 max-h-[400px] overflow-y-auto p-1">
              {columns.map((col) => (
                <div key={col.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                  <Input
                    placeholder="Column Name"
                    value={col.name}
                    onChange={(e) => handleColumnChange(col.id, 'name', e.target.value)}
                  // className="ml-2"
                  />
                  <Select value={col.type} onValueChange={(v) => handleColumnChange(col.id, 'type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="imageUrl">Image URL</SelectItem>
                      <SelectItem value="urlLink">Link URL</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveColumn(col.id)} className="h-8 w-8 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleAddColumn} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Column</Button>
          </div>
        </div>

        {/* --- Step 3: Options --- */}
        <div className="space-y-2">
          <Label htmlFor="result-count" className="text-base font-semibold">3. Number of Results</Label>
          <Input
            id="result-count"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="max-w-[100px]"
          />
        </div>

        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {/* --- Results --- */}
        {(isRandomizing || results) && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label className="text-lg">Results</Label>
              {results && <Button variant="ghost" size="sm" onClick={handleCopy}>{isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />} Copy JSON Result</Button>}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => <TableHead key={col.id}>{col.name}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRandomizing && Array.from({ length: Math.min(3, parseInt(count, 10)) }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map(col => <TableCell key={col.id}><Skeleton className="h-10 w-full" /></TableCell>)}
                    </TableRow>
                  ))}
                  {!isRandomizing && results?.map((item, index) => (
                    <TableRow key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      {columns.map(col => <TableCell key={col.id} className="max-w-[300px] truncate">{renderCell(item, col)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {isRandomizing && Array.from({ length: Math.min(3, parseInt(count, 10)) }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
              {!isRandomizing && results?.map((item, index) => (
                <div key={index} className="bg-card border rounded-lg p-4 space-y-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {columns.map(col => (
                    <div key={col.id} className="flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">{col.name}</span>
                      <div className="text-sm">{renderCell(item, col)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          id="randomize-button"
          variant="default"
          onClick={handleRandomize}
          disabled={isRandomizing || isRateLimited}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wand2 className="mr-2 h-5 w-5" />
          {isRandomizing ? 'Randomizing...' : isRateLimited ? 'Please wait...' : 'Randomize Data'}
        </Button>
      </CardFooter>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-md" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full" onClick={(e) => { e.stopPropagation(); setZoomedImage(null); }}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
