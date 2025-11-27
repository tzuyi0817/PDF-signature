import type { PDF as P } from '@component-hook/pdf-canvas/vue';

export interface PDF extends P {
  trashDate?: number;
  isUpdate?: boolean;
  height?: number;
  width?: number;
}
