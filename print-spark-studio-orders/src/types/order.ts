export interface FileDetails {
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  copies: number;
  printType: 'color' | 'blackAndWhite';
  specialPaper: 'none' | 'glossy' | 'matte' | 'transparent';
  doubleSided?: boolean;
  binding: {
    needed: boolean;
    type: 'none' | 'spiralBinding' | 'staplingBinding' | 'hardcoverBinding';
  };
  specificRequirements?: string;
}

export interface OrderFormData {
  documentName: string;
  files: FileDetails[];
  description: string;
}
