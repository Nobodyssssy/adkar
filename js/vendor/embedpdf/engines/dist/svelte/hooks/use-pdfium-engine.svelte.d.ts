import { Logger, PdfEngine } from '@embedpdf/models';
import { FontFallbackConfig } from '../../lib/index.ts';
export interface UsePdfiumEngineProps {
    wasmUrl?: string;
    worker?: boolean;
    logger?: Logger;
    /**
     * Font fallback configuration for handling missing fonts in PDFs.
     * Set to `null` to disable the fallback entirely (no external font requests).
     */
    fontFallback?: FontFallbackConfig | null;
}
export declare function usePdfiumEngine(config?: UsePdfiumEngineProps): {
    engine: PdfEngine | null;
    isLoading: boolean;
    error: Error | null;
};
