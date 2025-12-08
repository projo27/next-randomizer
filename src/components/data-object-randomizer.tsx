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
  Wand2, Copy, Check, PlusCircle, Trash2, ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRateLimiter } from '@/hooks/use-rate-limiter';
import { useSettings } from '@/context/SettingsContext';
import { useRandomizerAudio } from '@/context/RandomizerAudioContext';
import { useAuth } from '@/context/AuthContext';
import { sendGTMEvent } from '@next/third-parties/google';
import { randomizeObjects } from '@/app/actions/data-object-randomizer-action';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { Switch } from './ui/switch';
import { cn } from '@/lib/utils';

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
  const [inputMode, setInputMode] = useState<'textarea' | 'table'>('textarea');
  const [count, setCount] = useState('1');
  const [results, setResults] = useState<DataObject[] | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [isRateLimited, triggerRateLimit] = useRateLimiter(3000);
  const { animationDuration } = useSettings();
  const { playAudio, stopAudio } = useRandomizerAudio();
  const { user } = useAuth();

  useEffect(() => {
    if (!isRandomizing) {
      stopAudio();
    }
  }, [isRandomizing, stopAudio]);

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

    if (inputMode === 'textarea') {
      try {
        const parsed = JSON.parse(dataText);
        if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");
        currentData = parsed;
        setData(parsed); // Sync table view
      } catch (e: any) {
        setError(`Invalid JSON format: ${e.message}`);
        return;
      }
    } else {
      currentData = data;
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
        return <Image src={String(value)} alt="Data image" width={40} height={40} className="rounded-md object-cover h-10 w-10" unoptimized />;
      case 'urlLink':
        return <Link href={String(value)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex items-center gap-1">{String(value)} <ExternalLink className="h-3 w-3 shrink-0" /></Link>;
      case 'number':
        return <span className="font-mono">{Number(value).toLocaleString()}</span>;
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

        {/* --- Column Definition --- */}
        <div className="space-y-2">
          <Label>1. Define Data Structure</Label>
          <div className="p-4 border rounded-lg space-y-2">
            {columns.map((col) => (
              <div key={col.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Input
                  placeholder="Column Name"
                  value={col.name}
                  onChange={(e) => handleColumnChange(col.id, 'name', e.target.value)}
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
                <Button variant="ghost" size="icon" onClick={() => handleRemoveColumn(col.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddColumn} className="w-full"><PlusCircle className="mr-2" /> Add Column</Button>
          </div>
        </div>

        {/* --- Data Input --- */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>2. Input Your Data (as a JSON array)</Label>
            <div className="flex items-center space-x-2">
              <Label htmlFor="input-mode">Use Textarea</Label>
              <Switch id="input-mode" checked={inputMode === 'textarea'} onCheckedChange={(c) => setInputMode(c ? 'textarea' : 'table')} />
            </div>
          </div>
          {inputMode === 'textarea' ? (
            <Textarea
              value={dataText}
              onChange={(e) => setDataText(e.target.value)}
              rows={10}
              placeholder='[{"column1": "value1"}, {"column1": "value2"}]'
              className="font-mono text-xs"
            />
          ) : (
            <div className="border rounded-lg p-2">
              <p className="text-xs text-muted-foreground p-2">Input via Textarea is recommended for complex or large data sets.</p>
            </div>
          )}
        </div>

        {/* --- Options --- */}
        <div className="space-y-2">
          <Label htmlFor="result-count">3. Number of Results to Pick</Label>
          <Input
            id="result-count"
            type="number"
            min="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        {/* --- Results --- */}
        {(isRandomizing || results) && (
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <Label>Randomized Results</Label>
              {results && <Button variant="ghost" size="icon" onClick={handleCopy}>{isCopied ? <Check className="text-green-500" /> : <Copy />}</Button>}
            </div>
            <div className="border rounded-lg overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => <TableHead key={col.id}>{col.name}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isRandomizing && Array.from({ length: Math.min(3, parseInt(count, 10)) }).map((_, i) => (
                    <TableRow key={i}>
                      {columns.map(col => <TableCell key={col.id}><Skeleton className="h-6 w-full" /></TableCell>)}
                    </TableRow>
                  ))}
                  {!isRandomizing && results?.map((item, index) => (
                    <TableRow key={index} className="animate-fade-in">
                      {columns.map(col => <TableCell key={col.id} className="max-w-[200px] truncate">{renderCell(item, col)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleRandomize} disabled={isRandomizing || isRateLimited} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Wand2 className="mr-2" />
          {isRandomizing ? 'Randomizing...' : isRateLimited ? 'Please wait...' : 'Randomize Data'}
        </Button>
      </CardFooter>
    </Card>
  );
}
