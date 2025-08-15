
import { AllValidationResults } from '@/components/veridash/all-validation-results';
import { Separator } from '@/components/ui/separator';

export default function ValidationResultsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          All Validation Results
        </h1>
        <p className="text-muted-foreground mt-1">
          A complete history of all AI-powered identity verifications performed.
        </p>
      </div>
      <AllValidationResults />
    </div>
  );
}
