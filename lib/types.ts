export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

export interface DetectionResult {
  bbox: BoundingBox;
  confidence: number;
  class_id: number;
  class_name: string;
  has_mask?: boolean;
  segmentation?: number[][];
}

export interface ParsedDate {
  date: string | null;
  confidence: number;
  format: string | null;
  is_valid: boolean;
  is_expired: boolean | null;
  days_until_expiry: number | null;
}

export interface OCRResult {
  text: string;
  confidence: number;
  engine: string;
  processing_time: number;
  crop_original_base64: string;
  crop_processed_base64: string;
}

export interface ProcessImageResponse {
  status: 'success' | 'partial' | 'failed';
  message: string;
  detections: DetectionResult[];
  dates: ParsedDate[];
  best_date: ParsedDate | null;
  processed_at: string;
  ocr_results?: OCRResult[];
}
