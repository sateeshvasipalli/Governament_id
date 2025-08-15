
"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Loader2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ValidationResult } from './validation-result';
import type { ValidationResult as ValidationResultType } from '@/lib/types';
import { cn } from '@/lib/utils';

type AggregatedResult = {
  id: string;
  category: "Aadhar Card" | "PAN" | "Bank" | "Voter ID Card" | "Driving Licence";
  documentName: string;
  createdAt: { seconds: number; nanoseconds: number; } | null;
  result: ValidationResultType;
};


export function AllValidationResults() {
  const [results, setResults] = useState<AggregatedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<AggregatedResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    const q = query(collection(db, "validationResults"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedResults = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AggregatedResult));
    setResults(fetchedResults);
    setLoading(false);
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const getStatus = (result: AggregatedResult['result']) => {
    if (result.error) return <Badge variant="destructive">Error</Badge>;
    if (result.overallValidation) return <Badge className="bg-green-600 hover:bg-green-700 text-white">Success</Badge>;
    return <Badge variant="destructive">Failed</Badge>;
  };
  
  const downloadJson = (content: object, filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(content, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;
    link.click();
  };

  const handleDownloadAll = () => {
    const data = results.map(res => {
       const { id, ...rest } = res;
       return rest;
    });
    downloadJson(data, `all_validation_results_${new Date().toISOString()}.json`);
  };
  
  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteDoc(doc(db, "validationResults", id));
      fetchResults(); // Refresh results after deletion
  }

  const handleViewDetails = (result: AggregatedResult) => {
    setSelectedResult(result);
    setIsDialogOpen(true);
  };

  if (loading) {
     return (
        <Card>
            <CardHeader>
                 <CardTitle>Validation Results</CardTitle>
                 <CardDescription>Loading validation history from the database...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (results.length === 0) {
    return (
        <Card>
            <CardHeader>
                 <CardTitle>Validation Results</CardTitle>
                 <CardDescription>All your final validation results will appear here after submission.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>No validation results yet.</p>
                    <p className="text-sm">Complete a validation in one of the modules above.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>
                  A summary of all completed validations from the database.
                </CardDescription>
            </div>
             <Button onClick={fetchResults} variant="outline" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
             </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Document No.</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {results.map((res) => (
                <TableRow key={res.id}>
                    <TableCell className="font-medium">{res.category}</TableCell>
                    <TableCell className="text-muted-foreground">{res.result.isAadhaar || res.result.isPan || res.result.isVoterId || res.result.isDrivingLicence ? res.result.extractedDocumentNumber : res.result.extractedAccountNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{res.createdAt ? format(new Date(res.createdAt.seconds * 1000), "dd/MM/yyyy HH:mm") : 'N/A'}</TableCell>
                    <TableCell>{getStatus(res.result)}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(res)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Details
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" title="Delete Result">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this validation result from the database.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={(e) => handleDelete(e, res.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </CardContent>
      {results.length > 0 && (
        <CardFooter className="border-t pt-6">
            <Button onClick={handleDownloadAll}>
            <Download className="mr-2 h-4 w-4" />
            Download All Results (JSON)
            </Button>
        </CardFooter>
      )}
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Validation Details</DialogTitle>
                 {selectedResult && (
                    <DialogDescription>
                        Full report for {selectedResult.category} validation performed on {selectedResult.createdAt ? format(new Date(selectedResult.createdAt.seconds * 1000), "PPP p") : 'N/A'}.
                    </DialogDescription>
                 )}
            </DialogHeader>
            {selectedResult && (
                <div className="space-y-4">
                    <ValidationResult result={selectedResult.result} />
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-4">
                        {selectedResult.result.extractedText && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const txtString = `data:text/plain;charset=utf-8,${encodeURIComponent(selectedResult.result.extractedText ?? '')}`;
                                    const link = document.createElement("a");
                                    link.href = txtString;
                                    link.download = `${selectedResult.id}_extracted.txt`;
                                    link.click();
                                }}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Extracted Text
                            </Button>
                        )}
                        {selectedResult.result.nlpAnalysis && (
                             <Button
                                variant="outline"
                                onClick={() => downloadJson(selectedResult.result.nlpAnalysis ?? {}, `${selectedResult.id}_analysis.json`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                NLP Analysis (JSON)
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => downloadJson(selectedResult, `${selectedResult.id}_full_report.json`)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Full Report (JSON)
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}

    