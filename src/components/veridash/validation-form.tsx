
"use client";

import { useState, useMemo } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z, ZodType } from "zod";

import type { ValidationResult as ValidationResultType, PreValidationResult } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "@/components/veridash/file-uploader";
import { FormStatus } from "@/components/veridash/form-status";
import { ValidationResult } from "@/components/veridash/validation-result";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Check, X, Loader2 } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format as formatDate } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

export type FieldOption = {
    value: string;
    label: string;
};

export type FieldConfig = {
    name: string;
    label: string;
    placeholder?: string;
    type: 'text' | 'date' | 'select' | 'textarea';
    className?: string;
    gridClass?: string;
    options?: FieldOption[];
}

type AnyZodSchema = ZodType<any, any, any>;

interface ValidationFormProps<T extends AnyZodSchema> {
  schema: T;
  fields: FieldConfig[];
  documentLabel: string;
  preValidateAction: (formData: FormData) => Promise<PreValidationResult>;
  validateAction: (formData: FormData) => Promise<ValidationResultType>;
  validationCategory: "Aadhar Card" | "PAN" | "Bank" | "Voter ID Card" | "Driving Licence";
}

export function ValidationForm<T extends AnyZodSchema>({
  schema,
  fields,
  documentLabel,
  preValidateAction,
  validateAction,
  validationCategory
}: ValidationFormProps<T>) {

  type SchemaType = z.infer<T>;

  const [finalResult, setFinalResult] = useState<ValidationResultType | null>(null);
  const [preValidationResult, setPreValidationResult] = useState<PreValidationResult | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isPreValidating, setIsPreValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const currentYear = new Date().getFullYear();

  const defaultValues = useMemo(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach(field => {
        initialValues[field.name] = '';
    });
    initialValues['document'] = null;
    return initialValues as SchemaType;
  }, [fields]);

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });
  
  const handlePreValidation = async () => {
    setFinalResult(null);
    setPreValidationResult(null);
    setIsVerified(false);
    form.clearErrors();

    const isFormValid = await form.trigger();
    if (!isFormValid) {
       toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill all required fields correctly before verifying.",
      });
      return;
    }
    
    const values = form.getValues();
    if (!values.document) {
        form.setError("document" as any, { type: "manual", message: `${documentLabel} is required.` });
        return;
    }
    
    setIsPreValidating(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
        if (value) {
            formData.append(key, value as string | Blob);
        }
    });

    try {
        const result = await preValidateAction(formData);
        setPreValidationResult(result);
        
        if (result.success) {
            setIsVerified(true);
            toast({
                title: "Verification Successful",
                description: "All details match the document. You can now submit.",
                className: "bg-green-100 border-green-300 text-green-800",
            });
            await onSubmit(form.getValues());
        } else {
            setIsVerified(false);
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: result.message || "One or more fields do not match the document. Please check the errors below.",
            });
            
            const extracted = result.extractedData;

            if(result.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (errors && errors.length > 0) {
                        form.setError(field as any, { type: 'manual', message: errors[0] });
                    }
                });
            }
            
            const setErrorForMismatch = (fieldName: any, isValid: boolean | undefined, extractedValue: string | undefined) => {
                 if (isValid === false) {
                    const message = `Value does not match document. Document has: '${extractedValue || "N/A"}'`;
                    form.setError(fieldName, { type: 'manual', message });
                }
            }

            const nameIsValid = result.fieldValidation?.isNameValid;
            if(nameIsValid === false) {
                const msg = `Name does not match document. Document has: '${extracted?.name || 'N/A'}'`;
                form.setError('firstName' as any, { type: 'manual', message: msg });
                form.setError('lastName' as any, { type: 'manual', message: msg });
            }

            setErrorForMismatch('fathersName', result.fieldValidation?.isFathersNameValid, extracted?.fathersName);
            setErrorForMismatch('dob', result.fieldValidation?.isDobValid, extracted?.dob);

            const docNumIsValid = result.fieldValidation?.isDocumentNumberValid;
            if(docNumIsValid === false) {
                 const msg = `Number does not match document. Document has: '${extracted?.documentNumber || 'N/A'}'`;
                 if ('aadhaarNumber' in values) form.setError('aadhaarNumber' as any, { type: 'manual', message: msg });
                 if ('panNumber' in values) form.setError('panNumber' as any, { type: 'manual', message: msg });
                 if ('voterIdNumber' in values) form.setError('voterIdNumber' as any, { type: 'manual', message: msg });
                 if ('drivingLicenceNumber' in values) form.setError('drivingLicenceNumber' as any, { type: 'manual', message: msg });
            }

            setErrorForMismatch('accountNumber', result.fieldValidation?.isAccountNumberValid, extracted?.accountNumber);
            setErrorForMismatch('ifscCode', result.fieldValidation?.isIfscCodeValid, extracted?.ifscCode);
            setErrorForMismatch('branchName', result.fieldValidation?.isBranchNameValid, extracted?.branchName);
            setErrorForMismatch('gender', result.fieldValidation?.isGenderValid, extracted?.gender);
            setErrorForMismatch('state', result.fieldValidation?.isStateValid, extracted?.state);
            setErrorForMismatch('district', result.fieldValidation?.isDistrictValid, extracted?.district);
            setErrorForMismatch('address', result.fieldValidation?.isAddressValid, extracted?.address);
            setErrorForMismatch('mobileNumber', result.fieldValidation?.isMobileNumberValid, extracted?.mobileNumber);
            setErrorForMismatch('dateOfIssue', result.fieldValidation?.isDateOfIssueValid, extracted?.dateOfIssue);
            setErrorForMismatch('validTill', result.fieldValidation?.isValidTillValid, extracted?.validTill);
            setErrorForMismatch('bloodGroup', result.fieldValidation?.isBloodGroupValid, extracted?.bloodGroup);
            setErrorForMismatch('stateOfIssue', result.fieldValidation?.isStateOfIssueValid, extracted?.stateOfIssue);
        }
    } catch (e) {
        setIsVerified(false);
        toast({
            variant: "destructive",
            title: "Error",
            description: "An unexpected error occurred during pre-validation."
        });
    } finally {
        setIsPreValidating(false);
    }
  }

  const onSubmit: SubmitHandler<SchemaType> = async (values) => {
    if (!values.document) {
        form.setError("document" as any, { type: "manual", message: `${documentLabel} is required.` });
        return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setFinalResult(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value as string | Blob);
      }
    });

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
    }, 500);

    try {
      const res = await validateAction(formData);
      setFinalResult(res);
      
       if (res.error) {
        toast({
            variant: "destructive",
            title: "Validation Failed",
            description: res.validationDetails,
        });
      } else {
        toast({
          title: "Success",
          description: "Validation result has been saved to the database.",
          className: "bg-green-100 border-green-300 text-green-800",
        });
      }
    } catch (error) {
      console.error(error);
      const errorResult: ValidationResultType = {
        overallValidation: false,
        validationDetails: "An unexpected client-side error occurred.",
        error: (error as Error).message,
        isDocumentTypeValid: false,
        documentTypeValidationDetails: 'Client-side exception',
        extractedName: '',
        [validationCategory.toLowerCase().replace(/ /g, '') as string]: true,
      };
      setFinalResult(errorResult);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Something went wrong during validation. Please try again.",
      });
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setIsSubmitting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };
  
  const getValidationStatusForField = (fieldName: string) => {
    if (form.formState.dirtyFields[fieldName as keyof SchemaType] || !preValidationResult) {
      return undefined;
    }
    
    if (preValidationResult.success) {
      return true;
    }

    if (form.formState.errors[fieldName as keyof SchemaType]) {
      return false;
    }

    // Check specific fields from preValidationResult.fieldValidation
    const fieldValidation = preValidationResult.fieldValidation;
    if (!fieldValidation) return undefined;
    
    const nameMap: { [key: string]: keyof typeof fieldValidation | undefined } = {
        firstName: 'isNameValid',
        lastName: 'isNameValid',
        fathersName: 'isFathersNameValid',
        dob: 'isDobValid',
        aadhaarNumber: 'isDocumentNumberValid',
        panNumber: 'isDocumentNumberValid',
        voterIdNumber: 'isDocumentNumberValid',
        drivingLicenceNumber: 'isDocumentNumberValid',
        accountNumber: 'isAccountNumberValid',
        ifscCode: 'isIfscCodeValid',
        branchName: 'isBranchNameValid',
        gender: 'isGenderValid',
        state: 'isStateValid',
        district: 'isDistrictValid',
        address: 'isAddressValid',
        mobileNumber: 'isMobileNumberValid',
        dateOfIssue: 'isDateOfIssueValid',
        validTill: 'isValidTillValid',
        bloodGroup: 'isBloodGroupValid',
        stateOfIssue: 'isStateOfIssueValid',
    };

    const validationKey = nameMap[fieldName];
    if (validationKey && typeof fieldValidation[validationKey] === 'boolean') {
        return fieldValidation[validationKey];
    }
    
    return true; // If no specific error and not dirty, assume it's valid for UI purposes
  };


  const parseDate = (dateString: string | Date): Date | undefined => {
    if (!dateString) return undefined;
    if (dateString instanceof Date) return dateString;

    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(p => parseInt(p, 10));
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
    const date = new Date(dateString);
    return isNaN(date.valueOf()) ? undefined : date;
  }
  
  const renderField = (fieldConfig: FieldConfig, field: any) => {
    switch (fieldConfig.type) {
        case 'date':
            const isFutureDateField = fieldConfig.name === 'validTill';
            const toYear = isFutureDateField ? currentYear + 20 : currentYear;
            const disabledDate = (date: Date) => {
                if (isFutureDateField) {
                    return date < new Date("1900-01-01");
                }
                return date > new Date() || date < new Date("1900-01-01");
            }
            
            return isMobile ? (
                <Input
                    type="date"
                    value={field.value ? formatDate(parseDate(field.value) || new Date(), 'yyyy-MM-dd') : ''}
                    onChange={(e) => field.onChange(e.target.value ? formatDate(new Date(e.target.value), 'dd/MM/yyyy') : '')}
                    disabled={isSubmitting || isPreValidating}
                    className="block w-full"
                />
            ) : (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            disabled={isSubmitting || isPreValidating}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? field.value : <span>{fieldConfig.placeholder}</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1924}
                            toYear={toYear}
                            selected={parseDate(field.value)}
                            onSelect={(date) => field.onChange(date ? formatDate(date, 'dd/MM/yyyy') : '')}
                            disabled={disabledDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            );
        case 'select':
            return (
                <Select 
                  onValueChange={(value) => {
                      field.onChange(value);
                      setIsVerified(false);
                      setPreValidationResult(null);
                  }}
                  defaultValue={field.value} 
                  disabled={isSubmitting || isPreValidating}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={fieldConfig.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {fieldConfig.options?.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case 'textarea':
             return (
                <Textarea
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    onChange={(e) => {
                        field.onChange(e);
                        setIsVerified(false);
                        setPreValidationResult(null);
                    }}
                    className={fieldConfig.className}
                    disabled={isSubmitting || isPreValidating}
                />
            );
        case 'text':
        default:
            return (
                <Input
                    type="text"
                    placeholder={fieldConfig.placeholder}
                    {...field}
                     onChange={(e) => {
                        field.onChange(e);
                        setIsVerified(false);
                        setPreValidationResult(null);
                    }}
                    className={fieldConfig.className}
                    disabled={isSubmitting || isPreValidating}
                />
            );
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {preValidationResult && !preValidationResult.success && preValidationResult.message && (
                <Alert variant="destructive">
                    <AlertTitle>Verification Failed</AlertTitle>
                    <AlertDescription>
                        {preValidationResult.message}
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((fieldConfig) => (
                <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name as any}
                    render={({ field }) => (
                        <FormItem className={fieldConfig.gridClass}>
                            <FormLabel>{fieldConfig.label}</FormLabel>
                             <div className="relative">
                                <FormControl>
                                    {renderField(fieldConfig, field)}
                                </FormControl>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <ValidationStatusIcon status={getValidationStatusForField(fieldConfig.name)} />
                                </div>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
            </div>

            <FormField
                control={form.control}
                name={"document" as any}
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{documentLabel}</FormLabel>
                    <FormControl>
                    <FileUploader 
                        onChange={(file) => {
                            field.onChange(file);
                            setIsVerified(false);
                            setPreValidationResult(null);
                        }} 
                        value={field.value}
                        disabled={isSubmitting || isPreValidating}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={handlePreValidation} disabled={isPreValidating || isSubmitting}>
                {isPreValidating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Details"}
                </Button>
            </div>
        </form>
      </Form>
      
      {isSubmitting && <FormStatus isLoading={isSubmitting} progress={progress} />}
      
      {finalResult && !isSubmitting && <ValidationResult result={finalResult} />}
    </div>
  );
}

const ValidationStatusIcon = ({ status }: { status: boolean | undefined }) => {
  if (status === undefined) return null;
  return status ? (
    <Check className="h-5 w-5 text-green-500" />
  ) : (
    <X className="h-5 w-5 text-destructive" />
  );
};
