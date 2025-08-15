
import { CheckCircle2, XCircle, AlertTriangle, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ValidationResult as ValidationResultType } from "@/lib/types";
import { Button } from "../ui/button";

interface ValidationResultProps {
  result: ValidationResultType;
}

function ResultItem({ label, isValid }: { label: string; isValid?: boolean }) {
  if (typeof isValid !== 'boolean') return null;

  return (
    <div className="flex items-center justify-between py-3 px-4">
      <p className="text-sm font-medium">{label}</p>
      {isValid ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span>Valid</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-5 w-5" />
          <span>Invalid</span>
        </div>
      )}
    </div>
  );
}

export function ValidationResult({ result }: ValidationResultProps) {
  
  const handleDownload = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;

    let moduleName = "validation";
    if (result.isAadhaar) moduleName = 'aadhar_card_validation';
    else if (result.isPan) moduleName = 'pan_validation';
    else if (result.isBank) moduleName = 'bank_validation';
    else if (result.isVoterId) moduleName = 'voter_id_validation';
    else if (result.isDrivingLicence) moduleName = 'driving_licence_validation';

    link.download = `${moduleName}_result_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  if (result.error) {
    return (
       <Card className="border-destructive bg-destructive/10">
        <CardHeader className="px-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle className="text-destructive">Validation Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <p className="text-sm text-destructive/90">{result.validationDetails}</p>
        </CardContent>
         <CardFooter className="px-6">
          <Button variant="ghost" onClick={handleDownload} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Download className="mr-2 h-4 w-4" />
            Download Error Details (JSON)
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const hasIndividualChecks = result.isAadhaar || result.isPan || result.isBank || result.isVoterId || result.isDrivingLicence;

  return (
    <Card>
      <CardHeader className="px-6">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Final Validation Result</CardTitle>
                <CardDescription className="mt-1">AI-powered analysis of your document.</CardDescription>
            </div>
            <Badge variant={result.overallValidation ? "default" : "destructive"} className={result.overallValidation ? "bg-green-600 hover:bg-green-700" : ""}>
                {result.overallValidation ? "Success" : "Failed"}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        {hasIndividualChecks && (
           <div className="rounded-md border divide-y">
            <ResultItem label="Name Match" isValid={result.isNameValid} />
            {typeof result.isFathersNameValid === 'boolean' && <ResultItem label="Father's Name Match" isValid={result.isFathersNameValid} />}
            {(result.isAadhaar || result.isPan || result.isVoterId || result.isDrivingLicence) && <ResultItem label="Date of Birth Match" isValid={result.isDobValid} />}
            {(result.isAadhaar || result.isPan || result.isVoterId || result.isDrivingLicence) && <ResultItem label="Document Number Match" isValid={result.isDocumentNumberValid} />}
            {result.isBank && <ResultItem label="Account Number Match" isValid={result.isAccountNumberValid} />}
            {result.isBank && <ResultItem label="IFSC Code Match" isValid={result.isIfscCodeValid} />}
            {result.isBank && <ResultItem label="Branch Name Match" isValid={result.isBranchNameValid} />}
            {(result.isVoterId || result.isDrivingLicence) && <ResultItem label="Gender Match" isValid={result.isGenderValid} />}
            {result.isVoterId && <ResultItem label="State Match" isValid={result.isStateValid} />}
            {result.isVoterId && <ResultItem label="District Match" isValid={result.isDistrictValid} />}
            {(result.isVoterId || result.isDrivingLicence) && <ResultItem label="Address Match" isValid={result.isAddressValid} />}
            {result.isDrivingLicence && <ResultItem label="Date of Issue Match" isValid={result.isDateOfIssueValid} />}
            {result.isDrivingLicence && <ResultItem label="Expiry Date Match" isValid={result.isValidTillValid} />}
            {result.isDrivingLicence && <ResultItem label="Blood Group Match" isValid={result.isBloodGroupValid} />}
            {result.isDrivingLicence && <ResultItem label="State of Issue Match" isValid={result.isStateOfIssueValid} />}
           </div>
        )}
        
        <div>
            <h4 className="text-sm font-semibold mb-2">AI Validation Details:</h4>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{result.validationDetails}</p>
        </div>
      </CardContent>
    </Card>
  );
}
